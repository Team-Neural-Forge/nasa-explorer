import type { GameWorld } from "../engine/game_world";
import type { KeyboardState } from "../engine/input";
import type { OrbitInsertion } from "../engine/orbit_simulation";
import { cruise_actions } from "../state/cruise_control";
import { getEarthLocation } from "../state/earth_interaction";
import type { RocketDimensions } from "../state/earth_scene";
import { STARTING_BUDGET_USD_M } from "../state/economy";
import { landing_actions } from "../state/landing_control";
import { launch_actions } from "../state/launch_control";
import { orbit_actions } from "../state/orbit_control";
import {
	computeLanderStats,
	computeRocketStats,
	type RocketSelection,
} from "../state/rocket_config";
import { sandbox_actions } from "../state/sandbox_actions";
import { publishSandboxMode, type SandboxMode } from "../state/sandbox_mode";
import { CruiseWorld } from "./cruise_world";
import { EarthSurfaceWorld } from "./earth_surface_world";
import { LaunchWorld } from "./launch_world";
import { LunarLandingWorld } from "./lunar_landing_world";
import { OrbitWorld } from "./orbit_world";

const TRANSITION_SECONDS = 0.75;

export class SandboxWorld implements GameWorld {
	private readonly input: KeyboardState;
	private readonly earth: EarthSurfaceWorld;
	private selection: RocketSelection;
	private rocket: RocketDimensions;
	private mode: SandboxMode = "earth";
	private active: GameWorld;
	private outgoing: GameWorld | null = null;
	private transition_elapsed_s = 0;
	private paused = false;
	private launch: LaunchWorld | null = null;
	private orbit: OrbitWorld | null = null;
	private cruise: CruiseWorld | null = null;
	private landing: LunarLandingWorld | null = null;
	private last_orbit_state: OrbitInsertion | null = null;

	constructor(
		input: KeyboardState,
		selection: RocketSelection,
		rocket: RocketDimensions,
	) {
		this.input = input;
		this.selection = selection;
		this.rocket = rocket;
		this.earth = new EarthSurfaceWorld(input, rocket);
		this.active = this.earth;
		publishSandboxMode("earth");
		sandbox_actions.current = {
			enter_rocket: () => this.enter_rocket(),
			exit_rocket: () => this.exit_rocket(),
			continue_to_orbit: (insertion) => this.continue_to_orbit(insertion),
			begin_cruise: () => this.begin_cruise(),
			begin_landing: () => this.begin_landing(),
			return_to_earth: () => this.return_to_earth(),
			return_to_orbit: () => this.return_to_orbit(),
			return_to_cruise: () => this.return_to_cruise(),
		};
	}

	setPaused(paused: boolean): void {
		this.paused = paused;
	}

	set_selection(selection: RocketSelection): void {
		this.selection = selection;
	}

	set_rocket_dimensions(height_m: number, diameter_m: number): void {
		this.rocket = { height_m, diameter_m };
		this.earth.set_rocket_dimensions(height_m, diameter_m);
	}

	update(dt_seconds: number): void {
		if (this.paused) {
			this.input.endFrame();
			return;
		}

		if (this.mode === "earth") {
			if (this.input.consumePress("KeyE") && getEarthLocation() === "rocket") {
				this.enter_rocket();
				this.tick_transition(dt_seconds);
				return;
			}
			this.earth.setPlaying(true);
			this.earth.setInsideRocket(false);
			this.earth.update(dt_seconds);
			this.tick_transition(dt_seconds);
			return;
		}

		if (this.mode === "rocket" && this.launch) {
			if (this.input.consumePress("KeyE")) {
				this.exit_rocket();
				this.tick_transition(dt_seconds);
				return;
			}
			this.launch.update(dt_seconds);
			this.earth.setPlaying(false);
			this.earth.setInsideRocket(true);
			this.earth.update(dt_seconds);
			if (this.launch.launch_status === "flying") {
				this.set_mode("launch", this.launch);
			}
			this.tick_transition(dt_seconds);
			return;
		}

		if (this.mode === "launch" && this.launch) {
			this.launch.update(dt_seconds);
		} else if (this.mode === "orbit" && this.orbit) {
			this.orbit.update(dt_seconds);
		} else if (this.mode === "cruise" && this.cruise) {
			this.cruise.update(dt_seconds);
		} else if (this.mode === "landing" && this.landing) {
			this.landing.update(dt_seconds);
		}

		this.tick_transition(dt_seconds);
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const active = this.current_draw_world();
		if (
			this.outgoing &&
			this.outgoing !== active &&
			this.transition_elapsed_s > 0
		) {
			const progress = 1 - this.transition_elapsed_s / TRANSITION_SECONDS;
			ctx.save();
			ctx.globalAlpha = 1 - progress;
			this.outgoing.draw(ctx, width, height);
			ctx.restore();
			ctx.save();
			ctx.globalAlpha = progress;
			active.draw(ctx, width, height);
			ctx.restore();
			return;
		}
		active.draw(ctx, width, height);
	}

	private enter_rocket(): void {
		if (this.mode !== "earth" || getEarthLocation() !== "rocket") {
			return;
		}
		this.mode = "rocket";
		this.earth.setPlaying(false);
		this.earth.setInsideRocket(true);
		this.launch = new LaunchWorld(
			computeRocketStats(this.selection, STARTING_BUDGET_USD_M),
			this.input,
			this.rocket,
		);
		this.active = this.earth;
		this.outgoing = null;
		this.transition_elapsed_s = 0;
		publishSandboxMode("rocket");
	}

	private exit_rocket(): void {
		if (this.mode !== "rocket" || !this.launch) {
			return;
		}
		if (this.launch.launch_status !== "prelaunch") {
			return;
		}
		this.launch = null;
		launch_actions.current = null;
		this.earth.setInsideRocket(false);
		this.earth.setPlaying(true);
		this.mode = "earth";
		this.active = this.earth;
		this.outgoing = null;
		this.transition_elapsed_s = 0;
		publishSandboxMode("earth");
	}

	private continue_to_orbit(insertion: OrbitInsertion): void {
		if (this.mode !== "launch" || !this.launch) {
			return;
		}
		this.last_orbit_state = insertion;
		const next = new OrbitWorld(insertion, this.input);
		this.orbit = next;
		this.set_mode("orbit", next);
		this.launch = null;
		launch_actions.current = null;
	}

	private begin_cruise(): void {
		if (this.mode !== "orbit" || !this.orbit) {
			return;
		}
		const next = new CruiseWorld(this.input);
		this.cruise = next;
		this.set_mode("cruise", next);
		this.orbit = null;
		orbit_actions.current = null;
	}

	private begin_landing(): void {
		if (this.mode !== "cruise" || !this.cruise) {
			return;
		}
		const next = new LunarLandingWorld(
			computeLanderStats(this.selection),
			this.input,
		);
		this.landing = next;
		this.set_mode("landing", next);
		this.cruise = null;
		cruise_actions.current = null;
	}

	private return_to_earth(): void {
		const previous = this.current_draw_world();
		this.earth.setInsideRocket(false);
		this.earth.setPlaying(true);
		this.mode = "earth";
		this.active = this.earth;
		if (previous !== this.earth) {
			this.outgoing = previous;
			this.transition_elapsed_s = TRANSITION_SECONDS;
		} else {
			this.outgoing = null;
			this.transition_elapsed_s = 0;
		}
		this.launch = null;
		this.orbit = null;
		this.cruise = null;
		this.landing = null;
		this.last_orbit_state = null;
		launch_actions.current = null;
		orbit_actions.current = null;
		cruise_actions.current = null;
		landing_actions.current = null;
		publishSandboxMode("earth");
	}

	private return_to_orbit(): void {
		if (!this.last_orbit_state) {
			this.return_to_earth();
			return;
		}
		const next = new OrbitWorld(this.last_orbit_state, this.input);
		this.orbit = next;
		this.set_mode("orbit", next);
		this.cruise = null;
		this.landing = null;
		cruise_actions.current = null;
		landing_actions.current = null;
	}

	private return_to_cruise(): void {
		if (this.mode !== "landing") {
			return;
		}
		const next = new CruiseWorld(this.input);
		this.cruise = next;
		this.set_mode("cruise", next);
		this.landing = null;
		landing_actions.current = null;
	}

	private set_mode(mode: SandboxMode, next: GameWorld): void {
		const previous = this.current_draw_world();
		this.mode = mode;
		this.active = next;
		if (previous !== next) {
			this.outgoing = previous;
			this.transition_elapsed_s = TRANSITION_SECONDS;
		} else {
			this.outgoing = null;
			this.transition_elapsed_s = 0;
		}
		publishSandboxMode(mode);
	}

	private tick_transition(dt_seconds: number): void {
		if (this.transition_elapsed_s <= 0) {
			this.outgoing = null;
			return;
		}
		this.transition_elapsed_s = Math.max(
			0,
			this.transition_elapsed_s - dt_seconds,
		);
		if (this.transition_elapsed_s === 0) {
			this.outgoing = null;
		}
	}

	private current_draw_world(): GameWorld {
		switch (this.mode) {
			case "launch":
				return this.launch ?? this.earth;
			case "orbit":
				return this.orbit ?? this.active;
			case "cruise":
				return this.cruise ?? this.active;
			case "landing":
				return this.landing ?? this.active;
			default:
				return this.earth;
		}
	}
}
