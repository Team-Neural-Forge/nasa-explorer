export type LandingActions = {
	throttle_up: () => void;
	throttle_down: () => void;
	rotate_left: () => void;
	rotate_right: () => void;
	toggle_autopilot: () => void;
	retry: () => void;
};

export const landing_actions: { current: LandingActions | null } = {
	current: null,
};
