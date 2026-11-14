export type EarthLocation = "rocket" | "store" | "open";

let location: EarthLocation = "rocket";
const listeners = new Set<() => void>();

export function getEarthLocation(): EarthLocation {
	return location;
}

export function subscribeEarthLocation(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishEarthLocation(next: EarthLocation): void {
	if (next === location) return;
	location = next;
	for (const listener of listeners) listener();
}

export const earth_input = { left: false, right: false, jump: false };
