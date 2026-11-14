import assert from "node:assert/strict";
import { test } from "node:test";
import {
	ASTRONAUT_MASS_KG,
	clamp_to_world,
	GRAVITY_M_S2,
	HALF_ASTRONAUT_WIDTH_M,
	JUMP_APEX_M,
	JUMP_IMPULSE_N_S,
	JUMP_VELOCITY_M_S,
	WALK_SPEED_M_S,
	WORLD_MAX_M,
	WORLD_MIN_M,
} from "../src/state/earth_scene.ts";

test("60 kg astronaut jump impulse produces the target 0.8 m apex", () => {
	assert.equal(ASTRONAUT_MASS_KG, 60);
	assert.ok(
		Math.abs(JUMP_IMPULSE_N_S - ASTRONAUT_MASS_KG * JUMP_VELOCITY_M_S) < 1e-9,
	);
	const apex_m = (JUMP_VELOCITY_M_S * JUMP_VELOCITY_M_S) / (2 * GRAVITY_M_S2);
	assert.ok(Math.abs(apex_m - JUMP_APEX_M) < 0.01, `${apex_m} m`);
});

test("walk speed matches the agreed 3 m/s", () => {
	assert.equal(WALK_SPEED_M_S, 3);
});

test("invisible world boundary stops the astronaut at both ends", () => {
	const left = clamp_to_world(WORLD_MIN_M - 10);
	assert.equal(left.at_wall, true);
	assert.equal(left.x_m, WORLD_MIN_M + HALF_ASTRONAUT_WIDTH_M);

	const right = clamp_to_world(WORLD_MAX_M + 10);
	assert.equal(right.at_wall, true);
	assert.equal(right.x_m, WORLD_MAX_M - HALF_ASTRONAUT_WIDTH_M);

	assert.deepEqual(clamp_to_world(0), { x_m: 0, at_wall: false });
});
