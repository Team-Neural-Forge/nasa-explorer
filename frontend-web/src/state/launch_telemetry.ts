import type { LaunchSnapshot } from "../engine/launch_simulation";

export type LaunchTelemetry = LaunchSnapshot & { speed_factor: number };

const INITIAL: LaunchTelemetry = {
	position_x_m: 0,
	position_y_m: 6_371_010,
	status: "prelaunch",
	altitude_m: 0,
	speed_m_s: 0,
	vertical_speed_m_s: 0,
	horizontal_speed_m_s: 0,
	fuel_fraction: 1,
	throttle: 0,
	twr: 0,
	apoapsis_m: 0,
	periapsis_m: 0,
	guidance_angle_deg: 0,
	attitude_deg: 0,
	speed_factor: 1,
	message: "Press Ignite to start the ascent.",
};

let current = INITIAL;
const listeners = new Set<() => void>();

export function getLaunchTelemetry(): LaunchTelemetry {
	return current;
}

export function subscribeLaunchTelemetry(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishLaunchTelemetry(next: LaunchTelemetry): void {
	current = next;
	for (const listener of listeners) {
		listener();
	}
}
