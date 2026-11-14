export type EarthOptions = {
	center_x: number;
	center_y: number;
	radius: number;
	time_seconds: number;
};

export function drawEarth(
	ctx: CanvasRenderingContext2D,
	options: EarthOptions,
): void {
	const { center_x, center_y, radius, time_seconds } = options;

	ctx.save();

	const glow = ctx.createRadialGradient(
		center_x,
		center_y,
		radius * 0.92,
		center_x,
		center_y,
		radius * 1.22,
	);
	glow.addColorStop(0, "rgba(72, 156, 255, 0.35)");
	glow.addColorStop(0.5, "rgba(46, 110, 210, 0.12)");
	glow.addColorStop(1, "rgba(20, 50, 110, 0)");
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(center_x, center_y, radius * 1.22, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
	ctx.clip();

	const ocean = ctx.createRadialGradient(
		center_x - radius * 0.35,
		center_y - radius * 0.45,
		radius * 0.1,
		center_x,
		center_y,
		radius * 1.1,
	);
	ocean.addColorStop(0, "#2f7fb8");
	ocean.addColorStop(0.45, "#1b4f86");
	ocean.addColorStop(1, "#0a2140");
	ctx.fillStyle = ocean;
	ctx.fillRect(center_x - radius, center_y - radius, radius * 2, radius * 2);

	drawContinent(
		ctx,
		center_x - radius * 0.45,
		center_y - radius * 0.35,
		radius,
		0.42,
	);
	drawContinent(
		ctx,
		center_x + radius * 0.1,
		center_y + radius * 0.12,
		radius,
		0.55,
	);
	drawContinent(
		ctx,
		center_x + radius * 0.42,
		center_y - radius * 0.3,
		radius,
		0.3,
	);

	drawClouds(ctx, center_x, center_y, radius, time_seconds);

	const terminator = ctx.createLinearGradient(
		center_x - radius,
		center_y - radius,
		center_x + radius,
		center_y + radius,
	);
	terminator.addColorStop(0, "rgba(0, 0, 0, 0)");
	terminator.addColorStop(0.55, "rgba(3, 8, 20, 0.15)");
	terminator.addColorStop(1, "rgba(2, 5, 14, 0.82)");
	ctx.fillStyle = terminator;
	ctx.fillRect(center_x - radius, center_y - radius, radius * 2, radius * 2);

	ctx.restore();

	ctx.save();
	ctx.beginPath();
	ctx.arc(center_x, center_y, radius, Math.PI * 0.9, Math.PI * 1.9);
	ctx.strokeStyle = "rgba(150, 205, 255, 0.5)";
	ctx.lineWidth = Math.max(1, radius * 0.006);
	ctx.stroke();
	ctx.restore();
}

function drawContinent(
	ctx: CanvasRenderingContext2D,
	center_x: number,
	center_y: number,
	radius: number,
	size_ratio: number,
): void {
	ctx.save();
	ctx.translate(center_x, center_y);
	ctx.fillStyle = "rgba(46, 104, 78, 0.85)";
	ctx.beginPath();
	const points = 7;
	for (let index = 0; index < points; index += 1) {
		const angle = (index / points) * Math.PI * 2;
		const wobble = 0.7 + 0.3 * Math.sin(index * 2.3);
		const point_radius = radius * size_ratio * wobble;
		const x = Math.cos(angle) * point_radius;
		const y = Math.sin(angle) * point_radius * 0.7;
		if (index === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

function drawClouds(
	ctx: CanvasRenderingContext2D,
	center_x: number,
	center_y: number,
	radius: number,
	time_seconds: number,
): void {
	ctx.save();
	ctx.translate(center_x, center_y);
	const rotation = time_seconds * 0.008;
	ctx.rotate(rotation);
	ctx.fillStyle = "rgba(235, 245, 255, 0.16)";
	for (let index = 0; index < 6; index += 1) {
		const band_y = -radius * 0.7 + index * radius * 0.27;
		const band_width = radius * (1.1 + 0.25 * Math.sin(index * 1.7));
		const band_height = radius * (0.06 + 0.02 * Math.cos(index));
		ctx.beginPath();
		ctx.ellipse(0, band_y, band_width, band_height, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.restore();
}
