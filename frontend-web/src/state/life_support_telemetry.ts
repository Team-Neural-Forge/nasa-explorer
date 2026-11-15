import { LifeSupport, type LifeSupportSnapshot } from "../engine/life_support";

let current = new LifeSupport().snapshot();
const listeners = new Set<() => void>();

export function getLifeSupportTelemetry(): LifeSupportSnapshot {
	return current;
}

export function subscribeLifeSupportTelemetry(
	listener: () => void,
): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishLifeSupportTelemetry(next: LifeSupportSnapshot): void {
	current = next;
	for (const listener of listeners) listener();
}
