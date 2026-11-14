export const ASTRONAUT_HEIGHT_M = 1.8;
export const ASTRONAUT_WIDTH_M = 0.5;
export const ASTRONAUT_MASS_KG = 60;

export const GRAVITY_M_S2 = 9.81;
export const WALK_SPEED_M_S = 3;
export const WALK_ACCELERATION_M_S2 = 8;
export const JUMP_APEX_M = 0.8;
export const JUMP_VELOCITY_M_S = Math.sqrt(2 * GRAVITY_M_S2 * JUMP_APEX_M);
export const JUMP_IMPULSE_N_S = ASTRONAUT_MASS_KG * JUMP_VELOCITY_M_S;

export const ROCKET_X_M = 0;
export const STORE_X_M = 90;
export const STORE_HEIGHT_M = 10;
export const STORE_WIDTH_M = 20;
export const ASTRONAUT_START_X_M = -8;

export const ROCKET_INTERACTION_M = 15;
export const STORE_INTERACTION_M = 10;

export const WORLD_MIN_M = -200;
export const WORLD_MAX_M = 200;
export const GROUND_MIN_M = -1200;
export const GROUND_MAX_M = 1200;

export const HALF_ASTRONAUT_WIDTH_M = ASTRONAUT_WIDTH_M / 2;
export const WALKABLE_MIN_M = WORLD_MIN_M + HALF_ASTRONAUT_WIDTH_M;
export const WALKABLE_MAX_M = WORLD_MAX_M - HALF_ASTRONAUT_WIDTH_M;

export type RocketDimensions = {
	height_m: number;
	diameter_m: number;
};

export type EarthStoreIndicator = {
	visible: boolean;
	direction: "left" | "right";
	distance_m: number;
};

export type WorldClamp = {
	x_m: number;
	at_wall: boolean;
};

export function compute_store_indicator(
	astronaut_x_m: number,
	store_x_m: number,
	camera_x_m: number,
	visible_width_m: number,
): EarthStoreIndicator {
	const half_visible = visible_width_m / 2;
	const left_edge = camera_x_m - half_visible;
	const right_edge = camera_x_m + half_visible;
	const distance_m = Math.abs(store_x_m - astronaut_x_m);
	if (store_x_m > right_edge) {
		return { visible: true, direction: "right", distance_m };
	}
	if (store_x_m < left_edge) {
		return { visible: true, direction: "left", distance_m };
	}
	return {
		visible: false,
		direction: store_x_m >= astronaut_x_m ? "right" : "left",
		distance_m,
	};
}

export function clamp_to_world(x_m: number): WorldClamp {
	if (x_m < WALKABLE_MIN_M) {
		return { x_m: WALKABLE_MIN_M, at_wall: true };
	}
	if (x_m > WALKABLE_MAX_M) {
		return { x_m: WALKABLE_MAX_M, at_wall: true };
	}
	return { x_m, at_wall: false };
}

export function move_toward(
	current: number,
	target: number,
	max_delta: number,
): number {
	if (current < target) {
		return Math.min(target, current + max_delta);
	}
	return Math.max(target, current - max_delta);
}
