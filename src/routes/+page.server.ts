import { and, eq } from 'drizzle-orm';
import { del } from '@vercel/blob';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { achievement, achievementImage } from '$lib/server/db/schema';
import { isDistanceLabel } from '$lib/data/distances';
import { getUserAchievementMedals } from '$lib/server/achievements';
import { uploadAchievementImages } from '$lib/server/uploads';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			achievements: []
		};
	}

	return {
		achievements: await getUserAchievementMedals(locals.user.id)
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
		const files = formData
			.getAll('images')
			.filter((value): value is File => value instanceof File && value.size > 0);

		if (!title) {
			return fail(400, {
				createAchievement: { success: false },
				message: 'Title is required.'
			});
		}

		if (distanceLabel && !isDistanceLabel(distanceLabel)) {
			return fail(400, {
				createAchievement: { success: false },
				message: 'Choose a valid distance.'
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

		const uploadedImages = await (async () => {
			try {
				return await uploadAchievementImages(files, {
					userId: locals.user.id,
					title
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Image upload failed.';
				return fail(400, {
					createAchievement: { success: false },
					message
				});
			}
		})();

		if ('status' in uploadedImages) {
			return uploadedImages;
		}

		try {
			const [createdAchievement] = await db
				.insert(achievement)
				.values({
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
					imageUrl: uploadedImages[0]?.fullUrl ?? null
				})
				.returning({ id: achievement.id });

			if (uploadedImages.length) {
				await db.insert(achievementImage).values(
					uploadedImages.map((image) => ({
						achievementId: createdAchievement.id,
						fullUrl: image.fullUrl,
						thumbnailUrl: image.thumbnailUrl,
						sortOrder: image.sortOrder,
						width: image.width,
						height: image.height,
						thumbnailWidth: image.thumbnailWidth,
						thumbnailHeight: image.thumbnailHeight
					}))
				);
			}
		} catch (error) {
			if (uploadedImages.length) {
				await del(
					uploadedImages.flatMap((image) => [image.fullUrl, image.thumbnailUrl]),
					{
						token: env.BLOB_READ_WRITE_TOKEN
					}
				);
			}

			throw error;
		}

		return {
			createAchievement: { success: true }
		};
	},
	deleteAchievement: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, {
				deleteAchievement: { success: false },
				message: 'Please sign in before deleting an achievement.'
			});
		}

		const formData = await request.formData();
		const achievementId = Number(formData.get('achievementId'));

		if (!Number.isInteger(achievementId) || achievementId <= 0) {
			return fail(400, {
				deleteAchievement: { success: false },
				message: 'Choose a valid achievement to delete.'
			});
		}

		const [existingAchievement] = await db
			.select({
				id: achievement.id,
				imageUrl: achievement.imageUrl
			})
			.from(achievement)
			.where(and(eq(achievement.id, achievementId), eq(achievement.userId, locals.user.id)))
			.limit(1);

		if (!existingAchievement) {
			return fail(404, {
				deleteAchievement: { success: false },
				message: 'Achievement not found.'
			});
		}

		const images = await db
			.select({
				fullUrl: achievementImage.fullUrl,
				thumbnailUrl: achievementImage.thumbnailUrl
			})
			.from(achievementImage)
			.where(eq(achievementImage.achievementId, achievementId));

		await db.delete(achievement).where(eq(achievement.id, achievementId));

		const blobUrls = Array.from(
			new Set(
				[
					existingAchievement.imageUrl,
					...images.flatMap((image) => [image.fullUrl, image.thumbnailUrl])
				].filter((value): value is string => Boolean(value))
			)
		);

		if (blobUrls.length && env.BLOB_READ_WRITE_TOKEN) {
			await del(blobUrls, { token: env.BLOB_READ_WRITE_TOKEN });
		}

		return {
			deleteAchievement: { success: true, id: achievementId }
		};
	}
};
