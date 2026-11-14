const TRACKED_CODES = new Set([
	"Enter",
	"Space",
	"KeyR",
	"KeyE",
	"KeyP",
	"BracketLeft",
	"BracketRight",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
]);

export class KeyboardState {
	private pressed = new Set<string>();
	private just_pressed = new Set<string>();

	private readonly handle_keydown = (event: KeyboardEvent): void => {
		if (!TRACKED_CODES.has(event.code)) {
			return;
		}
		if (event.code.startsWith("Arrow") || event.code === "Space") {
			event.preventDefault();
		}
		if (!this.pressed.has(event.code)) {
			this.just_pressed.add(event.code);
		}
		this.pressed.add(event.code);
	};

	private readonly handle_keyup = (event: KeyboardEvent): void => {
		this.pressed.delete(event.code);
	};

	private readonly handle_blur = (): void => {
		this.pressed.clear();
		this.just_pressed.clear();
	};

	attach(target: Window): void {
		target.addEventListener("keydown", this.handle_keydown);
		target.addEventListener("keyup", this.handle_keyup);
		target.addEventListener("blur", this.handle_blur);
	}

	detach(target: Window): void {
		target.removeEventListener("keydown", this.handle_keydown);
		target.removeEventListener("keyup", this.handle_keyup);
		target.removeEventListener("blur", this.handle_blur);
	}

	isDown(code: string): boolean {
		return this.pressed.has(code);
	}

	consumePress(code: string): boolean {
		if (!this.just_pressed.has(code)) {
			return false;
		}
		this.just_pressed.delete(code);
		return true;
	}

	endFrame(): void {
		this.just_pressed.clear();
	}
}
