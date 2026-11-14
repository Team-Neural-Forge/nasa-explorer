import { useEffect, useRef } from "react";
import { GameLoop } from "../engine/game_loop";
import { KeyboardState } from "../engine/input";
import { SandboxWorld } from "../rendering/sandbox_world";
import { useGameState } from "../state/game_state";
import { getLaunchVehicleOption } from "../state/rocket_config";

export function GameCanvas() {
	const { menu_open, selection } = useGameState();
	const rocket_option = getLaunchVehicleOption(selection.launch_vehicle_id);
	const rocket_height_m = rocket_option?.height_m ?? 50;
	const rocket_diameter_m = rocket_option?.diameter_m ?? 3.7;
	const canvas_ref = useRef<HTMLCanvasElement | null>(null);
	const input_ref = useRef<KeyboardState | null>(null);
	const sandbox_ref = useRef<SandboxWorld | null>(null);

	if (!input_ref.current) {
		input_ref.current = new KeyboardState();
	}
	if (!sandbox_ref.current && input_ref.current) {
		sandbox_ref.current = new SandboxWorld(input_ref.current, selection, {
			height_m: rocket_height_m,
			diameter_m: rocket_diameter_m,
		});
	}

	useEffect(() => {
		sandbox_ref.current?.setPaused(menu_open);
	}, [menu_open]);

	useEffect(() => {
		sandbox_ref.current?.set_selection(selection);
		sandbox_ref.current?.set_rocket_dimensions(
			rocket_height_m,
			rocket_diameter_m,
		);
	}, [selection, rocket_height_m, rocket_diameter_m]);

	useEffect(() => {
		const canvas = canvas_ref.current;
		const input = input_ref.current;
		if (!canvas || !input) {
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
		input.attach(window);

		const loop = new GameLoop({
			update: (dt_seconds) => {
				sandbox_ref.current?.update(dt_seconds);
			},
			render: () => {
				const world = sandbox_ref.current;
				if (!world) {
					return;
				}
				context.clearRect(0, 0, width, height);
				world.draw(context, width, height);
			},
		});
		loop.start();

		return () => {
			observer.disconnect();
			input.detach(window);
			loop.stop();
		};
	}, []);

	return <canvas ref={canvas_ref} className="game-canvas" />;
}
