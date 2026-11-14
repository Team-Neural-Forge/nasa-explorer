import type { CruiseSnapshot } from "../engine/cruise_simulation";

export type CruiseTelemetry = CruiseSnapshot;

const INITIAL: CruiseTelemetry = {
	progress: 0,
	distance_total_m: 384_400_000,
	distance_remaining_m: 384_400_000,
	eta_seconds: 3 * 86_400,
	speed_m_s: 1_483,
	warp: 10_000,
	status: "cruising",
	message: "Cruising to the Moon.",
};

let current = INITIAL;
const listeners = new Set<() => void>();

export function getCruiseTelemetry(): CruiseTelemetry {
	return current;
}

export function subscribeCruiseTelemetry(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishCruiseTelemetry(next: CruiseTelemetry): void {
	current = next;
	for (const listener of listeners) {
		listener();
	}
}
