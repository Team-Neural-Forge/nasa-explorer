import { getBodyConstants } from "./gravity_bodies";
import { TIME_WARP_FACTORS, type TimeWarpFactor } from "./time_warp";

const DEFAULT_ALTITUDE_M = 200_000;
const MINIMUM_ALTITUDE_M = 100_000;
const MAXIMUM_ALTITUDE_M = 2_000_000;
const EVA_ACCELERATION_M_S2 = 0.45;
const EVA_EXIT_OFFSET_M = 5;
const EVA_REENTRY_DISTANCE_M = 2.5;
const EVA_REENTRY_SPEED_M_S = 0.7;
const EVA_TETHER_SOFT_LIMIT_M = 35;
const EVA_TETHER_PULL_M_S2 = 0.8;

export type OrbitMode = "inside" | "eva";

export type OrbitInsertion = {
	altitude_m: number;
	speed_m_s: number;
};

export type OrbitSnapshot = {
	altitude_m: number;
	speed_m_s: number;
	period_s: number;
	warp: TimeWarpFactor;
	mode: OrbitMode;
	astronaut_distance_m: number;
	astronaut_speed_m_s: number;
	can_reenter: boolean;
	message: string;
};

export type ThrustVector = {
	x: number;
	y: number;
};

export type AstronautRelativeState = {
	x_m: number;
	y_m: number;
	vx_m_s: number;
	vy_m_s: number;
	thrusting: boolean;
};

export class OrbitSimulation {
	private readonly altitude_m: number;
	private readonly speed_m_s: number;
	private readonly angular_velocity_rad_s: number;
	private readonly period_s: number;

	private angle_rad = 0;
	private simulated_seconds = 0;
	private warp_index = 0;
	private mode: OrbitMode = "inside";
	private astronaut_x = 0;
	private astronaut_y = 0;
	private astronaut_vx = 0;
	private astronaut_vy = 0;
	private thrusting = false;

	constructor(insertion: OrbitInsertion | null) {
		const earth = getBodyConstants("earth");
		this.altitude_m = Math.min(
			Math.max(insertion?.altitude_m ?? DEFAULT_ALTITUDE_M, MINIMUM_ALTITUDE_M),
			MAXIMUM_ALTITUDE_M,
		);
		const radius = earth.radius_m + this.altitude_m;
		this.speed_m_s = Math.sqrt(earth.gm_m3_s2 / radius);
		this.angular_velocity_rad_s = this.speed_m_s / radius;
		this.period_s = (2 * Math.PI) / this.angular_velocity_rad_s;
	}

	get warp(): TimeWarpFactor {
		return this.mode === "eva" ? 1 : TIME_WARP_FACTORS[this.warp_index];
	}

	get orbit_angle_rad(): number {
		return this.angle_rad;
	}

	get elapsed_simulated_seconds(): number {
		return this.simulated_seconds;
	}

	get astronaut_state(): AstronautRelativeState {
		return {
			x_m: this.astronaut_x,
			y_m: this.astronaut_y,
			vx_m_s: this.astronaut_vx,
			vy_m_s: this.astronaut_vy,
			thrusting: this.thrusting,
		};
	}

	increase_warp(): void {
		if (this.mode === "eva") {
			return;
		}
		this.warp_index = Math.min(
			this.warp_index + 1,
			TIME_WARP_FACTORS.length - 1,
		);
	}

	decrease_warp(): void {
		if (this.mode === "eva") {
			return;
		}
		this.warp_index = Math.max(this.warp_index - 1, 0);
	}

	set_warp_index(index: number): void {
		if (this.mode === "eva") {
			return;
		}
		this.warp_index = Math.max(
			0,
			Math.min(TIME_WARP_FACTORS.length - 1, index),
		);
	}

	toggle_eva(): void {
		if (this.mode === "inside") {
			this.mode = "eva";
			this.warp_index = 0;
			this.astronaut_x = EVA_EXIT_OFFSET_M;
			this.astronaut_y = 0;
			this.astronaut_vx = 0;
			this.astronaut_vy = 0;
			return;
		}
		if (this.can_reenter()) {
			this.enter_spacecraft();
		}
	}

	return_to_ship(): void {
		if (this.mode === "eva") {
			this.enter_spacecraft();
		}
	}

	update(dt_seconds: number, thrust: ThrustVector): void {
		const warp = this.warp;
		this.simulated_seconds += dt_seconds * warp;
		this.angle_rad += this.angular_velocity_rad_s * dt_seconds * warp;

		if (this.mode !== "eva") {
			this.thrusting = false;
			return;
		}

		this.thrusting = thrust.x !== 0 || thrust.y !== 0;
		this.astronaut_vx += thrust.x * EVA_ACCELERATION_M_S2 * dt_seconds;
		this.astronaut_vy += thrust.y * EVA_ACCELERATION_M_S2 * dt_seconds;

		const distance = Math.hypot(this.astronaut_x, this.astronaut_y);
		if (distance > EVA_TETHER_SOFT_LIMIT_M) {
			const pull =
				((distance - EVA_TETHER_SOFT_LIMIT_M) /
					(EVA_TETHER_SOFT_LIMIT_M * 0.5)) *
				EVA_TETHER_PULL_M_S2;
			this.astronaut_vx -= (this.astronaut_x / distance) * pull * dt_seconds;
			this.astronaut_vy -= (this.astronaut_y / distance) * pull * dt_seconds;
		}

		this.astronaut_x += this.astronaut_vx * dt_seconds;
		this.astronaut_y += this.astronaut_vy * dt_seconds;
	}

	can_reenter(): boolean {
		const distance = Math.hypot(this.astronaut_x, this.astronaut_y);
		const speed = Math.hypot(this.astronaut_vx, this.astronaut_vy);
		return distance <= EVA_REENTRY_DISTANCE_M && speed <= EVA_REENTRY_SPEED_M_S;
	}

	snapshot(): OrbitSnapshot {
		const distance = Math.hypot(this.astronaut_x, this.astronaut_y);
		const astronaut_speed = Math.hypot(this.astronaut_vx, this.astronaut_vy);
		return {
			altitude_m: this.altitude_m,
			speed_m_s: this.speed_m_s,
			period_s: this.period_s,
			warp: this.warp,
			mode: this.mode,
			astronaut_distance_m: distance,
			astronaut_speed_m_s: astronaut_speed,
			can_reenter: this.can_reenter(),
			message: this.message_for_status(distance),
		};
	}

	private enter_spacecraft(): void {
		this.mode = "inside";
		this.astronaut_x = 0;
		this.astronaut_y = 0;
		this.astronaut_vx = 0;
		this.astronaut_vy = 0;
		this.thrusting = false;
	}

	private message_for_status(distance_m: number): string {
		if (this.mode === "inside") {
			if (this.warp > 1) {
				return `Time warp ×${this.warp.toLocaleString("en-US")} — the orbit is advancing faster.`;
			}
			return "In orbit. Raise time warp, or press E to step outside for EVA.";
		}
		if (this.can_reenter()) {
			return "You are at the hatch. Press E (or Enter spacecraft) to climb back in.";
		}
		if (distance_m > EVA_TETHER_SOFT_LIMIT_M) {
			return "Tether limit reached — fire the RCS thrusters back toward the spacecraft.";
		}
		return "EVA. Use W/A/S/D or the arrow keys to fire the RCS thrusters.";
	}
}
