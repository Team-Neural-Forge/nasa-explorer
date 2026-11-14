import type { OrbitInsertion } from "../engine/orbit_simulation";

export type SandboxActions = {
	enter_rocket: () => void;
	exit_rocket: () => void;
	continue_to_orbit: (insertion: OrbitInsertion) => void;
	begin_cruise: () => void;
	begin_landing: () => void;
	return_to_earth: () => void;
	return_to_orbit: () => void;
	return_to_cruise: () => void;
};

export const sandbox_actions: { current: SandboxActions | null } = {
	current: null,
};
