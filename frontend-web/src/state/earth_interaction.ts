export type EarthLocation = "rocket" | "store" | "open";

let location: EarthLocation = "rocket";
const location_listeners = new Set<() => void>();

let warning = false;
const warning_listeners = new Set<() => void>();

export function getEarthLocation(): EarthLocation {
	return location;
}

export function subscribeEarthLocation(listener: () => void): () => void {
	location_listeners.add(listener);
	return () => {
		location_listeners.delete(listener);
	};
}

export function publishEarthLocation(next: EarthLocation): void {
	if (next === location) return;
	location = next;
	for (const listener of location_listeners) listener();
}

export function getEarthWarning(): boolean {
	return warning;
}

export function subscribeEarthWarning(listener: () => void): () => void {
	warning_listeners.add(listener);
	return () => {
		warning_listeners.delete(listener);
	};
}

export function publishEarthWarning(next: boolean): void {
	if (next === warning) return;
	warning = next;
	for (const listener of warning_listeners) listener();
}

export const earth_input = { left: false, right: false, jump: false };
