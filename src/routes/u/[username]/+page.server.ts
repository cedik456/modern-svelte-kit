import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { getUserAchievementMedals } from '$lib/server/achievements';

export const load: PageServerLoad = async ({ params }) => {
	const username = params.username.toLowerCase();
	const [profile] = await db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image
		})
		.from(user)
		.where(eq(user.username, username))
		.limit(1);

	if (!profile || !profile.username) {
		throw error(404, 'Profile not found');
	}

	const achievements = await getUserAchievementMedals(profile.id);
	const distanceCounts = new Map<string, number>();
	for (const achievement of achievements) {
		if (!achievement.distanceLabel) continue;
		distanceCounts.set(
			achievement.distanceLabel,
			(distanceCounts.get(achievement.distanceLabel) ?? 0) + 1
		);
	}

	const favoriteDistance =
		[...distanceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

	return {
		profile: {
			name: profile.name,
			username: profile.username,
			image: profile.image
		},
		achievements,
		stats: {
			totalAchievements: achievements.length,
			latestAchievement: achievements[0]?.title ?? null,
			favoriteDistance
		}
	};
};
