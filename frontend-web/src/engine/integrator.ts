import type { Vec2 } from "./vector_math";

export type GravitySource = {
	position: Vec2;
	gm_m3_s2: number;
};

export type BodyState = {
	position: Vec2;
	velocity: Vec2;
};

export type IntegrationOptions = {
	softening_m?: number;
};

export function gravitationalAcceleration(
	position: Vec2,
	sources: GravitySource[],
	options: IntegrationOptions = {},
): Vec2 {
	const softening_m = options.softening_m ?? 0;
	let acceleration_x = 0;
	let acceleration_y = 0;

	for (const source of sources) {
		const offset_x = source.position.x - position.x;
		const offset_y = source.position.y - position.y;
		const distance_squared =
			offset_x * offset_x + offset_y * offset_y + softening_m * softening_m;
		if (distance_squared === 0) {
			continue;
		}
		const distance = Math.sqrt(distance_squared);
		const factor = source.gm_m3_s2 / (distance_squared * distance);
		acceleration_x += offset_x * factor;
		acceleration_y += offset_y * factor;
	}

	return { x: acceleration_x, y: acceleration_y };
}

/**
 * Symplectic velocity Verlet step. Keeps orbital energy stable over long runs.
 */
export function velocityVerletStep(
	state: BodyState,
	sources: GravitySource[],
	dt_seconds: number,
	options: IntegrationOptions = {},
): BodyState {
	const initial_acceleration = gravitationalAcceleration(
		state.position,
		sources,
		options,
	);
	const half_velocity: Vec2 = {
		x: state.velocity.x + initial_acceleration.x * dt_seconds * 0.5,
		y: state.velocity.y + initial_acceleration.y * dt_seconds * 0.5,
	};
	const next_position: Vec2 = {
		x: state.position.x + half_velocity.x * dt_seconds,
		y: state.position.y + half_velocity.y * dt_seconds,
	};
	const next_acceleration = gravitationalAcceleration(
		next_position,
		sources,
		options,
	);
	const next_velocity: Vec2 = {
		x: half_velocity.x + next_acceleration.x * dt_seconds * 0.5,
		y: half_velocity.y + next_acceleration.y * dt_seconds * 0.5,
	};

	return { position: next_position, velocity: next_velocity };
}
