import bodiesJson from "../data/bodies.json";

export type BodyKey = keyof typeof bodiesJson.bodies;

export type BodyConstants = {
	id: BodyKey;
	name: string;
	kind: string;
	gm_m3_s2: number;
	radius_m: number;
	surface_gravity_m_s2: number;
};

const bodyEntries = bodiesJson.bodies;

function toBodyConstants(id: BodyKey): BodyConstants {
	const body = bodyEntries[id];
	return {
		id,
		name: body.name,
		kind: body.kind,
		gm_m3_s2: body.gm_km3_s2 * 1e9,
		radius_m: body.radius_km * 1e3,
		surface_gravity_m_s2: body.gravity_m_s2,
	};
}

export function getBodyConstants(id: BodyKey): BodyConstants {
	return toBodyConstants(id);
}

export function getAllBodyConstants(): BodyConstants[] {
	return (Object.keys(bodyEntries) as BodyKey[]).map(toBodyConstants);
}
