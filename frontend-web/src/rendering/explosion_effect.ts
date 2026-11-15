type ExplosionParticle = {
	angle: number;
	speed: number;
	size: number;
	lifetime: number;
	kind: "flame" | "debris" | "smoke";
};

export class ExplosionEffect {
	private elapsed = 0;
	private readonly particles: ExplosionParticle[] = Array.from(
		{ length: 60 },
		(_, index) => ({
			angle: Math.random() * Math.PI * 2,
			speed: 0.2 + Math.random() * 0.8,
			size: 0.025 + Math.random() * 0.07,
			lifetime: 0.8 + Math.random() * 1.7,
			kind: index < 25 ? "flame" : index < 42 ? "debris" : "smoke",
		}),
	);

	update(dt_seconds: number): void {
		this.elapsed += dt_seconds;
	}

	draw(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		scale: number,
	): void {
		const flash = Math.max(0, 1 - this.elapsed / 0.3);
		ctx.save();
		if (flash > 0) {
			const glow = ctx.createRadialGradient(x, y, 0, x, y, scale * 1.2);
			glow.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
			glow.addColorStop(0.4, `rgba(255, 160, 35, ${flash * 0.8})`);
			glow.addColorStop(1, "rgba(255, 60, 0, 0)");
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(x, y, scale * 1.2, 0, Math.PI * 2);
			ctx.fill();
		}
		for (const particle of this.particles) {
			const progress = this.elapsed / particle.lifetime;
			if (progress >= 1) continue;
			const distance = scale * particle.speed * this.elapsed;
			const px = x + Math.cos(particle.angle) * distance;
			const py =
				y + Math.sin(particle.angle) * distance - scale * 0.15 * this.elapsed;
			const alpha = (1 - progress) * (particle.kind === "smoke" ? 0.45 : 0.9);
			ctx.fillStyle =
				particle.kind === "smoke"
					? `rgba(90, 90, 90, ${alpha})`
					: particle.kind === "debris"
						? `rgba(80, 45, 30, ${alpha})`
						: `rgba(255, ${Math.round(180 - progress * 100)}, 25, ${alpha})`;
			ctx.beginPath();
			ctx.arc(
				px,
				py,
				scale * particle.size * (particle.kind === "smoke" ? 1 + progress : 1),
				0,
				Math.PI * 2,
			);
			ctx.fill();
		}
		ctx.restore();
	}
}
