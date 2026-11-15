export const FLIGHT_SPEED_FACTORS = [1, 2, 3, 4, 6, 8, 12, 16] as const;

export type FlightSpeedFactor = (typeof FLIGHT_SPEED_FACTORS)[number];

export function nextFlightSpeed(current: FlightSpeedFactor): FlightSpeedFactor {
	const index = FLIGHT_SPEED_FACTORS.indexOf(current);
	const next_index = Math.min(index + 1, FLIGHT_SPEED_FACTORS.length - 1);
	return FLIGHT_SPEED_FACTORS[next_index];
}

export function previousFlightSpeed(
	current: FlightSpeedFactor,
): FlightSpeedFactor {
	const index = FLIGHT_SPEED_FACTORS.indexOf(current);
	const previous_index = Math.max(index - 1, 0);
	return FLIGHT_SPEED_FACTORS[previous_index];
}
