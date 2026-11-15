// Simplified teaching model, not a physiological or spacecraft engineering model.
export const EVA_SUPPLY_SECONDS = 8 * 60 * 60;
export const EVA_SCRUBBER_SECONDS = 7.5 * 60 * 60;
export const EVA_BATTERY_SECONDS = 9 * 60 * 60;
const EXHAUSTION_HEALTH_SECONDS = 120;

export type LifeSupportEnvironment = "earth" | "cabin" | "eva";
export type LifeSupportSnapshot = {
	environment: LifeSupportEnvironment;
	oxygen_seconds: number;
	scrubber_seconds: number;
	battery_seconds: number;
	pressure_kpa: number;
	co2_percent: number;
	health: number;
	deceased: boolean;
};

export class LifeSupport {
	private oxygen_seconds = EVA_SUPPLY_SECONDS;
	private scrubber_seconds = EVA_SCRUBBER_SECONDS;
	private battery_seconds = EVA_BATTERY_SECONDS;
	private suit_pressure_kpa = 29.6;
	private suit_co2_percent = 0.4;
	private health = 100;
	private environment: LifeSupportEnvironment = "earth";

	update(dt_seconds: number, environment: LifeSupportEnvironment): void {
		if (this.health <= 0) return;
		this.environment = environment;
		if (environment !== "eva") return;
		const dt = Math.max(0, dt_seconds);
		const oxygen_loss_seconds = Math.max(0, dt - this.oxygen_seconds);
		const battery_loss_seconds = Math.max(0, dt - this.battery_seconds);
		const scrubber_loss_seconds = Math.max(
			0,
			dt - Math.min(this.scrubber_seconds, this.battery_seconds),
		);
		const co2_before = this.suit_co2_percent;
		this.oxygen_seconds = Math.max(0, this.oxygen_seconds - dt);
		this.scrubber_seconds = Math.max(0, this.scrubber_seconds - dt);
		this.battery_seconds = Math.max(0, this.battery_seconds - dt);
		this.suit_pressure_kpa = Math.max(
			0,
			this.suit_pressure_kpa - (oxygen_loss_seconds * 29.6) / 30,
		);
		this.suit_co2_percent = Math.min(
			10,
			this.suit_co2_percent + scrubber_loss_seconds * 0.01,
		);
		const co2_hazard_seconds = Math.max(
			0,
			scrubber_loss_seconds - Math.max(0, (1 - co2_before) / 0.01),
		);
		const unprotected_seconds = Math.max(
			oxygen_loss_seconds,
			battery_loss_seconds,
			co2_hazard_seconds,
		);
		this.health = Math.max(
			0,
			this.health - (unprotected_seconds * 100) / EXHAUSTION_HEALTH_SECONDS,
		);
	}

	snapshot(): LifeSupportSnapshot {
		return {
			environment: this.environment,
			oxygen_seconds: this.oxygen_seconds,
			scrubber_seconds: this.scrubber_seconds,
			battery_seconds: this.battery_seconds,
			pressure_kpa: this.environment === "eva" ? this.suit_pressure_kpa : 101.3,
			co2_percent: this.environment === "eva" ? this.suit_co2_percent : 0.04,
			health: this.health,
			deceased: this.health <= 0,
		};
	}
}
