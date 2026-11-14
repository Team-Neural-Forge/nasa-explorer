import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import {
	LaunchSimulation,
	type LaunchSnapshot,
} from "../engine/launch_simulation";
import { launch_actions } from "../state/launch_control";
import { publishLaunchTelemetry } from "../state/launch_telemetry";
import type { RocketStats } from "../state/rocket_config";
import { advanceSimulationTime } from "../state/simulation_clock";
import { createStarfield, drawStarfield } from "./starfield";

const SIMULATION_SPEED = 4;
const ROTATION_RATE_RAD_S = Math.PI / 4;
const THROTTLE_RATE_PER_S = 0.9;
const TELEMETRY_INTERVAL_S = 0.08;

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function mixColor(from: string, to: string, t: number): string {
	const ratio = clamp01(t);
	const from_value = Number.parseInt(from.slice(1), 16);
	const to_value = Number.parseInt(to.slice(1), 16);
	const red = Math.round(
		((from_value >> 16) & 0xff) * (1 - ratio) +
			((to_value >> 16) & 0xff) * ratio,
	);
	const green = Math.round(
		((from_value >> 8) & 0xff) * (1 - ratio) + ((to_value >> 8) & 0xff) * ratio,
	);
	const blue = Math.round(
		(from_value & 0xff) * (1 - ratio) + (to_value & 0xff) * ratio,
	);
	return `rgb(${red}, ${green}, ${blue})`;
}

export class LaunchWorld implements GameWorld {
	private readonly simulation: LaunchSimulation;
	private readonly input: KeyboardState;
	private readonly stars = createStarfield(190);
	private time_seconds = 0;
	private telemetry_timer = 0;

	constructor(stats: RocketStats, input: KeyboardState) {
		this.simulation = new LaunchSimulation(stats);
		this.input = input;
		launch_actions.current = {
			ignite: () => this.simulation.ignite(),
			retry: () => this.simulation.retry(),
			throttle_up: () => this.simulation.adjustThrottle(0.1),
			throttle_down: () => this.simulation.adjustThrottle(-0.1),
			rotate_left: () => this.simulation.adjustAttitude(-Math.PI / 36),
			rotate_right: () => this.simulation.adjustAttitude(Math.PI / 36),
			stage: () => this.simulation.stage(),
		};
		this.publish();
	}

	update(dt_seconds: number): void {
		advanceSimulationTime(dt_seconds * SIMULATION_SPEED);
		this.time_seconds += dt_seconds;

		if (this.input.consumePress("Enter")) {
			this.simulation.ignite();
		}
		if (this.input.consumePress("Space")) {
			this.simulation.stage();
		}
		if (this.input.consumePress("KeyR")) {
			this.simulation.retry();
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

		let remaining = dt_seconds * SIMULATION_SPEED;
		while (remaining > 0) {
			const step = Math.min(0.02, remaining);
			this.simulation.update(step);
			remaining -= step;
		}

		this.telemetry_timer += dt_seconds;
		if (this.telemetry_timer >= TELEMETRY_INTERVAL_S) {
			this.publish();
			this.telemetry_timer = 0;
		}

		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const snapshot = this.simulation.snapshot();
		const altitude = Math.max(0, snapshot.altitude_m);
		const space_mix = clamp01(altitude / 90_000);

		this.drawSky(ctx, width, height, space_mix);

		const star_opacity = clamp01((altitude - 20_000) / 55_000);
		drawStarfield(
			ctx,
			this.stars,
			width,
			height,
			this.time_seconds,
			0,
			0,
			star_opacity,
		);

		this.drawPlanet(ctx, width, height, altitude);
		this.drawGuidance(ctx, width, height, snapshot);
		this.drawRocket(ctx, width, height, snapshot);
	}

	private publish(): void {
		publishLaunchTelemetry(this.simulation.snapshot());
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		space_mix: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, mixColor("#12386b", "#02040a", space_mix));
		sky.addColorStop(0.55, mixColor("#1f5f9c", "#050b18", space_mix));
		sky.addColorStop(1, mixColor("#3f86bd", "#0a1426", space_mix));
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);
	}

	private drawPlanet(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		altitude_m: number,
	): void {
		const curvature = clamp01((altitude_m - 4000) / 70_000);
		const radius = width * (4.8 - 3.1 * curvature);
		const center_x = width * 0.5;
		const center_y = height + radius - height * 0.08;

		const surface = ctx.createLinearGradient(
			center_x,
			center_y - radius,
			center_x,
			height,
		);
		surface.addColorStop(0, "#2f7fb8");
		surface.addColorStop(0.35, "#1b4f86");
		surface.addColorStop(1, "#0a2140");
		ctx.fillStyle = surface;
		ctx.beginPath();
		ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(center_x, center_y, radius, Math.PI * 1.05, Math.PI * 1.95);
		ctx.strokeStyle = "rgba(140, 200, 255, 0.55)";
		ctx.lineWidth = Math.max(1, width * 0.0025);
		ctx.stroke();

		if (altitude_m < 4000) {
			this.drawPad(ctx, width, height, altitude_m);
		}
	}

	private drawPad(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		altitude_m: number,
	): void {
		const fade = 1 - clamp01(altitude_m / 4000);
		if (fade <= 0) {
			return;
		}
		const ground_y = height * 0.86 + (altitude_m / 4000) * height * 0.5;
		ctx.save();
		ctx.globalAlpha = fade;
		ctx.fillStyle = "rgba(4, 8, 16, 0.9)";
		ctx.fillRect(width * 0.5 - 120, ground_y, 240, height - ground_y);
		ctx.fillRect(width * 0.5 + 70, ground_y - 90, 8, 90);
		ctx.fillRect(width * 0.5 + 78, ground_y - 90, 34, 6);
		ctx.restore();
	}

	private drawGuidance(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		snapshot: LaunchSnapshot,
	): void {
		const center_x = width * 0.5;
		const center_y = height * 0.6;
		const guidance = (snapshot.guidance_angle_deg * Math.PI) / 180;

		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.rotate(guidance);
		ctx.strokeStyle = "rgba(122, 184, 255, 0.55)";
		ctx.lineWidth = 1.5;
		ctx.setLineDash([8, 10]);
		ctx.beginPath();
		ctx.moveTo(0, -70);
		ctx.lineTo(0, -height * 0.32);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.fillStyle = "rgba(122, 184, 255, 0.8)";
		ctx.beginPath();
		ctx.moveTo(0, -height * 0.34);
		ctx.lineTo(-6, -height * 0.32);
		ctx.lineTo(6, -height * 0.32);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}

	private drawRocket(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		snapshot: LaunchSnapshot,
	): void {
		const center_x = width * 0.5;
		const center_y = height * 0.6;
		const scale = Math.max(1, Math.min(width, height) / 620);

		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.rotate((snapshot.attitude_deg * Math.PI) / 180);
		ctx.scale(scale, scale);

		const burning =
			snapshot.status === "flying" &&
			snapshot.throttle > 0 &&
			snapshot.fuel_fraction > 0;
		if (burning) {
			const flame_length = 40 + 70 * snapshot.throttle;
			const flame = ctx.createLinearGradient(0, 40, 0, 40 + flame_length);
			flame.addColorStop(0, "rgba(255, 236, 170, 0.95)");
			flame.addColorStop(0.45, "rgba(255, 160, 60, 0.8)");
			flame.addColorStop(1, "rgba(255, 90, 30, 0)");
			ctx.fillStyle = flame;
			ctx.beginPath();
			ctx.moveTo(-9, 40);
			ctx.quadraticCurveTo(0, 40 + flame_length, 9, 40);
			ctx.closePath();
			ctx.fill();
		}

		ctx.fillStyle = "#dbe9fb";
		ctx.fillRect(-9, -52, 18, 92);
		ctx.beginPath();
		ctx.moveTo(-9, -52);
		ctx.lineTo(0, -82);
		ctx.lineTo(9, -52);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "#9fc6ee";
		ctx.beginPath();
		ctx.moveTo(-9, 40);
		ctx.lineTo(-20, 58);
		ctx.lineTo(-9, 52);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(9, 40);
		ctx.lineTo(20, 58);
		ctx.lineTo(9, 52);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "rgba(20, 40, 70, 0.9)";
		ctx.beginPath();
		ctx.arc(0, -30, 5, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}
}
