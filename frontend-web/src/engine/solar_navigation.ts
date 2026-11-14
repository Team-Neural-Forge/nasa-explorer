import { BaryState, Body, KM_PER_AU } from "astronomy-engine";

export const navigation_bodies = [
	Body.Sun,
	Body.Mercury,
	Body.Venus,
	Body.Earth,
	Body.Moon,
	Body.Mars,
	Body.Jupiter,
	Body.Saturn,
	Body.Uranus,
	Body.Neptune,
] as const;
export type NavigationVector = { x: number; y: number; z: number };

/** Astronomy Engine returns geometric SSB-centered EQJ coordinates in AU. */
export function getBarycentricPosition(
	body: Body,
	time_ms: number,
): NavigationVector {
	const state = BaryState(body, new Date(time_ms));
	return { x: state.x, y: state.y, z: state.z };
}

export function interpolateTransfer(
	start: NavigationVector,
	end: NavigationVector,
	progress: number,
): NavigationVector {
	const fraction = Math.max(0, Math.min(1, progress));
	return {
		x: start.x + (end.x - start.x) * fraction,
		y: start.y + (end.y - start.y) * fraction,
		z: start.z + (end.z - start.z) * fraction,
	};
}

export function formatVector(
	vector: NavigationVector,
	unit: "AU" | "km",
): string {
	const factor = unit === "km" ? KM_PER_AU : 1;
	const digits = unit === "km" ? 0 : 6;
	return [vector.x, vector.y, vector.z]
		.map((value) =>
			(value * factor).toLocaleString("en-US", {
				maximumFractionDigits: digits,
				minimumFractionDigits: digits,
			}),
		)
		.join(", ");
}
