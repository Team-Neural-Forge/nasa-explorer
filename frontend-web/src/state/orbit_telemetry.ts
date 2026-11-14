import type { OrbitSnapshot } from "../engine/orbit_simulation";

export type OrbitTelemetry = OrbitSnapshot;

const INITIAL: OrbitTelemetry = {
	altitude_m: 200_000,
	speed_m_s: 7_788,
	period_s: 5_310,
	warp: 1,
	mode: "inside",
	astronaut_distance_m: 0,
	astronaut_speed_m_s: 0,
	can_reenter: false,
	message: "In orbit.",
};

let current = INITIAL;
const listeners = new Set<() => void>();

export function getOrbitTelemetry(): OrbitTelemetry {
	return current;
}

export function subscribeOrbitTelemetry(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishOrbitTelemetry(next: OrbitTelemetry): void {
	current = next;
	for (const listener of listeners) {
		listener();
	}
}
