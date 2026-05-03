import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { achievement } from '$lib/server/db/schema';
import type { Medal } from '$lib/types/medal';

function toDisplayDate(value: string | null) {
	if (!value) return undefined;

	const date = new Date(`${value}T00:00:00Z`);
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}

function toMedal(record: typeof achievement.$inferSelect): Medal {
	return {
		id: record.id,
		title: record.title,
		tag: 'Personal Entry',
		distanceLabel: record.distanceLabel ?? undefined,
		eventDate: toDisplayDate(record.eventDate),
		location: record.location ?? undefined,
		finishTime: record.finishTime ?? undefined,
		pace: record.pace ?? undefined,
		placement: record.placement ?? undefined,
		stravaUrl: record.stravaUrl ?? undefined,
		description: record.description ?? undefined,
		src: record.imageUrl ?? undefined,
		thumbnailSrc: record.imageUrl ?? undefined,
		fullSrc: record.imageUrl ?? undefined
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			achievements: []
		};
	}

	const achievements = await db
		.select()
		.from(achievement)
		.where(eq(achievement.userId, locals.user.id))
		.orderBy(desc(achievement.eventDate), desc(achievement.id));

	return {
		achievements: achievements.map(toMedal)
	};
};

export const actions: Actions = {
	createAchievement: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, {
				createAchievement: { success: false },
				message: 'Please sign in before adding an achievement.'
			});
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const distanceLabel = formData.get('distanceLabel')?.toString().trim() ?? '';
		const eventDate = formData.get('eventDate')?.toString().trim() ?? '';
		const location = formData.get('location')?.toString().trim() ?? '';
		const finishTime = formData.get('finishTime')?.toString().trim() ?? '';
		const pace = formData.get('pace')?.toString().trim() ?? '';
		const placement = formData.get('placement')?.toString().trim() ?? '';
		const stravaUrl = formData.get('stravaUrl')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() ?? '';
		const imageUrl = formData.get('imageUrl')?.toString().trim() ?? '';

		if (!title) {
			return fail(400, {
				createAchievement: { success: false },
				message: 'Title is required.'
			});
		}

		if (stravaUrl) {
			try {
				new URL(stravaUrl);
			} catch {
				return fail(400, {
					createAchievement: { success: false },
					message: 'Strava URL must be a valid absolute URL.'
				});
			}
		}

		if (imageUrl) {
			try {
				new URL(imageUrl);
			} catch {
				if (!imageUrl.startsWith('/')) {
					return fail(400, {
						createAchievement: { success: false },
						message: 'Image URL must be an absolute URL or a local /static path.'
					});
				}
			}
		}

		await db.insert(achievement).values({
			userId: locals.user.id,
			title,
			distanceLabel: distanceLabel || null,
			eventDate: eventDate || null,
			location: location || null,
			finishTime: finishTime || null,
			pace: pace || null,
			placement: placement || null,
			stravaUrl: stravaUrl || null,
			description: description || null,
			imageUrl: imageUrl || null
		});

		return {
			createAchievement: { success: true }
		};
	}
};
