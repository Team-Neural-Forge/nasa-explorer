export type RocketStackOptions = {
	height_m: number;
	diameter_m: number;
	burning?: boolean;
	throttle?: number;
};

/**
 * Draws the mission rocket in metres with its base at (0, 0) and the stack
 * extending toward +y. The caller owns the camera transform, so the same
 * rocket is used on the pad, in the cockpit and during ascent.
 */
export function drawRocketStack(
	ctx: CanvasRenderingContext2D,
	options: RocketStackOptions,
): void {
	const total_height = Math.max(1, options.height_m);
	const radius = Math.max(0.5, options.diameter_m) / 2;
	const core_height = total_height * 0.68;
	const upper_height = total_height * 0.18;
	const payload_height = total_height - core_height - upper_height;
	const throttle = Math.max(0, Math.min(1, options.throttle ?? 0));

	if (options.burning && throttle > 0) {
		const flame_length = total_height * (0.06 + 0.14 * throttle);
		const flame = ctx.createLinearGradient(0, 0, 0, -flame_length);
		flame.addColorStop(0, "rgba(255, 236, 170, 0.95)");
		flame.addColorStop(0.45, "rgba(255, 160, 60, 0.8)");
		flame.addColorStop(1, "rgba(255, 90, 30, 0)");
		ctx.fillStyle = flame;
		ctx.beginPath();
		ctx.moveTo(-radius * 0.7, 0);
		ctx.quadraticCurveTo(0, -flame_length, radius * 0.7, 0);
		ctx.closePath();
		ctx.fill();
	}

	ctx.fillStyle = "#39434a";
	ctx.fillRect(
		-radius * 0.75,
		-total_height * 0.02,
		radius * 1.5,
		total_height * 0.02,
	);

	ctx.fillStyle = "#9aa6b2";
	ctx.beginPath();
	ctx.moveTo(-radius, 0);
	ctx.lineTo(-radius * 1.7, -total_height * 0.045);
	ctx.lineTo(-radius * 0.95, -total_height * 0.015);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(radius, 0);
	ctx.lineTo(radius * 1.7, -total_height * 0.045);
	ctx.lineTo(radius * 0.95, -total_height * 0.015);
	ctx.closePath();
	ctx.fill();

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
	ctx.arc(0, core_height * 0.55, Math.max(0.6, radius * 0.28), 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#c74b45";
	ctx.fillRect(
		-radius * 0.9,
		core_height * 0.15,
		radius * 0.35,
		total_height * 0.02,
	);
}
