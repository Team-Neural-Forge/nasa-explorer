import assert from "node:assert/strict";
import { test } from "node:test";
import {
	EVA_BATTERY_SECONDS,
	EVA_SCRUBBER_SECONDS,
	EVA_SUPPLY_SECONDS,
	LifeSupport,
} from "../src/engine/life_support.ts";

test("EVA depletes each resource separately while cabin time does not", () => {
	const life_support = new LifeSupport();
	life_support.update(3600, "eva");
	const snapshot = life_support.snapshot();
	assert.equal(snapshot.oxygen_seconds, EVA_SUPPLY_SECONDS - 3600);
	assert.equal(snapshot.scrubber_seconds, EVA_SCRUBBER_SECONDS - 3600);
	assert.equal(snapshot.battery_seconds, EVA_BATTERY_SECONDS - 3600);
	assert.equal(snapshot.pressure_kpa, 29.6);
	life_support.update(10_000_000, "cabin");
	assert.equal(life_support.snapshot().oxygen_seconds, snapshot.oxygen_seconds);
	assert.equal(life_support.snapshot().health, 100);
});

test("scrubber exhaustion raises CO2, then damages health and becomes fatal", () => {
	const life_support = new LifeSupport();
	life_support.update(EVA_SCRUBBER_SECONDS + 60, "eva");
	assert.equal(life_support.snapshot().scrubber_seconds, 0);
	assert.equal(life_support.snapshot().co2_percent, 1);
	assert.equal(life_support.snapshot().health, 100);
	life_support.update(120, "eva");
	assert.equal(life_support.snapshot().deceased, true);
	life_support.update(1, "cabin");
	assert.equal(life_support.snapshot().deceased, true);
});

test("returning to cabin stops further depletion without restoring resources", () => {
	const life_support = new LifeSupport();
	life_support.update(EVA_SCRUBBER_SECONDS + 90, "eva");
	const snapshot = life_support.snapshot();
	life_support.update(3600, "cabin");
	assert.equal(life_support.snapshot().health, snapshot.health);
	assert.equal(life_support.snapshot().scrubber_seconds, 0);
});
