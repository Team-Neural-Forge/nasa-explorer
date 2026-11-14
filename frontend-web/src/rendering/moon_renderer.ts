export type MoonOptions = {
	center_x: number;
	center_y: number;
	radius: number;
};

const CRATERS = [
	{ x: -0.35, y: -0.22, r: 0.16 },
	{ x: 0.12, y: -0.42, r: 0.1 },
	{ x: 0.38, y: 0.08, r: 0.2 },
	{ x: -0.18, y: 0.36, r: 0.13 },
	{ x: 0.02, y: 0.04, r: 0.24 },
	{ x: -0.46, y: 0.12, r: 0.08 },
	{ x: 0.28, y: -0.22, r: 0.07 },
];

export function drawMoon(
	ctx: CanvasRenderingContext2D,
	options: MoonOptions,
): void {
	const { center_x, center_y, radius } = options;

	ctx.save();
	const glow = ctx.createRadialGradient(
		center_x,
		center_y,
		radius * 0.9,
		center_x,
		center_y,
		radius * 1.3,
	);
	glow.addColorStop(0, "rgba(200, 210, 225, 0.18)");
	glow.addColorStop(1, "rgba(200, 210, 225, 0)");
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(center_x, center_y, radius * 1.3, 0, Math.PI * 2);
	ctx.fill();

	ctx.beginPath();
	ctx.arc(center_x, center_y, radius, 0, Math.PI * 2);
	ctx.clip();

	const base = ctx.createRadialGradient(
		center_x - radius * 0.35,
		center_y - radius * 0.35,
		radius * 0.1,
		center_x,
		center_y,
		radius * 1.1,
	);
	base.addColorStop(0, "#cfd6df");
	base.addColorStop(0.5, "#a9b2bf");
	base.addColorStop(1, "#616b7a");
	ctx.fillStyle = base;
	ctx.fillRect(center_x - radius, center_y - radius, radius * 2, radius * 2);

	for (const crater of CRATERS) {
		const crater_x = center_x + crater.x * radius;
		const crater_y = center_y + crater.y * radius;
		const crater_radius = crater.r * radius;
		ctx.fillStyle = "rgba(90, 99, 112, 0.55)";
		ctx.beginPath();
		ctx.arc(crater_x, crater_y, crater_radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "rgba(220, 226, 236, 0.35)";
		ctx.lineWidth = Math.max(1, radius * 0.006);
		ctx.beginPath();
		ctx.arc(
			crater_x - crater_radius * 0.08,
			crater_y - crater_radius * 0.08,
			crater_radius * 0.85,
			Math.PI * 1.1,
			Math.PI * 1.9,
		);
		ctx.stroke();
	}

	const terminator = ctx.createLinearGradient(
		center_x - radius,
		center_y - radius,
		center_x + radius,
		center_y + radius,
	);
	terminator.addColorStop(0, "rgba(0, 0, 0, 0)");
	terminator.addColorStop(1, "rgba(2, 5, 12, 0.72)");
	ctx.fillStyle = terminator;
	ctx.fillRect(center_x - radius, center_y - radius, radius * 2, radius * 2);

	ctx.restore();
}
