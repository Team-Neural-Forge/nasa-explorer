import type { LanderStats } from "../state/rocket_config";
import { getBodyConstants } from "./gravity_bodies";

const STANDARD_GRAVITY = 9.80665;
const DEGREES_TO_RADIANS = Math.PI / 180;
const START_ALTITUDE_M = 2000;
const START_HORIZONTAL_SPEED_M_S = 15;
const START_VERTICAL_SPEED_M_S = -5;
const MAX_TILT_RADIANS = 45 * DEGREES_TO_RADIANS;
const SAFE_VERTICAL_SPEED_M_S = 3;
const SAFE_HORIZONTAL_SPEED_M_S = 1.5;
const SAFE_TILT_DEG = 15;

export type LandingStatus = "flying" | "landed" | "crashed";

export type LandingSnapshot = {
	horizontal_position_m: number;
	status: LandingStatus;
	altitude_m: number;
	vertical_speed_m_s: number;
	horizontal_speed_m_s: number;
	fuel_fraction: number;
	throttle: number;
	mass_kg: number;
	attitude_deg: number;
	twr: number;
	hover_throttle: number;
	safe_vertical_m_s: number;
	safe_horizontal_m_s: number;
	safe_tilt_deg: number;
	autopilot: boolean;
	message: string;
};

export class LunarLandingSimulation {
	private readonly moon_gravity_m_s2: number;
	private readonly dry_mass_kg: number;
	private readonly propellant_kg: number;
	private readonly thrust_n: number;
	private readonly isp_s: number;

	private position_x = 0;
	private altitude_m = START_ALTITUDE_M;
	private velocity_x = START_HORIZONTAL_SPEED_M_S;
	private velocity_y = START_VERTICAL_SPEED_M_S;
	private fuel_kg: number;
	private attitude_rad = 0;
	private throttle = 0;
	private status: LandingStatus = "flying";
	private autopilot_active = false;
	private impact_vertical_m_s = 0;
	private impact_horizontal_m_s = 0;
	private impact_tilt_deg = 0;

	constructor(stats: LanderStats) {
		const moon = getBodyConstants("moon");
		this.moon_gravity_m_s2 = moon.surface_gravity_m_s2;
		this.dry_mass_kg = stats.dry_mass_kg;
		this.propellant_kg = stats.propellant_kg;
		this.thrust_n = stats.thrust_n;
		this.isp_s = stats.isp_s;
		this.fuel_kg = stats.propellant_kg;
	}

	get horizontal_position_m(): number {
		return this.position_x;
	}

	private get mass_kg(): number {
		return this.dry_mass_kg + this.fuel_kg;
	}

	adjustThrottle(delta: number): void {
		if (this.status !== "flying") {
			return;
		}
		this.throttle = Math.max(0, Math.min(1, this.throttle + delta));
	}

	adjustAttitude(delta: number): void {
		if (this.status !== "flying") {
			return;
		}
		this.attitude_rad = Math.max(
			-MAX_TILT_RADIANS,
			Math.min(MAX_TILT_RADIANS, this.attitude_rad + delta),
		);
	}

	toggle_autopilot(): void {
		if (this.status !== "flying") {
			return;
		}
		this.autopilot_active = !this.autopilot_active;
	}

	update(dt_seconds: number): void {
		if (this.status !== "flying") {
			return;
		}

		const dt = Math.min(dt_seconds, 0.1);
		if (this.autopilot_active) {
			this.apply_autopilot(dt);
		}

		let thrust_acceleration_x = 0;
		let thrust_acceleration_y = 0;

		if (this.fuel_kg > 0 && this.throttle > 0) {
			const mass_flow_rate = this.thrust_n / (this.isp_s * STANDARD_GRAVITY);
			const burned = Math.min(
				this.fuel_kg,
				mass_flow_rate * this.throttle * dt,
			);
			this.fuel_kg -= burned;
			const thrust_acceleration =
				(this.thrust_n * this.throttle) / this.mass_kg;
			thrust_acceleration_x = thrust_acceleration * Math.sin(this.attitude_rad);
			thrust_acceleration_y = thrust_acceleration * Math.cos(this.attitude_rad);
		}

		this.velocity_x += thrust_acceleration_x * dt;
		this.velocity_y += (thrust_acceleration_y - this.moon_gravity_m_s2) * dt;
		this.position_x += this.velocity_x * dt;
		this.altitude_m += this.velocity_y * dt;

		if (this.altitude_m <= 0) {
			this.altitude_m = 0;
			this.impact_vertical_m_s = Math.abs(this.velocity_y);
			this.impact_horizontal_m_s = Math.abs(this.velocity_x);
			this.impact_tilt_deg = Math.abs(this.attitude_rad / DEGREES_TO_RADIANS);
			const safe =
				this.impact_vertical_m_s <= SAFE_VERTICAL_SPEED_M_S &&
				this.impact_horizontal_m_s <= SAFE_HORIZONTAL_SPEED_M_S &&
				this.impact_tilt_deg <= SAFE_TILT_DEG;
			this.status = safe ? "landed" : "crashed";
			this.autopilot_active = false;
			this.velocity_x = 0;
			this.velocity_y = 0;
			this.throttle = 0;
		}
	}

	private apply_autopilot(dt_seconds: number): void {
		const target_vertical_speed = -Math.min(
			40,
			Math.sqrt(2 * 1.2 * Math.max(this.altitude_m, 0)),
		);
		const vertical_error = target_vertical_speed - this.velocity_y;
		const target_tilt =
			Math.abs(this.velocity_x) > 1.5
				? -Math.sign(this.velocity_x) * MAX_TILT_RADIANS * 0.9
				: 0;
		const max_step = 40 * DEGREES_TO_RADIANS * dt_seconds;
		if (this.attitude_rad < target_tilt) {
			this.attitude_rad = Math.min(target_tilt, this.attitude_rad + max_step);
		} else {
			this.attitude_rad = Math.max(target_tilt, this.attitude_rad - max_step);
		}

		const cos_tilt = Math.max(0.2, Math.cos(this.attitude_rad));
		const required_vertical_acceleration =
			this.moon_gravity_m_s2 + vertical_error;
		const available_vertical_acceleration =
			(this.thrust_n / this.mass_kg) * cos_tilt;
		this.throttle = Math.max(
			0,
			Math.min(
				1,
				required_vertical_acceleration / available_vertical_acceleration,
			),
		);
	}

	snapshot(): LandingSnapshot {
		const mass = this.mass_kg;
		const hover_throttle =
			this.thrust_n > 0 ? (mass * this.moon_gravity_m_s2) / this.thrust_n : 0;
		return {
			horizontal_position_m: this.position_x,
			status: this.status,
			altitude_m: Math.max(0, this.altitude_m),
			vertical_speed_m_s: this.velocity_y,
			horizontal_speed_m_s: Math.abs(this.velocity_x),
			fuel_fraction:
				this.propellant_kg === 0 ? 0 : this.fuel_kg / this.propellant_kg,
			throttle: this.throttle,
			mass_kg: mass,
			attitude_deg: this.attitude_rad / DEGREES_TO_RADIANS,
			twr:
				mass > 0
					? (this.thrust_n * this.throttle) / (mass * this.moon_gravity_m_s2)
					: 0,
			hover_throttle,
			safe_vertical_m_s: SAFE_VERTICAL_SPEED_M_S,
			safe_horizontal_m_s: SAFE_HORIZONTAL_SPEED_M_S,
			safe_tilt_deg: SAFE_TILT_DEG,
			autopilot: this.autopilot_active,
			message: this.message_for_status(),
		};
	}

	private message_for_status(): string {
		switch (this.status) {
			case "landed":
				return `Touchdown. Vertical ${this.impact_vertical_m_s.toFixed(1)} m/s, horizontal ${this.impact_horizontal_m_s.toFixed(1)} m/s.`;
			case "crashed":
				return `Crash: ${this.impact_vertical_m_s.toFixed(1)} m/s vertical, ${this.impact_horizontal_m_s.toFixed(1)} m/s horizontal, ${this.impact_tilt_deg.toFixed(0)}° tilt. Limits: ≤ ${SAFE_VERTICAL_SPEED_M_S} m/s, ≤ ${SAFE_HORIZONTAL_SPEED_M_S} m/s, ≤ ${SAFE_TILT_DEG}°.`;
			default: {
				if (this.autopilot_active) {
					return "Autopilot engaged: controlling descent rate and horizontal drift.";
				}
				if (
					this.altitude_m < 100 &&
					Math.abs(this.velocity_y) > SAFE_VERTICAL_SPEED_M_S
				) {
					return "Too fast for touchdown — add throttle to slow the descent.";
				}
				if (Math.abs(this.velocity_y) > 15) {
					return "Descent rate is high. Throttle up to arrest the fall.";
				}
				if (Math.abs(this.velocity_x) > 5) {
					return "Kill horizontal drift: pitch against your motion and burn.";
				}
				return "Adjust throttle and attitude. Aim for a soft touchdown.";
			}
		}
	}
}
