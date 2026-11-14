export type Star = {
	x: number;
	y: number;
	radius: number;
	base_alpha: number;
	twinkle_offset: number;
	twinkle_speed: number;
	depth: number;
};

export function createStarfield(count: number): Star[] {
	const stars: Star[] = [];
	for (let index = 0; index < count; index += 1) {
		stars.push({
			x: Math.random(),
			y: Math.random(),
			radius: 0.3 + Math.random() * 1.6,
			base_alpha: 0.25 + Math.random() * 0.65,
			twinkle_offset: Math.random() * Math.PI * 2,
			twinkle_speed: 0.4 + Math.random() * 1.6,
			depth: 0.2 + Math.random() * 0.8,
		});
	}
	return stars;
}

export function drawStarfield(
	ctx: CanvasRenderingContext2D,
	stars: Star[],
	width: number,
	height: number,
	time_seconds: number,
	drift_x: number,
	drift_y: number,
): void {
	for (const star of stars) {
		const parallax_x = drift_x * star.depth;
		const parallax_y = drift_y * star.depth;
		const x = (((star.x * width + parallax_x) % width) + width) % width;
		const y = (((star.y * height + parallax_y) % height) + height) % height;
		const twinkle =
			0.65 +
			0.35 * Math.sin(time_seconds * star.twinkle_speed + star.twinkle_offset);
		const alpha = star.base_alpha * twinkle;

		ctx.beginPath();
		ctx.fillStyle = `rgba(220, 234, 255, ${alpha})`;
		ctx.arc(x, y, star.radius, 0, Math.PI * 2);
		ctx.fill();
	}
}
