import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import {
	earth_input,
	publishEarthLocation,
	publishEarthWarning,
} from "../state/earth_interaction";
import {
	ASTRONAUT_HEIGHT_M,
	ASTRONAUT_MASS_KG,
	ASTRONAUT_START_X_M,
	ASTRONAUT_WIDTH_M,
	clamp_to_world,
	GRAVITY_M_S2,
	GROUND_MAX_M,
	GROUND_MIN_M,
	JUMP_IMPULSE_N_S,
	move_toward,
	ROCKET_INTERACTION_M,
	ROCKET_X_M,
	STORE_HEIGHT_M,
	STORE_INTERACTION_M,
	STORE_WIDTH_M,
	STORE_X_M,
	WALK_ACCELERATION_M_S2,
	WALK_SPEED_M_S,
} from "../state/earth_scene";
import { advanceSimulationTime } from "../state/simulation_clock";

const WARNING_DURATION_S = 2.5;
const CAMERA_FOLLOW_RATE = 6;

export type RocketDimensions = {
	height_m: number;
	diameter_m: number;
};

export class EarthSurfaceWorld implements GameWorld {
	private readonly input: KeyboardState;
	private readonly jump_velocity_m_s = JUMP_IMPULSE_N_S / ASTRONAUT_MASS_KG;
	private playing = false;
	private x_m = ASTRONAUT_START_X_M;
	private y_m = 0;
	private vx_m_s = 0;
	private vy_m_s = 0;
	private grounded = true;
	private jump_held = false;
	private camera_x_m = ROCKET_X_M - 4;
	private warning_timer_s = 0;
	private walk_phase = 0;
	private rocket_height_m: number;
	private rocket_diameter_m: number;

	constructor(input: KeyboardState, rocket: RocketDimensions) {
		this.input = input;
		this.rocket_height_m = Math.max(1, rocket.height_m);
		this.rocket_diameter_m = Math.max(0.5, rocket.diameter_m);
	}

	setPlaying(playing: boolean): void {
		this.playing = playing;
	}

	set_rocket_dimensions(height_m: number, diameter_m: number): void {
		this.rocket_height_m = Math.max(1, height_m);
		this.rocket_diameter_m = Math.max(0.5, diameter_m);
	}

	update(dt_seconds: number): void {
		const dt = Math.min(Math.max(dt_seconds, 0), 0.05);
		if (this.playing) {
			advanceSimulationTime(dt_seconds);
		}

		const direction = this.playing
			? Number(
					this.input.isDown("ArrowRight") ||
						this.input.isDown("KeyD") ||
						earth_input.right,
				) -
				Number(
					this.input.isDown("ArrowLeft") ||
						this.input.isDown("KeyA") ||
						earth_input.left,
				)
			: 0;
		const target_speed = direction * WALK_SPEED_M_S;
		const acceleration =
			WALK_ACCELERATION_M_S2 * (direction === 0 ? 1.5 : 1) * dt;
		this.vx_m_s = move_toward(this.vx_m_s, target_speed, acceleration);

		const jumping =
			this.playing &&
			(this.input.isDown("Space") ||
				this.input.isDown("KeyW") ||
				this.input.isDown("ArrowUp") ||
				earth_input.jump);
		if (jumping && !this.jump_held && this.grounded) {
			this.vy_m_s = this.jump_velocity_m_s;
			this.grounded = false;
		}
		this.jump_held = jumping;

		this.vy_m_s -= GRAVITY_M_S2 * dt;
		this.x_m += this.vx_m_s * dt;
		this.y_m += this.vy_m_s * dt;

		if (this.y_m <= 0) {
			this.y_m = 0;
			this.vy_m_s = 0;
			this.grounded = true;
		}

		const clamped = clamp_to_world(this.x_m);
		this.x_m = clamped.x_m;
		if (clamped.at_wall) {
			this.vx_m_s = 0;
			this.warning_timer_s = WARNING_DURATION_S;
		} else if (this.warning_timer_s > 0) {
			this.warning_timer_s = Math.max(0, this.warning_timer_s - dt);
		}
		publishEarthWarning(this.warning_timer_s > 0);

		const target_camera = this.playing ? this.x_m : ROCKET_X_M - 4;
		this.camera_x_m +=
			(target_camera - this.camera_x_m) * Math.min(1, dt * CAMERA_FOLLOW_RATE);

		if (this.playing && this.grounded && Math.abs(this.vx_m_s) > 0.1) {
			this.walk_phase += dt * Math.abs(this.vx_m_s) * 4;
		} else {
			this.walk_phase *= Math.max(0, 1 - dt * 8);
		}

		const rocket_distance = Math.abs(this.x_m - ROCKET_X_M);
		const store_distance = Math.abs(this.x_m - STORE_X_M);
		publishEarthLocation(
			rocket_distance <= ROCKET_INTERACTION_M
				? "rocket"
				: store_distance <= STORE_INTERACTION_M
					? "store"
					: "open",
		);

		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const pixels_per_meter = Math.max(
			1,
			Math.min((height * 0.72) / this.rocket_height_m, width / 35),
		);
		const camera_x = this.playing ? this.camera_x_m : ROCKET_X_M - 4;
		const origin_x =
			width * (this.playing ? 0.5 : 0.57) - camera_x * pixels_per_meter;
		const ground_y = height * 0.78;

		this.drawSky(ctx, width, height);

		ctx.save();
		ctx.translate(origin_x, ground_y);
		ctx.scale(pixels_per_meter, -pixels_per_meter);
		this.drawGround(ctx);
		this.drawLaunchPadAndTower(ctx);
		this.drawRocket(ctx);
		this.drawStore(ctx);
		this.drawAstronaut(ctx);
		ctx.restore();
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#101f3c");
		sky.addColorStop(0.6, "#7995a6");
		sky.addColorStop(1, "#db9d75");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);

		const sun_x = width * 0.78;
		const sun_y = height * 0.22;
		const sun = ctx.createRadialGradient(
			sun_x,
			sun_y,
			0,
			sun_x,
			sun_y,
			Math.min(width, height) * 0.16,
		);
		sun.addColorStop(0, "rgba(255, 235, 190, 0.45)");
		sun.addColorStop(1, "rgba(255, 200, 140, 0)");
		ctx.fillStyle = sun;
		ctx.fillRect(0, 0, width, height);
	}

	private drawGround(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = "#38434a";
		ctx.fillRect(GROUND_MIN_M, -220, GROUND_MAX_M - GROUND_MIN_M, 220);
		ctx.fillStyle = "#5b6664";
		ctx.fillRect(GROUND_MIN_M, -2, GROUND_MAX_M - GROUND_MIN_M, 2);

		for (let index = 0; index < 48; index += 1) {
			const rock_x =
				GROUND_MIN_M + ((index * 137) % (GROUND_MAX_M - GROUND_MIN_M));
			const rock_width = 2 + (index % 3);
			ctx.fillStyle =
				index % 2 === 0 ? "rgba(30, 38, 44, 0.35)" : "rgba(96, 105, 102, 0.35)";
			ctx.fillRect(rock_x, -1.2, rock_width, 1.2);
		}
	}

	private drawLaunchPadAndTower(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = "#646b6a";
		ctx.fillRect(ROCKET_X_M - 30, -1.5, 60, 1.5);
		ctx.fillStyle = "#7b8582";
		ctx.fillRect(ROCKET_X_M - 28, -0.4, 56, 0.4);

		const tower_x = ROCKET_X_M + this.rocket_diameter_m / 2 + 5;
		ctx.fillStyle = "#26333c";
		ctx.fillRect(tower_x, 0, 4, 55);
		ctx.fillRect(tower_x + 10, 0, 4, 55);
		for (let y = 6; y < 55; y += 7) {
			ctx.fillRect(tower_x, y, 14, 1.5);
		}
	}

	private drawRocket(ctx: CanvasRenderingContext2D): void {
		const total_height = this.rocket_height_m;
		const radius = this.rocket_diameter_m / 2;
		const core_height = total_height * 0.68;
		const upper_height = total_height * 0.18;
		const payload_height = total_height - core_height - upper_height;

		ctx.fillStyle = "#39434a";
		ctx.fillRect(-radius * 0.75, -1.2, radius * 1.5, 1.2);

		ctx.fillStyle = "#dce5e8";
		ctx.fillRect(-radius, 0, radius * 2, core_height);
		ctx.fillStyle = "#aebdc7";
		ctx.fillRect(-radius, core_height * 0.5, radius * 2, total_height * 0.012);
		ctx.fillRect(-radius, core_height * 0.84, radius * 2, total_height * 0.008);

		ctx.fillStyle = "#c4d0d9";
		ctx.fillRect(-radius * 0.88, core_height, radius * 1.76, upper_height);

		const payload_radius = Math.max(radius * 0.95, 2.1);
		const payload_bottom = core_height + upper_height;
		const service_height = payload_height * 0.45;
		ctx.fillStyle = "#edf3f4";
		ctx.fillRect(
			-payload_radius,
			payload_bottom,
			payload_radius * 2,
			service_height,
		);
		ctx.beginPath();
		ctx.moveTo(-payload_radius, payload_bottom + service_height);
		ctx.lineTo(payload_radius, payload_bottom + service_height);
		ctx.lineTo(payload_radius * 0.55, total_height);
		ctx.lineTo(-payload_radius * 0.55, total_height);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "#324859";
		ctx.beginPath();
		ctx.arc(
			0,
			core_height * 0.55,
			Math.max(0.6, radius * 0.28),
			0,
			Math.PI * 2,
		);
		ctx.fill();
		ctx.fillStyle = "#c74b45";
		ctx.fillRect(
			-radius * 0.9,
			core_height * 0.15,
			radius * 0.35,
			total_height * 0.02,
		);
	}

	private drawStore(ctx: CanvasRenderingContext2D): void {
		const store_left = STORE_X_M - STORE_WIDTH_M / 2;
		ctx.fillStyle = "#26333c";
		ctx.fillRect(store_left, 0, STORE_WIDTH_M, STORE_HEIGHT_M);
		ctx.fillStyle = "#3b4a53";
		ctx.fillRect(
			store_left - 0.5,
			STORE_HEIGHT_M - 1.2,
			STORE_WIDTH_M + 1,
			1.2,
		);
		ctx.fillStyle = "#1a252d";
		ctx.fillRect(STORE_X_M - 2.2, 0, 4.4, 4.2);
		ctx.fillStyle = "#70bfce";
		ctx.fillRect(store_left + 2.5, 3.5, 4, 3);
		ctx.fillRect(store_left + STORE_WIDTH_M - 6.5, 3.5, 4, 3);
		drawWorldText(ctx, "MISSION STORE", STORE_X_M, 7.6, 1.3, "#eef3ee");
	}

	private drawAstronaut(ctx: CanvasRenderingContext2D): void {
		const x = this.x_m;
		const y = this.y_m;
		const half_width = ASTRONAUT_WIDTH_M / 2;
		const swing = Math.sin(this.walk_phase) * 0.12;

		ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
		ctx.beginPath();
		ctx.ellipse(x, 0.02, 0.6, 0.18, 0, 0, Math.PI * 2);
		ctx.fill();

		ctx.strokeStyle = "#eef4fb";
		ctx.lineWidth = 0.16;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(x - 0.1, y + 0.55);
		ctx.lineTo(x - 0.14 + swing, y + 0.02);
		ctx.moveTo(x + 0.1, y + 0.55);
		ctx.lineTo(x + 0.14 - swing, y + 0.02);
		ctx.stroke();

		ctx.fillStyle = "#c9d6e6";
		ctx.fillRect(x - half_width - 0.1, y + 0.6, 0.22, 0.8);

		ctx.fillStyle = "#eef4fb";
		ctx.fillRect(x - half_width, y + 0.55, ASTRONAUT_WIDTH_M, 0.85);

		ctx.strokeStyle = "#eef4fb";
		ctx.lineWidth = 0.14;
		ctx.beginPath();
		ctx.moveTo(x - half_width + 0.03, y + 1.15);
		ctx.lineTo(x - half_width - 0.07, y + 0.7);
		ctx.moveTo(x + half_width - 0.03, y + 1.15);
		ctx.lineTo(x + half_width + 0.07, y + 0.7);
		ctx.stroke();

		const helmet_y = y + ASTRONAUT_HEIGHT_M - 0.25;
		ctx.fillStyle = "#eef4fb";
		ctx.beginPath();
		ctx.arc(x, helmet_y, 0.27, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#31516b";
		ctx.beginPath();
		ctx.arc(x + 0.06, helmet_y, 0.16, 0, Math.PI * 2);
		ctx.fill();
	}
}

function drawWorldText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	size_m: number,
	color: string,
): void {
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(1, -1);
	ctx.fillStyle = color;
	ctx.font = `${size_m}px sans-serif`;
	ctx.textAlign = "center";
	ctx.fillText(text, 0, 0);
	ctx.restore();
}
