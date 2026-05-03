export const DISTANCES = {
	FULL_MARATHON: 'Full Marathon',
	HALF_MARATHON: 'Half Marathon',
	THIRTY_KILOMETER_RUN: '30 Kilometer Run',
	TWENTY_FIVE_KILOMETER_RUN: '25 Kilometer Run',
	SIXTEEN_KILOMETER_RUN: '16 Kilometer Run',
	TEN_MILE_RUN: '10-Mile Run',
	TEN_KILOMETER_RUN: '10 Kilometer Run'
} as const;

export const DISTANCE_OPTIONS = Object.values(DISTANCES);

export type DistanceLabel = (typeof DISTANCE_OPTIONS)[number];

export function isDistanceLabel(value: string): value is DistanceLabel {
	return DISTANCE_OPTIONS.includes(value as DistanceLabel);
}
