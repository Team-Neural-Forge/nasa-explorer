import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import {
	type AstronautRelativeState,
	type OrbitInsertion,
	OrbitSimulation,
} from "../engine/orbit_simulation";
import { orbit_actions } from "../state/orbit_control";
import { publishOrbitTelemetry } from "../state/orbit_telemetry";
import { drawEarth } from "./earth_renderer";
import { createStarfield, drawStarfield } from "./starfield";

const TELEMETRY_INTERVAL_S = 0.08;
const EVA_VIEW_SCALE_PX_PER_M = 14;

export class OrbitWorld implements GameWorld {
	private readonly simulation: OrbitSimulation;
	private readonly input: KeyboardState;
	private readonly stars = createStarfield(230);
	private elapsed_seconds = 0;
	private telemetry_timer = 0;

	constructor(insertion: OrbitInsertion | null, input: KeyboardState) {
		this.simulation = new OrbitSimulation(insertion);
		this.input = input;
		orbit_actions.current = {
			toggle_eva: () => this.simulation.toggle_eva(),
			increase_warp: () => this.simulation.increase_warp(),
			decrease_warp: () => this.simulation.decrease_warp(),
			set_warp_index: (index) => this.simulation.set_warp_index(index),
			return_to_ship: () => this.simulation.return_to_ship(),
		};
		this.publish();
	}

	update(dt_seconds: number): void {
		this.elapsed_seconds += dt_seconds;

		if (this.input.consumePress("KeyE")) {
			this.simulation.toggle_eva();
		}
		if (this.input.consumePress("BracketRight")) {
			this.simulation.increase_warp();
		}
		if (this.input.consumePress("BracketLeft")) {
			this.simulation.decrease_warp();
		}

		let thrust_x = 0;
		let thrust_y = 0;
		if (this.input.isDown("ArrowLeft") || this.input.isDown("KeyA")) {
			thrust_x -= 1;
		}
		if (this.input.isDown("ArrowRight") || this.input.isDown("KeyD")) {
			thrust_x += 1;
		}
		if (this.input.isDown("ArrowUp") || this.input.isDown("KeyW")) {
			thrust_y += 1;
		}
		if (this.input.isDown("ArrowDown") || this.input.isDown("KeyS")) {
			thrust_y -= 1;
		}

		this.simulation.update(dt_seconds, { x: thrust_x, y: thrust_y });

		this.telemetry_timer += dt_seconds;
		if (this.telemetry_timer >= TELEMETRY_INTERVAL_S) {
			this.publish();
			this.telemetry_timer = 0;
		}

		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const snapshot = this.simulation.snapshot();
		this.drawSky(ctx, width, height);

		const drift = this.simulation.warp > 1 ? this.elapsed_seconds * 0.6 : 0;
		drawStarfield(
			ctx,
			this.stars,
			width,
			height,
			this.elapsed_seconds,
			drift,
			drift * 0.35,
		);

		const minimum = Math.min(width, height);
		drawEarth(ctx, {
			center_x: width * 0.5,
			center_y: height * 0.84,
			radius: minimum * 0.62,
			time_seconds: this.simulation.elapsed_simulated_seconds,
		});

		if (snapshot.mode === "inside") {
			this.drawSpacecraft(ctx, width * 0.5, height * 0.5, minimum / 420, 0);
			return;
		}

		const astronaut = this.simulation.astronaut_state;
		const scale = Math.max(6, Math.min(EVA_VIEW_SCALE_PX_PER_M, minimum / 55));
		const ship_x = width * 0.5 - astronaut.x_m * scale;
		const ship_y = height * 0.5 + astronaut.y_m * scale;

		this.drawTether(ctx, ship_x, ship_y, width * 0.5, height * 0.5);
		this.drawSpacecraft(ctx, ship_x, ship_y, minimum / 520, 0);
		this.drawAstronaut(
			ctx,
			width * 0.5,
			height * 0.5,
			minimum / 460,
			astronaut,
		);
	}

	private publish(): void {
		publishOrbitTelemetry(this.simulation.snapshot());
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#02040a");
		sky.addColorStop(0.6, "#040a16");
		sky.addColorStop(1, "#071226");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);
	}

	private drawTether(
		ctx: CanvasRenderingContext2D,
		from_x: number,
		from_y: number,
		to_x: number,
		to_y: number,
	): void {
		const mid_x = (from_x + to_x) / 2;
		const mid_y = (from_y + to_y) / 2 + 18;
		ctx.save();
		ctx.strokeStyle = "rgba(210, 225, 245, 0.35)";
		ctx.lineWidth = 1.2;
		ctx.setLineDash([6, 5]);
		ctx.beginPath();
		ctx.moveTo(from_x, from_y);
		ctx.quadraticCurveTo(mid_x, mid_y, to_x, to_y);
		ctx.stroke();
		ctx.restore();
	}

	private drawSpacecraft(
		ctx: CanvasRenderingContext2D,
		center_x: number,
		center_y: number,
		scale: number,
		rotation: number,
	): void {
		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.rotate(rotation);
		ctx.scale(scale, scale);

		ctx.fillStyle = "rgba(120, 170, 230, 0.55)";
		ctx.fillRect(-62, -22, 34, 44);
		ctx.fillRect(-62, 22, 34, 4);
		ctx.fillStyle = "rgba(40, 80, 140, 0.9)";
		ctx.fillRect(-62, -24, 4, 48);

		ctx.fillStyle = "#aebfd6";
		ctx.fillRect(-28, -18, 30, 36);

		ctx.fillStyle = "#e2edf9";
		ctx.beginPath();
		ctx.moveTo(2, -18);
		ctx.lineTo(34, -10);
		ctx.lineTo(34, 10);
		ctx.lineTo(2, 18);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "rgba(20, 45, 80, 0.9)";
		ctx.beginPath();
		ctx.arc(8, -2, 6, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}

	private drawAstronaut(
		ctx: CanvasRenderingContext2D,
		center_x: number,
		center_y: number,
		scale: number,
		astronaut: AstronautRelativeState,
	): void {
		ctx.save();
		ctx.translate(center_x, center_y);
		ctx.scale(scale, scale);

		if (astronaut.thrusting) {
			ctx.fillStyle = "rgba(200, 230, 255, 0.5)";
			const puff_x = astronaut.vx_m_s > 0 ? -20 : 20;
			const puff_y = astronaut.vy_m_s > 0 ? 18 : -18;
			ctx.beginPath();
			ctx.arc(puff_x, puff_y, 6, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.fillStyle = "#c9d6e6";
		ctx.fillRect(-14, -16, 10, 32);

		ctx.fillStyle = "#eef4fb";
		ctx.fillRect(-8, -14, 18, 28);

		ctx.fillStyle = "#dfe9f5";
		ctx.beginPath();
		ctx.arc(0, -22, 11, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "rgba(30, 60, 100, 0.95)";
		ctx.beginPath();
		ctx.arc(2, -22, 7, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = "#dfe9f5";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(-6, 0);
		ctx.lineTo(-16, 12);
		ctx.moveTo(8, 0);
		ctx.lineTo(18, 12);
		ctx.moveTo(-4, 14);
		ctx.lineTo(-10, 28);
		ctx.moveTo(6, 14);
		ctx.lineTo(12, 28);
		ctx.stroke();

		ctx.restore();
	}
}
