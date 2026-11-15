export const TIME_WARP_FACTORS = [1, 10, 100, 1000, 10000, 100000] as const;

export type TimeWarpFactor = (typeof TIME_WARP_FACTORS)[number];

export const CRUISE_TIME_WARP_FACTORS = [
	...TIME_WARP_FACTORS,
	1_000_000,
	10_000_000,
	100_000_000,
] as const;

export type CruiseTimeWarpFactor = (typeof CRUISE_TIME_WARP_FACTORS)[number];

export function isTimeWarpFactor(value: number): value is TimeWarpFactor {
	return (TIME_WARP_FACTORS as readonly number[]).includes(value);
}

export function nextTimeWarp(current: TimeWarpFactor): TimeWarpFactor {
	const index = TIME_WARP_FACTORS.indexOf(current);
	const next_index = Math.min(index + 1, TIME_WARP_FACTORS.length - 1);
	return TIME_WARP_FACTORS[next_index];
}

export function previousTimeWarp(current: TimeWarpFactor): TimeWarpFactor {
	const index = TIME_WARP_FACTORS.indexOf(current);
	const previous_index = Math.max(index - 1, 0);
	return TIME_WARP_FACTORS[previous_index];
}
