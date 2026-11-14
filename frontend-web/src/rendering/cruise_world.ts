import { CruiseSimulation } from "../engine/cruise_simulation";
import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import { cruise_actions } from "../state/cruise_control";
import { publishCruiseTelemetry } from "../state/cruise_telemetry";
import { advanceSimulationTime } from "../state/simulation_clock";
import { drawEarth } from "./earth_renderer";
import { drawMoon } from "./moon_renderer";
import { createStarfield, drawStarfield } from "./starfield";

const TELEMETRY_INTERVAL_S = 0.08;

export class CruiseWorld implements GameWorld {
	private readonly simulation: CruiseSimulation;
	private readonly input: KeyboardState;
	private readonly stars = createStarfield(240);
	private elapsed_seconds = 0;
	private telemetry_timer = 0;

	constructor(input: KeyboardState) {
		this.simulation = new CruiseSimulation();
		this.input = input;
		cruise_actions.current = {
			increase_warp: () => this.simulation.increase_warp(),
			decrease_warp: () => this.simulation.decrease_warp(),
			set_warp_index: (index) => this.simulation.set_warp_index(index),
		};
		this.publish();
	}

	update(dt_seconds: number): void {
		this.elapsed_seconds += dt_seconds;
		if (this.input.consumePress("BracketRight")) {
			this.simulation.increase_warp();
		}
		if (this.input.consumePress("BracketLeft")) {
			this.simulation.decrease_warp();
		}

		const before = this.simulation.snapshot();
		this.simulation.update(dt_seconds);
		const after = this.simulation.snapshot();
		advanceSimulationTime(
			before.status === "arrived"
				? dt_seconds
				: (before.distance_remaining_m - after.distance_remaining_m) /
						before.speed_m_s,
		);

		this.telemetry_timer += dt_seconds;
		if (this.telemetry_timer >= TELEMETRY_INTERVAL_S) {
			this.publish();
			this.telemetry_timer = 0;
		}

		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const snapshot = this.simulation.snapshot();
		const progress = snapshot.progress;

		this.drawSky(ctx, width, height);

		const warp = snapshot.warp;
		const drift = warp > 1 ? this.elapsed_seconds * Math.log10(warp) * 4 : 0;
		drawStarfield(
			ctx,
			this.stars,
			width,
			height,
			this.elapsed_seconds,
			drift,
			0,
		);

		this.drawMotionStreaks(ctx, width, height, warp);

		const minimum = Math.min(width, height);
		const earth_radius = minimum * (0.34 - 0.26 * progress);
		drawEarth(ctx, {
			center_x: width * (0.15 - 0.05 * progress),
			center_y: height * 0.58,
			radius: Math.max(minimum * 0.06, earth_radius),
			time_seconds: this.elapsed_seconds,
		});

		const moon_radius = minimum * (0.05 + 0.11 * progress);
		drawMoon(ctx, {
			center_x: width * (0.58 + 0.03 * progress),
			center_y: height * 0.42,
			radius: moon_radius,
		});

		this.drawTrajectory(ctx, width, height, progress);
		this.drawSpacecraft(ctx, width * 0.5, height * 0.52, minimum / 480, warp);
	}

	private publish(): void {
		publishCruiseTelemetry(this.simulation.snapshot());
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#02040a");
		sky.addColorStop(0.6, "#030814");
		sky.addColorStop(1, "#061020");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);
	}

	private drawMotionStreaks(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		warp: number,
	): void {
		if (warp < 1000) {
			return;
		}
		const intensity = Math.min(0.28, Math.log10(warp) * 0.045);
		ctx.save();
		ctx.strokeStyle = `rgba(180, 210, 245, ${intensity})`;
		ctx.lineWidth = 1;
		for (let index = 0; index < 28; index += 1) {
			const y =
				((index * 97 + this.elapsed_seconds * 260) % (height + 80)) - 40;
			const x = (index * 211) % width;
			const length = 40 + ((index * 37) % 120);
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + length, y);
			ctx.stroke();
		}
		ctx.restore();
	}

	private drawTrajectory(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		progress: number,
	): void {
		const start_x = width * 0.22;
		const start_y = height * 0.58;
		const end_x = width * 0.61;
		const end_y = height * 0.42;
		const control_x = width * 0.46;
		const control_y = height * 0.24;

		ctx.save();
		ctx.strokeStyle = "rgba(122, 184, 255, 0.35)";
		ctx.lineWidth = 1.5;
		ctx.setLineDash([6, 8]);
		ctx.beginPath();
		ctx.moveTo(start_x, start_y);
		ctx.quadraticCurveTo(control_x, control_y, end_x, end_y);
		ctx.stroke();
		ctx.setLineDash([]);

		const marker = quadraticPoint(
			start_x,
			start_y,
			control_x,
			control_y,
			end_x,
			end_y,
			progress,
		);
		ctx.fillStyle = "rgba(160, 210, 255, 0.9)";
		ctx.shadowColor = "rgba(120, 190, 255, 0.8)";
		ctx.shadowBlur = 12;
		ctx.beginPath();
		ctx.arc(marker.x, marker.y, 3.5, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	private drawSpacecraft(
		ctx: CanvasRenderingContext2D,
		center_x: number,
		center_y: number,
		scale: number,
		warp: number,
	): void {
		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.scale(scale, scale);

		const flame_alpha = warp >= 1000 ? 0.85 : 0.45;
		const flame = ctx.createLinearGradient(-46, 0, -10, 0);
		flame.addColorStop(0, "rgba(120, 190, 255, 0)");
		flame.addColorStop(1, `rgba(150, 210, 255, ${flame_alpha})`);
		ctx.fillStyle = flame;
		ctx.beginPath();
		ctx.moveTo(-16, -8);
		ctx.lineTo(-16, 8);
		ctx.lineTo(-46 - (warp >= 1000 ? 16 : 0), 0);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "rgba(120, 170, 230, 0.55)";
		ctx.fillRect(-16, -18, 14, 36);

		ctx.fillStyle = "#aebfd6";
		ctx.fillRect(0, -14, 22, 28);

		ctx.fillStyle = "#e2edf9";
		ctx.beginPath();
		ctx.moveTo(22, -14);
		ctx.lineTo(48, -6);
		ctx.lineTo(48, 6);
		ctx.lineTo(22, 14);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "rgba(20, 45, 80, 0.9)";
		ctx.beginPath();
		ctx.arc(28, 0, 4.5, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}
}

function quadraticPoint(
	start_x: number,
	start_y: number,
	control_x: number,
	control_y: number,
	end_x: number,
	end_y: number,
	t: number,
): { x: number; y: number } {
	const inverse = 1 - t;
	return {
		x:
			inverse * inverse * start_x + 2 * inverse * t * control_x + t * t * end_x,
		y:
			inverse * inverse * start_y + 2 * inverse * t * control_y + t * t * end_y,
	};
}
