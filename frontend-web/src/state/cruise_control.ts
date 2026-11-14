export type CruiseActions = {
	increase_warp: () => void;
	decrease_warp: () => void;
	set_warp_index: (index: number) => void;
};

export const cruise_actions: { current: CruiseActions | null } = {
	current: null,
};
