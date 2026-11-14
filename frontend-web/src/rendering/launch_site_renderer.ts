export type LaunchSiteOptions = {
	base_x: number;
	base_y: number;
	scale: number;
};

export function drawLaunchSite(
	ctx: CanvasRenderingContext2D,
	options: LaunchSiteOptions,
): void {
	const { base_x, base_y, scale } = options;
	ctx.save();
	ctx.translate(base_x, base_y);
	ctx.scale(scale, scale);
	ctx.fillStyle = "rgba(4, 8, 16, 0.92)";

	ctx.fillRect(-90, 0, 220, 18);
	ctx.fillRect(-60, -12, 160, 12);

	ctx.fillRect(18, -150, 10, 150);
	ctx.fillRect(28, -150, 46, 8);
	for (let level = 0; level < 7; level += 1) {
		ctx.fillRect(18, -140 + level * 20, 56, 3);
	}

	ctx.beginPath();
	ctx.moveTo(72, -4);
	ctx.lineTo(72, -132);
	ctx.lineTo(82, -164);
	ctx.lineTo(92, -132);
	ctx.lineTo(92, -4);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(74, -4);
	ctx.lineTo(66, 18);
	ctx.lineTo(98, 18);
	ctx.lineTo(90, -4);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = "rgba(120, 180, 255, 0.16)";
	ctx.fillRect(80, -126, 4, 104);

	ctx.restore();
}
