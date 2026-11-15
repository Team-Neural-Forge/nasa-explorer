export type LaunchActions = {
	ignite: () => void;
	throttle_up: () => void;
	throttle_down: () => void;
	rotate_left: () => void;
	rotate_right: () => void;
	stage: () => void;
	set_speed: (index: number) => void;
	increase_speed: () => void;
	decrease_speed: () => void;
};

export const launch_actions: { current: LaunchActions | null } = {
	current: null,
};
