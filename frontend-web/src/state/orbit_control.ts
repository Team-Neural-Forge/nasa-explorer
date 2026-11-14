export type OrbitActions = {
	toggle_eva: () => void;
	increase_warp: () => void;
	decrease_warp: () => void;
	set_warp_index: (index: number) => void;
	return_to_ship: () => void;
};

export const orbit_actions: { current: OrbitActions | null } = {
	current: null,
};
