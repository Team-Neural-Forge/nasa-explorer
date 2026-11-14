export type GameLoopCallbacks = {
	update: (dt_seconds: number) => void;
	render: () => void;
};

const MAX_FRAME_SECONDS = 0.25;

export class GameLoop {
	private readonly callbacks: GameLoopCallbacks;
	private readonly fixed_step_seconds: number;
	private frame_id: number | null = null;
	private previous_time_ms = 0;
	private accumulator_seconds = 0;

	constructor(callbacks: GameLoopCallbacks, fixed_step_seconds = 1 / 60) {
		this.callbacks = callbacks;
		this.fixed_step_seconds = fixed_step_seconds;
	}

	start(): void {
		if (this.frame_id !== null) {
			return;
		}
		this.previous_time_ms = performance.now();
		this.frame_id = requestAnimationFrame(this.tick);
	}

	stop(): void {
		if (this.frame_id === null) {
			return;
		}
		cancelAnimationFrame(this.frame_id);
		this.frame_id = null;
		this.accumulator_seconds = 0;
	}

	private readonly tick = (now_ms: number): void => {
		const elapsed_seconds = Math.min(
			(now_ms - this.previous_time_ms) / 1000,
			MAX_FRAME_SECONDS,
		);
		this.previous_time_ms = now_ms;
		this.accumulator_seconds += elapsed_seconds;

		while (this.accumulator_seconds >= this.fixed_step_seconds) {
			this.callbacks.update(this.fixed_step_seconds);
			this.accumulator_seconds -= this.fixed_step_seconds;
		}

		this.callbacks.render();
		this.frame_id = requestAnimationFrame(this.tick);
	};
}
