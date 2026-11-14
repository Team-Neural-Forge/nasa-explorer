import type { LandingSnapshot } from "../engine/lunar_landing_simulation";

export type LandingTelemetry = LandingSnapshot;

const INITIAL: LandingTelemetry = {
	horizontal_position_m: 0,
	status: "flying",
	altitude_m: 2000,
	vertical_speed_m_s: -5,
	horizontal_speed_m_s: 15,
	fuel_fraction: 1,
	throttle: 0,
	mass_kg: 27_500,
	attitude_deg: 0,
	twr: 0,
	hover_throttle: 0.5,
	safe_vertical_m_s: 3,
	safe_horizontal_m_s: 1.5,
	safe_tilt_deg: 15,
	autopilot: false,
	message: "Adjust throttle and attitude. Aim for a soft touchdown.",
};

let current = INITIAL;
const listeners = new Set<() => void>();

export function getLandingTelemetry(): LandingTelemetry {
	return current;
}

export function subscribeLandingTelemetry(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishLandingTelemetry(next: LandingTelemetry): void {
	current = next;
	for (const listener of listeners) {
		listener();
	}
}
