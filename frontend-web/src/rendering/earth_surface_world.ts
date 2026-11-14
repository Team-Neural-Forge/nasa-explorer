import Matter from "matter-js";
import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import { earth_input, publishEarthLocation } from "../state/earth_interaction";

const ground_y = 500;
const rocket_x = 700;
const store_x = 1260;

export class EarthSurfaceWorld implements GameWorld {
	private readonly engine = Matter.Engine.create();
	private readonly astronaut = Matter.Bodies.rectangle(
		rocket_x - 100,
		ground_y - 32,
		28,
		64,
		{ friction: 0.1, frictionAir: 0.08, inertia: Infinity },
	);
	private readonly input: KeyboardState;
	private playing = false;
	private camera_x = 0;
	private jump_held = false;

	constructor(input: KeyboardState) {
		this.input = input;
		Matter.Composite.add(this.engine.world, [
			this.astronaut,
			Matter.Bodies.rectangle(1000, ground_y + 50, 2200, 100, {
				isStatic: true,
			}),
		]);
	}

	setPlaying(playing: boolean): void {
		this.playing = playing;
	}

	update(dt_seconds: number): void {
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
		Matter.Body.setVelocity(this.astronaut, {
			x: direction * 3.5,
			y: this.astronaut.velocity.y,
		});
		const jumping =
			this.playing &&
			(this.input.isDown("Space") ||
				this.input.isDown("KeyW") ||
				this.input.isDown("ArrowUp") ||
				earth_input.jump);
		if (
			jumping &&
			!this.jump_held &&
			this.astronaut.position.y + 32 >= ground_y - 2 &&
			Math.abs(this.astronaut.velocity.y) < 1
		) {
			Matter.Body.setVelocity(this.astronaut, {
				x: this.astronaut.velocity.x,
				y: -9,
			});
		}
		this.jump_held = jumping;
		Matter.Engine.update(this.engine, dt_seconds * 1000);
		if (this.astronaut.position.x < 40 || this.astronaut.position.x > 1960)
			Matter.Body.setPosition(this.astronaut, {
				x: Math.max(40, Math.min(1960, this.astronaut.position.x)),
				y: this.astronaut.position.y,
			});
		this.camera_x += (this.astronaut.position.x - this.camera_x) * 0.08;
		const x = this.astronaut.position.x;
		publishEarthLocation(
			Math.abs(x - rocket_x) < 160
				? "rocket"
				: Math.abs(x - store_x) < 100
					? "store"
					: "open",
		);
		this.input.endFrame();
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const scale = Math.min(width / 1000, height / 650);
		const camera = this.playing ? this.camera_x : rocket_x - 100;
		const origin_x = width * 0.57 - camera * scale;
		const origin_y = height * 0.78 - ground_y * scale;
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#101f3c");
		sky.addColorStop(0.6, "#7995a6");
		sky.addColorStop(1, "#db9d75");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);
		ctx.save();
		ctx.translate(origin_x, origin_y);
		ctx.scale(scale, scale);
		ctx.fillStyle = "#38434a";
		ctx.fillRect(0, ground_y, 2000, 250);
		ctx.fillStyle = "#646b6a";
		ctx.fillRect(rocket_x - 150, ground_y - 12, 300, 12);
		ctx.fillStyle = "#26333c";
		ctx.fillRect(rocket_x + 70, ground_y - 320, 15, 320);
		for (let i = 0; i < 7; i++)
			ctx.fillRect(rocket_x + 70, ground_y - 300 + i * 43, 65, 5);
		// A two-section starter rocket marks the future assembly location.
		ctx.fillStyle = "#dce5e8";
		ctx.fillRect(rocket_x - 24, ground_y - 260, 48, 240);
		ctx.fillStyle = "#aebdc7";
		ctx.fillRect(rocket_x - 24, ground_y - 150, 48, 10);
		ctx.fillStyle = "#edf3f4";
		ctx.beginPath();
		ctx.moveTo(rocket_x - 24, ground_y - 260);
		ctx.lineTo(rocket_x, ground_y - 310);
		ctx.lineTo(rocket_x + 24, ground_y - 260);
		ctx.fill();
		ctx.fillStyle = "#324859";
		ctx.beginPath();
		ctx.arc(rocket_x, ground_y - 235, 9, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#26333c";
		ctx.fillRect(store_x - 48, ground_y - 105, 96, 105);
		ctx.fillStyle = "#70bfce";
		ctx.fillRect(store_x - 35, ground_y - 87, 70, 42);
		ctx.fillStyle = "#eef3ee";
		ctx.font = "14px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText("STORE", store_x, ground_y - 57);
		const { x, y } = this.astronaut.position;
		ctx.fillStyle = "#e9f0ef";
		ctx.fillRect(x - 12, y - 15, 24, 34);
		ctx.beginPath();
		ctx.arc(x, y - 22, 14, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = "#31516b";
		ctx.beginPath();
		ctx.arc(x + 2, y - 22, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#e9f0ef";
		ctx.lineWidth = 7;
		ctx.lineCap = "round";
		ctx.beginPath();
		ctx.moveTo(x - 7, y + 17);
		ctx.lineTo(x - 10, y + 30);
		ctx.moveTo(x + 7, y + 17);
		ctx.lineTo(x + 10, y + 30);
		ctx.stroke();
		ctx.restore();
	}
}
