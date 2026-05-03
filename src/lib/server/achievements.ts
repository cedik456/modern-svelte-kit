import { asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { achievement, achievementImage } from '$lib/server/db/schema';
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

export function toMedal(
	record: typeof achievement.$inferSelect,
	images: (typeof achievementImage.$inferSelect)[]
): Medal {
	const medalImages = images.map((image) => ({
		id: image.id,
		src: image.thumbnailUrl,
		thumbnailSrc: image.thumbnailUrl,
		fullSrc: image.fullUrl,
		width: image.width ?? undefined,
		height: image.height ?? undefined,
		thumbnailWidth: image.thumbnailWidth ?? undefined,
		thumbnailHeight: image.thumbnailHeight ?? undefined
	}));
	const coverImage = medalImages[0];

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
		src: coverImage?.thumbnailSrc ?? record.imageUrl ?? undefined,
		thumbnailSrc: coverImage?.thumbnailSrc ?? record.imageUrl ?? undefined,
		fullSrc: coverImage?.fullSrc ?? record.imageUrl ?? undefined,
		images: medalImages
	};
}

export async function getUserAchievementMedals(userId: string) {
	const achievements = await db
		.select()
		.from(achievement)
		.where(eq(achievement.userId, userId))
		.orderBy(desc(achievement.eventDate), desc(achievement.id));

	const images = achievements.length
		? await db
				.select()
				.from(achievementImage)
				.where(
					inArray(
						achievementImage.achievementId,
						achievements.map((entry) => entry.id)
					)
				)
				.orderBy(asc(achievementImage.sortOrder), asc(achievementImage.id))
		: [];

	const imagesByAchievement = new Map<number, (typeof achievementImage.$inferSelect)[]>();
	for (const image of images) {
		const current = imagesByAchievement.get(image.achievementId) ?? [];
		current.push(image);
		imagesByAchievement.set(image.achievementId, current);
	}

	return achievements.map((entry) => toMedal(entry, imagesByAchievement.get(entry.id) ?? []));
}
