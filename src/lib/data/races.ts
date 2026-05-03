import type { Medal } from '$lib/types/medal';
import { DISTANCES } from '$lib/data/distances';

export const upcomingRaces = [
	{
		title: 'Ciudad de Sorsogon Marathon',
		distanceLabel: DISTANCES.FULL_MARATHON,
		eventDate: 'June 14, 2026',
		location: 'Sorsogon City',
		tag: 'Upcoming Race'
	},
	{
		title: 'Albay Marathon',
		distanceLabel: DISTANCES.FULL_MARATHON,
		eventDate: 'July 12, 2026',
		location: 'Libon, Albay',
		tag: 'Upcoming Race'
	}
] satisfies Medal[];
