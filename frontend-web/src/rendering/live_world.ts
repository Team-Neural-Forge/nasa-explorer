import { drawEarth } from "./earth_renderer";
import { drawLaunchSite } from "./launch_site_renderer";
import { createStarfield, drawStarfield, type Star } from "./starfield";

export class LiveWorld {
	private stars: Star[] = createStarfield(220);
	private time_seconds = 0;

	update(dt_seconds: number): void {
		this.time_seconds += dt_seconds;
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		this.drawSky(ctx, width, height);

		const drift_x = Math.sin(this.time_seconds * 0.02) * 24;
		const drift_y = Math.cos(this.time_seconds * 0.017) * 14;
		drawStarfield(
			ctx,
			this.stars,
			width,
			height,
			this.time_seconds,
			drift_x,
			drift_y,
		);

		const minimum = Math.min(width, height);
		drawEarth(ctx, {
			center_x: width * 0.8,
			center_y: height * 0.92,
			radius: minimum * 0.56,
			time_seconds: this.time_seconds,
		});

		drawLaunchSite(ctx, {
			base_x: width * 0.63,
			base_y: height * 0.86,
			scale: Math.max(1, minimum / 520),
		});

		this.drawVignette(ctx, width, height);
	}

	private drawSky(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const sky = ctx.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#03060f");
		sky.addColorStop(0.55, "#071228");
		sky.addColorStop(1, "#0b1a33");
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, width, height);

		const nebula = ctx.createRadialGradient(
			width * 0.72,
			height * 0.2,
			0,
			width * 0.72,
			height * 0.2,
			Math.max(width, height) * 0.6,
		);
		nebula.addColorStop(0, "rgba(40, 74, 150, 0.18)");
		nebula.addColorStop(0.5, "rgba(24, 44, 94, 0.08)");
		nebula.addColorStop(1, "rgba(6, 12, 24, 0)");
		ctx.fillStyle = nebula;
		ctx.fillRect(0, 0, width, height);
	}

	private drawVignette(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	): void {
		const vignette = ctx.createRadialGradient(
			width * 0.5,
			height * 0.5,
			Math.min(width, height) * 0.35,
			width * 0.5,
			height * 0.5,
			Math.max(width, height) * 0.75,
		);
		vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
		vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
		ctx.fillStyle = vignette;
		ctx.fillRect(0, 0, width, height);
	}
}
