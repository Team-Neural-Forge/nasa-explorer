import { useEffect, useRef } from "react";
import { GameLoop } from "../engine/game_loop";
import type { GameWorld } from "../engine/game_world";
import { KeyboardState } from "../engine/input";
import { CruiseWorld } from "../rendering/cruise_world";
import { LaunchWorld } from "../rendering/launch_world";
import { LiveWorld } from "../rendering/live_world";
import { LunarLandingWorld } from "../rendering/lunar_landing_world";
import { OrbitWorld } from "../rendering/orbit_world";
import { cruise_actions } from "../state/cruise_control";
import { STARTING_BUDGET_USD_M } from "../state/economy";
import { useGameState } from "../state/game_state";
import { landing_actions } from "../state/landing_control";
import { launch_actions } from "../state/launch_control";
import { orbit_actions } from "../state/orbit_control";
import { computeLanderStats, computeRocketStats } from "../state/rocket_config";

export function GameCanvas() {
	const { scene, selection, orbit_state } = useGameState();
	const canvas_ref = useRef<HTMLCanvasElement | null>(null);
	const input_ref = useRef<KeyboardState | null>(null);
	const live_world_ref = useRef<LiveWorld | null>(null);
	const active_world_ref = useRef<GameWorld | null>(null);

	if (!input_ref.current) {
		input_ref.current = new KeyboardState();
	}
	if (!live_world_ref.current) {
		live_world_ref.current = new LiveWorld();
	}
	if (!active_world_ref.current) {
		active_world_ref.current = live_world_ref.current;
	}

	useEffect(() => {
		launch_actions.current = null;
		orbit_actions.current = null;
		cruise_actions.current = null;
		landing_actions.current = null;

		if (scene === "launch" && input_ref.current) {
			const stats = computeRocketStats(selection, STARTING_BUDGET_USD_M);
			active_world_ref.current = new LaunchWorld(stats, input_ref.current);
			return () => {
				launch_actions.current = null;
			};
		}

		if (scene === "orbit" && input_ref.current) {
			active_world_ref.current = new OrbitWorld(orbit_state, input_ref.current);
			return () => {
				orbit_actions.current = null;
			};
		}

		if (scene === "cruise" && input_ref.current) {
			active_world_ref.current = new CruiseWorld(input_ref.current);
			return () => {
				cruise_actions.current = null;
			};
		}

		if (scene === "landing" && input_ref.current) {
			const lander_stats = computeLanderStats(selection);
			active_world_ref.current = new LunarLandingWorld(
				lander_stats,
				input_ref.current,
			);
			return () => {
				landing_actions.current = null;
			};
		}

		active_world_ref.current = live_world_ref.current;
		return undefined;
	}, [scene, selection, orbit_state]);

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
				active_world_ref.current?.update(dt_seconds);
			},
			render: () => {
				const world = active_world_ref.current;
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
