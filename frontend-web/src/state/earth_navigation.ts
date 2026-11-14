import type { EarthStoreIndicator } from "./earth_scene";

let indicator: EarthStoreIndicator = {
	visible: true,
	direction: "right",
	distance_m: 98,
};
const listeners = new Set<() => void>();

function same_indicator(
	left: EarthStoreIndicator,
	right: EarthStoreIndicator,
): boolean {
	return (
		left.visible === right.visible &&
		left.direction === right.direction &&
		Math.round(left.distance_m) === Math.round(right.distance_m)
	);
}

export function getEarthStoreIndicator(): EarthStoreIndicator {
	return indicator;
}

export function subscribeEarthStoreIndicator(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishEarthStoreIndicator(next: EarthStoreIndicator): void {
	if (same_indicator(indicator, next)) return;
	indicator = next;
	for (const listener of listeners) listener();
}
