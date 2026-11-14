import { useEffect, useRef } from "react";
import { GameLoop } from "../engine/game_loop";
import { LiveWorld } from "../rendering/live_world";

export function GameCanvas() {
	const canvas_ref = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvas_ref.current;
		if (!canvas) {
			return;
		}
		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}

		let width = 0;
		let height = 0;

		const resize = () => {
			const pixel_ratio = Math.min(window.devicePixelRatio || 1, 2);
			width = canvas.clientWidth;
			height = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(width * pixel_ratio));
			canvas.height = Math.max(1, Math.floor(height * pixel_ratio));
			context.setTransform(pixel_ratio, 0, 0, pixel_ratio, 0, 0);
		};

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);

		const world = new LiveWorld();
		const loop = new GameLoop({
			update: (dt_seconds) => {
				world.update(dt_seconds);
			},
			render: () => {
				context.clearRect(0, 0, width, height);
				world.draw(context, width, height);
			},
		});
		loop.start();

		return () => {
			observer.disconnect();
			loop.stop();
		};
	}, []);

	return <canvas ref={canvas_ref} className="game-canvas" />;
}
