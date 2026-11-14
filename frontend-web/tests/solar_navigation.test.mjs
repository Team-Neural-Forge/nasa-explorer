import assert from "node:assert/strict";
import { test } from "node:test";
import { Body, KM_PER_AU } from "astronomy-engine";
import {
	getBarycentricPosition,
	interpolateTransfer,
} from "../src/engine/solar_navigation.ts";
import {
	advanceSimulationTime,
	getSimulationTime,
} from "../src/state/simulation_clock.ts";

// Horizons DE441/ICRF, SSB center, 2026-11-14 00:00 TDB, geometric km.
// UTC and TDB differ by roughly a minute, so this deliberately generous
// tolerance accommodates that offset and the approximate EQJ ephemeris.
test("Earth and Mars barycentric positions agree with JPL Horizons within 5000 km", () => {
	const date = Date.parse("2026-11-14T00:00:00Z");
	for (const [body, expected] of [
		[Body.Earth, [92508757.52140197, 105232046.1170128, 45630101.85156876]],
		[Body.Mars, [-68694188.9210864, 208160896.8012383, 97359263.0662851]],
	]) {
		const actual = getBarycentricPosition(body, date);
		const error_km = Math.hypot(
			actual.x * KM_PER_AU - expected[0],
			actual.y * KM_PER_AU - expected[1],
			actual.z * KM_PER_AU - expected[2],
		);
		assert.ok(error_km < 5000, `${body}: ${error_km} km`);
	}
});

test("Earth and Mars remain close to JPL Horizons one day later", () => {
	const date = Date.parse("2026-11-15T00:00:00Z");
	for (const [body, expected] of [
		[Body.Earth, [90445608.041398, 106685090.275587, 46259877.2009143]],
		[Body.Mars, [-70618148.9791493, 207754175.4788508, 97224591.042774]],
	]) {
		const actual = getBarycentricPosition(body, date);
		const error_km = Math.hypot(
			actual.x * KM_PER_AU - expected[0],
			actual.y * KM_PER_AU - expected[1],
			actual.z * KM_PER_AU - expected[2],
		);
		assert.ok(error_km < 5000, `${body}: ${error_km} km`);
	}
});

test("body positions change with simulated date and interpolation reaches both endpoints", () => {
	const now = Date.parse("2026-11-14T00:00:00Z");
	const earth = getBarycentricPosition(Body.Earth, now);
	const moon = getBarycentricPosition(Body.Moon, now);
	assert.notDeepEqual(
		earth,
		getBarycentricPosition(Body.Earth, now + 86400000),
	);
	assert.deepEqual(interpolateTransfer(earth, moon, 0), earth);
	assert.deepEqual(interpolateTransfer(earth, moon, 1), moon);
});

test("simulation clock advances by simulated rather than wall-clock seconds", () => {
	const before = getSimulationTime();
	advanceSimulationTime(100000);
	assert.equal(getSimulationTime() - before, 100000000);
	advanceSimulationTime(-1);
	assert.equal(getSimulationTime() - before, 100000000);
});
