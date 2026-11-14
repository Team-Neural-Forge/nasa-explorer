import type { RocketStats } from "../state/rocket_config";
import { getBodyConstants } from "./gravity_bodies";

const STANDARD_GRAVITY = 9.80665;
const DEGREES_TO_RADIANS = Math.PI / 180;
const MAX_PITCH_RADIANS = 85 * DEGREES_TO_RADIANS;
const PAD_ALTITUDE_M = 10;
const PAD_SURFACE_TOLERANCE_M = 1;
const ATMOSPHERE_SCALE_HEIGHT_M = 8500;
const SEA_LEVEL_DENSITY_KG_M3 = 1.225;
const DRAG_AREA_M2 = 5;
const ORBIT_PERIAPSIS_THRESHOLD_M = 120_000;

export type LaunchStatus =
	| "prelaunch"
	| "flying"
	| "coasting"
	| "orbit"
	| "suborbital"
	| "crashed";

export type LaunchSnapshot = {
	position_x_m: number;
	position_y_m: number;
	status: LaunchStatus;
	altitude_m: number;
	speed_m_s: number;
	vertical_speed_m_s: number;
	horizontal_speed_m_s: number;
	fuel_fraction: number;
	throttle: number;
	twr: number;
	apoapsis_m: number | null;
	periapsis_m: number;
	guidance_angle_deg: number;
	attitude_deg: number;
	message: string;
};

type OrbitalElements = {
	apoapsis_m: number | null;
	periapsis_m: number;
	bound: boolean;
};

const GRAVITY_TURN_START_ALTITUDE_M = 500;
const GRAVITY_TURN_LEAD_RADIANS = 3 * DEGREES_TO_RADIANS;
const ORBITAL_ALTITUDE_THRESHOLD_M = 100_000;
const ORBITAL_SPEED_THRESHOLD_M_S = 7_800;
const ORBITAL_HORIZONTAL_THRESHOLD_M_S = 6_500;

export function guidancePitchRadians(
	altitude_m: number,
	velocity_angle_rad: number,
): number {
	if (altitude_m < GRAVITY_TURN_START_ALTITUDE_M) {
		return 0;
	}
	return Math.min(
		90 * DEGREES_TO_RADIANS,
		Math.max(0, velocity_angle_rad + GRAVITY_TURN_LEAD_RADIANS),
	);
}

export class LaunchSimulation {
	private readonly earth_radius_m: number;
	private readonly earth_gm_m3_s2: number;
	private readonly dry_mass_kg: number;
	private readonly propellant_kg: number;
	private readonly thrust_n: number;
	private readonly isp_s: number;

	private position_x = 0;
	private position_y: number;
	private velocity_x = 0;
	private velocity_y = 0;
	private fuel_kg: number;
	private attitude_rad = 0;
	private throttle = 0;
	private status: LaunchStatus = "prelaunch";
	private impact_speed_m_s = 0;

	constructor(stats: RocketStats) {
		const earth = getBodyConstants("earth");
		this.earth_radius_m = earth.radius_m;
		this.earth_gm_m3_s2 = earth.gm_m3_s2;
		this.dry_mass_kg = stats.dry_mass_kg;
		this.propellant_kg = stats.propellant_kg;
		this.thrust_n = stats.thrust_n;
		this.isp_s = stats.isp_s;
		this.fuel_kg = stats.propellant_kg;
		this.position_y = earth.radius_m + PAD_ALTITUDE_M;
	}

	get status_value(): LaunchStatus {
		return this.status;
	}

	private get mass_kg(): number {
		return this.dry_mass_kg + this.fuel_kg;
	}

	ignite(): void {
		if (this.status !== "prelaunch") {
			return;
		}
		this.status = "flying";
		this.throttle = 1;
	}

	retry(): void {
		this.position_x = 0;
		this.position_y = this.earth_radius_m + PAD_ALTITUDE_M;
		this.velocity_x = 0;
		this.velocity_y = 0;
		this.fuel_kg = this.propellant_kg;
		this.attitude_rad = 0;
		this.throttle = 0;
		this.status = "prelaunch";
		this.impact_speed_m_s = 0;
	}

	adjustThrottle(delta: number): void {
		if (this.status === "orbit" || this.status === "crashed") {
			return;
		}
		this.throttle = Math.max(0, Math.min(1, this.throttle + delta));
	}

	adjustAttitude(delta: number): void {
		if (this.status === "orbit" || this.status === "crashed") {
			return;
		}
		this.attitude_rad = Math.max(
			-MAX_PITCH_RADIANS,
			Math.min(MAX_PITCH_RADIANS, this.attitude_rad + delta),
		);
	}

	stage(): void {
		// Single-stage gameplay model for this build; staging arrives with multi-stage vehicles.
	}

	update(dt_seconds: number): void {
		if (
			this.status !== "flying" &&
			this.status !== "coasting" &&
			this.status !== "suborbital"
		) {
			return;
		}

		const dt = Math.min(dt_seconds, 0.2);
		const radius = Math.hypot(this.position_x, this.position_y);
		const altitude = radius - this.earth_radius_m;

		let thrust_acceleration_x = 0;
		let thrust_acceleration_y = 0;

		if (this.status === "flying") {
			if (this.fuel_kg > 0 && this.throttle > 0) {
				const mass_flow_rate = this.thrust_n / (this.isp_s * STANDARD_GRAVITY);
				const burned = Math.min(
					this.fuel_kg,
					mass_flow_rate * this.throttle * dt,
				);
				this.fuel_kg -= burned;
				const thrust_acceleration =
					(this.thrust_n * this.throttle) / this.mass_kg;
				thrust_acceleration_x =
					thrust_acceleration * Math.sin(this.attitude_rad);
				thrust_acceleration_y =
					thrust_acceleration * Math.cos(this.attitude_rad);
			}
			if (this.fuel_kg <= 0) {
				this.fuel_kg = 0;
				this.status = "coasting";
			}
		}

		const gravity_factor = -this.earth_gm_m3_s2 / (radius * radius * radius);
		const gravity_x = gravity_factor * this.position_x;
		const gravity_y = gravity_factor * this.position_y;

		const speed = Math.hypot(this.velocity_x, this.velocity_y);
		const density =
			SEA_LEVEL_DENSITY_KG_M3 *
			Math.exp(-Math.max(altitude, 0) / ATMOSPHERE_SCALE_HEIGHT_M);
		let drag_acceleration_x = 0;
		let drag_acceleration_y = 0;
		if (speed > 0 && density > 0) {
			const drag_force = 0.5 * density * speed * speed * DRAG_AREA_M2;
			drag_acceleration_x =
				(-drag_force * (this.velocity_x / speed)) / this.mass_kg;
			drag_acceleration_y =
				(-drag_force * (this.velocity_y / speed)) / this.mass_kg;
		}

		this.velocity_x +=
			(gravity_x + thrust_acceleration_x + drag_acceleration_x) * dt;
		this.velocity_y +=
			(gravity_y + thrust_acceleration_y + drag_acceleration_y) * dt;
		this.position_x += this.velocity_x * dt;
		this.position_y += this.velocity_y * dt;

		const next_radius = Math.hypot(this.position_x, this.position_y);
		const next_altitude = next_radius - this.earth_radius_m;
		if (next_altitude <= PAD_SURFACE_TOLERANCE_M) {
			this.status = "crashed";
			this.impact_speed_m_s = speed;
			const scale = this.earth_radius_m / next_radius;
			this.position_x *= scale;
			this.position_y *= scale;
			this.velocity_x = 0;
			this.velocity_y = 0;
			return;
		}

		const radial_x = next_radius === 0 ? 0 : this.position_x / next_radius;
		const radial_y = next_radius === 0 ? 0 : this.position_y / next_radius;
		const horizontal_speed = Math.abs(
			this.velocity_x * radial_y - this.velocity_y * radial_x,
		);
		const total_speed = Math.hypot(this.velocity_x, this.velocity_y);
		if (
			(this.status === "flying" || this.status === "coasting") &&
			next_altitude >= ORBITAL_ALTITUDE_THRESHOLD_M &&
			total_speed >= ORBITAL_SPEED_THRESHOLD_M_S &&
			horizontal_speed >= ORBITAL_HORIZONTAL_THRESHOLD_M_S
		) {
			const circular_speed = Math.sqrt(this.earth_gm_m3_s2 / next_radius);
			this.velocity_x = circular_speed * radial_y;
			this.velocity_y = -circular_speed * radial_x;
			this.attitude_rad = Math.PI / 2;
			this.status = "orbit";
			this.throttle = 0;
			return;
		}

		const elements = this.orbitalElements();
		if (elements.bound && elements.periapsis_m > ORBIT_PERIAPSIS_THRESHOLD_M) {
			this.status = "orbit";
			this.throttle = 0;
		} else if (this.status === "coasting") {
			this.status = "suborbital";
		}
	}

	snapshot(): LaunchSnapshot {
		const radius = Math.hypot(this.position_x, this.position_y);
		const altitude = Math.max(0, radius - this.earth_radius_m);
		const speed = Math.hypot(this.velocity_x, this.velocity_y);
		const radial_x = radius === 0 ? 0 : this.position_x / radius;
		const radial_y = radius === 0 ? 0 : this.position_y / radius;
		const vertical_speed =
			this.velocity_x * radial_x + this.velocity_y * radial_y;
		const horizontal_speed = Math.sqrt(
			Math.max(0, speed * speed - vertical_speed * vertical_speed),
		);
		const elements = this.orbitalElements();
		const twr =
			this.status === "flying" && this.mass_kg > 0
				? (this.thrust_n * this.throttle) / (this.mass_kg * STANDARD_GRAVITY)
				: 0;

		return {
			position_x_m: this.position_x,
			position_y_m: this.position_y,
			status: this.status,
			altitude_m: altitude,
			speed_m_s: speed,
			vertical_speed_m_s: vertical_speed,
			horizontal_speed_m_s: horizontal_speed,
			fuel_fraction:
				this.propellant_kg === 0 ? 0 : this.fuel_kg / this.propellant_kg,
			throttle: this.throttle,
			twr,
			apoapsis_m: elements.apoapsis_m,
			periapsis_m: elements.periapsis_m,
			guidance_angle_deg:
				guidancePitchRadians(
					altitude,
					Math.atan2(this.velocity_x, this.velocity_y),
				) / DEGREES_TO_RADIANS,
			attitude_deg: this.attitude_rad / DEGREES_TO_RADIANS,
			message: this.message_for_status(altitude, elements),
		};
	}

	private message_for_status(
		altitude_m: number,
		elements: OrbitalElements,
	): string {
		switch (this.status) {
			case "prelaunch":
				return "Press Ignite (or Enter) to start the ascent.";
			case "flying": {
				if (altitude_m < GRAVITY_TURN_START_ALTITUDE_M) {
					return "Hold vertical until you clear the pad.";
				}
				const guidance = guidancePitchRadians(
					altitude_m,
					Math.atan2(this.velocity_x, this.velocity_y),
				);
				const difference = this.attitude_rad - guidance;
				if (difference < -0.12) {
					return "Pitch over more to build horizontal speed.";
				}
				if (difference > 0.12) {
					return "Too much pitch — you are losing vertical progress to drag.";
				}
				return "Good gravity turn. Keep the nose near the guidance line.";
			}
			case "coasting":
				return "Engines out. You are coasting — watch your periapsis.";
			case "orbit":
				return "Orbital insertion complete. Circularization burn finished.";
			case "suborbital":
				return "The trajectory falls back to Earth. More horizontal speed was needed.";
			case "crashed":
				return `Impact at ${this.impact_speed_m_s.toFixed(0)} m/s. The vehicle was destroyed.`;
			default:
				if (!elements.bound) {
					return "You are on an escape trajectory.";
				}
				return "";
		}
	}

	private orbitalElements(): OrbitalElements {
		const radius = Math.hypot(this.position_x, this.position_y);
		if (radius === 0) {
			return { apoapsis_m: null, periapsis_m: 0, bound: false };
		}
		const speed_squared =
			this.velocity_x * this.velocity_x + this.velocity_y * this.velocity_y;
		const energy = speed_squared / 2 - this.earth_gm_m3_s2 / radius;
		const angular_momentum =
			this.position_x * this.velocity_y - this.position_y * this.velocity_x;
		const eccentricity_squared =
			1 +
			(2 * energy * angular_momentum * angular_momentum) /
				(this.earth_gm_m3_s2 * this.earth_gm_m3_s2);

		if (energy >= 0) {
			const semi_major_axis = -this.earth_gm_m3_s2 / (2 * energy);
			const eccentricity = Math.sqrt(Math.max(0, eccentricity_squared));
			return {
				apoapsis_m: null,
				periapsis_m: semi_major_axis * (1 - eccentricity) - this.earth_radius_m,
				bound: false,
			};
		}

		const semi_major_axis = -this.earth_gm_m3_s2 / (2 * energy);
		const eccentricity = Math.sqrt(Math.max(0, eccentricity_squared));
		return {
			apoapsis_m: semi_major_axis * (1 + eccentricity) - this.earth_radius_m,
			periapsis_m: semi_major_axis * (1 - eccentricity) - this.earth_radius_m,
			bound: true,
		};
	}
}
