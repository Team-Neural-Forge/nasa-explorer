import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import {
	type LandingSnapshot,
	LunarLandingSimulation,
} from "../engine/lunar_landing_simulation";
import { landing_actions } from "../state/landing_control";
import { publishLandingTelemetry } from "../state/landing_telemetry";
import type { LanderStats } from "../state/rocket_config";
import { advanceSimulationTime } from "../state/simulation_clock";
import { drawEarth } from "./earth_renderer";
import { ExplosionEffect } from "./explosion_effect";
import { createStarfield, drawStarfield } from "./starfield";

const TELEMETRY_INTERVAL_S = 0.08;
const THROTTLE_RATE_PER_S = 0.6;
const ROTATION_RATE_RAD_S = Math.PI / 6;
const START_ALTITUDE_M = 2000;
const LANDER_SCREEN_HEIGHT_RATIO = 0.28;
const GROUND_TRAVEL_RATIO = 0.55;

export class LunarLandingWorld implements GameWorld {
	private readonly simulation: LunarLandingSimulation;
	private readonly input: KeyboardState;
	private readonly stars = createStarfield(220);
	private elapsed_seconds = 0;
	private telemetry_timer = 0;
	private explosion: ExplosionEffect | null = null;

	constructor(stats: LanderStats, input: KeyboardState) {
		this.simulation = new LunarLandingSimulation(stats);
		this.input = input;
		landing_actions.current = {
			throttle_up: () => this.simulation.adjustThrottle(0.1),
			throttle_down: () => this.simulation.adjustThrottle(-0.1),
			rotate_left: () => this.simulation.adjustAttitude(-Math.PI / 36),
			rotate_right: () => this.simulation.adjustAttitude(Math.PI / 36),
			toggle_autopilot: () => this.simulation.toggle_autopilot(),
		};
		this.publish();
	}

	update(dt_seconds: number): void {
		advanceSimulationTime(dt_seconds);
		this.elapsed_seconds += dt_seconds;

		if (this.input.consumePress("KeyP")) {
			this.simulation.toggle_autopilot();
		}
		if (this.input.isDown("ArrowUp") || this.input.isDown("KeyW")) {
			this.simulation.adjustThrottle(THROTTLE_RATE_PER_S * dt_seconds);
		}
		if (this.input.isDown("ArrowDown") || this.input.isDown("KeyS")) {
			this.simulation.adjustThrottle(-THROTTLE_RATE_PER_S * dt_seconds);
		}
		if (this.input.isDown("ArrowLeft") || this.input.isDown("KeyA")) {
			this.simulation.adjustAttitude(-ROTATION_RATE_RAD_S * dt_seconds);
		}
		if (this.input.isDown("ArrowRight") || this.input.isDown("KeyD")) {
			this.simulation.adjustAttitude(ROTATION_RATE_RAD_S * dt_seconds);
		}

		this.simulation.update(dt_seconds);
		if (this.simulation.snapshot().status === "crashed" && !this.explosion) {
			this.explosion = new ExplosionEffect();
		}
		this.explosion?.update(dt_seconds);

		this.telemetry_timer += dt_seconds;
		if (this.telemetry_timer >= TELEMETRY_INTERVAL_S) {
			this.publish();
			this.telemetry_timer = 0;
		}

		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const snapshot = this.simulation.snapshot();
		const minimum = Math.min(width, height);
		const scale = (height * GROUND_TRAVEL_RATIO) / START_ALTITUDE_M;
		const lander_x = width * 0.5;
		const lander_y = height * LANDER_SCREEN_HEIGHT_RATIO;
		const ground_y = lander_y + snapshot.altitude_m * scale;

		this.drawSky(ctx, width, height);
		drawStarfield(ctx, this.stars, width, height, this.elapsed_seconds, 0, 0);
		drawEarth(ctx, {
			center_x: width * 0.62,
			center_y: height * 0.18,
			radius: minimum * 0.035,
			time_seconds: this.elapsed_seconds,
		});

		this.drawGround(ctx, width, height, ground_y, scale, snapshot);
		this.drawGuideline(ctx, lander_x, lander_y, ground_y);
		if (snapshot.status === "crashed") {
			ctx.fillStyle = "rgba(30, 25, 25, 0.65)";
			ctx.beginPath();
			ctx.ellipse(
				lander_x,
				ground_y,
				minimum * 0.06,
				minimum * 0.012,
				0,
				0,
				Math.PI * 2,
			);
			ctx.fill();
			this.explosion?.draw(ctx, lander_x, lander_y, minimum * 0.22);
		} else {
			this.drawLander(ctx, lander_x, lander_y, minimum / 520, snapshot);
		}
	}

	private publish(): void {
		publishLandingTelemetry(this.simulation.snapshot());
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#02040a");
		sky.addColorStop(1, "#05070d");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);
	}

	private drawGround(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		ground_y: number,
		scale: number,
		snapshot: LandingSnapshot,
	): void {
		if (ground_y > height + 10) {
			return;
		}

		const ground = ctx.createLinearGradient(0, ground_y, 0, height);
		ground.addColorStop(0, "#8d939d");
		ground.addColorStop(0.35, "#6b717b");
		ground.addColorStop(1, "#3d424a");
		ctx.fillStyle = ground;
		ctx.fillRect(0, ground_y, width, height - ground_y);

		ctx.strokeStyle = "rgba(220, 226, 236, 0.35)";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(0, ground_y);
		ctx.lineTo(width, ground_y);
		ctx.stroke();

		const horizontal_offset = this.simulation.horizontal_position_m * scale;
		for (let index = 0; index < 22; index += 1) {
			const world_x = ((index * 197) % 2400) - 1200;
			const screen_x = width * 0.5 + world_x * scale - horizontal_offset;
			if (screen_x < -80 || screen_x > width + 80) {
				continue;
			}
			const crater_y = ground_y + 16 + (index % 5) * 16;
			if (crater_y > height) {
				continue;
			}
			const crater_radius = 8 + (index % 4) * 7;
			ctx.fillStyle = "rgba(55, 60, 68, 0.55)";
			ctx.beginPath();
			ctx.ellipse(
				screen_x,
				crater_y,
				crater_radius,
				crater_radius * 0.32,
				0,
				0,
				Math.PI * 2,
			);
			ctx.fill();
			ctx.strokeStyle = "rgba(205, 212, 223, 0.18)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.ellipse(
				screen_x,
				crater_y - 2,
				crater_radius * 0.85,
				crater_radius * 0.24,
				0,
				Math.PI,
				Math.PI * 2,
			);
			ctx.stroke();
		}

		if (snapshot.altitude_m < 80 && snapshot.throttle > 0) {
			ctx.fillStyle = "rgba(200, 195, 185, 0.18)";
			for (let index = 0; index < 14; index += 1) {
				const dust_x = width * 0.5 + ((index * 53) % 200) - 100;
				const dust_y = ground_y - (index % 4) * 5;
				ctx.beginPath();
				ctx.arc(dust_x, dust_y, 6 + (index % 3) * 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	private drawGuideline(
		ctx: CanvasRenderingContext2D,
		lander_x: number,
		lander_y: number,
		ground_y: number,
	): void {
		if (ground_y <= lander_y + 10) {
			return;
		}
		ctx.save();
		ctx.strokeStyle = "rgba(122, 184, 255, 0.25)";
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 8]);
		ctx.beginPath();
		ctx.moveTo(lander_x, lander_y + 30);
		ctx.lineTo(lander_x, ground_y);
		ctx.stroke();
		ctx.restore();
	}

	private drawLander(
		ctx: CanvasRenderingContext2D,
		center_x: number,
		center_y: number,
		scale: number,
		snapshot: LandingSnapshot,
	): void {
		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.rotate((snapshot.attitude_deg * Math.PI) / 180);
		ctx.scale(scale, scale);

		const burning =
			snapshot.status === "flying" &&
			snapshot.throttle > 0 &&
			snapshot.fuel_fraction > 0;
		if (burning) {
			const flame_length = 30 + 60 * snapshot.throttle;
			const flame = ctx.createLinearGradient(0, 34, 0, 34 + flame_length);
			flame.addColorStop(0, "rgba(255, 236, 170, 0.95)");
			flame.addColorStop(0.5, "rgba(255, 160, 60, 0.75)");
			flame.addColorStop(1, "rgba(255, 90, 30, 0)");
			ctx.fillStyle = flame;
			ctx.beginPath();
			ctx.moveTo(-10, 34);
			ctx.quadraticCurveTo(0, 34 + flame_length, 10, 34);
			ctx.closePath();
			ctx.fill();
		}

		ctx.fillStyle = "#9aa3b0";
		ctx.fillRect(-4, 26, 8, 14);

		ctx.fillStyle = "#d9dfe8";
		ctx.beginPath();
		ctx.moveTo(-26, -12);
		ctx.lineTo(-18, -26);
		ctx.lineTo(18, -26);
		ctx.lineTo(26, -12);
		ctx.lineTo(20, 22);
		ctx.lineTo(-20, 22);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "#b7c0cc";
		ctx.fillRect(-20, 22, 40, 8);

		ctx.fillStyle = "rgba(30, 55, 90, 0.9)";
		ctx.beginPath();
		ctx.arc(-8, -8, 5, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(8, -8, 5, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = "#aeb7c4";
		ctx.lineWidth = 4;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(-22, 20);
		ctx.lineTo(-34, 44);
		ctx.moveTo(22, 20);
		ctx.lineTo(34, 44);
		ctx.moveTo(-12, 22);
		ctx.lineTo(-16, 46);
		ctx.moveTo(12, 22);
		ctx.lineTo(16, 46);
		ctx.stroke();

		ctx.fillStyle = "#cfd6e0";
		ctx.fillRect(-2, -40, 4, 16);
		ctx.beginPath();
		ctx.arc(0, -42, 3, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}
}
