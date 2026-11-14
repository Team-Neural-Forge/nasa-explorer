import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { OrbitInsertion } from "../engine/orbit_simulation";
import { canTransition, type SceneId } from "../engine/scene_manager";
import {
	DEFAULT_SELECTION,
	type InstrumentId,
	type LaunchVehicleId,
	type RocketSelection,
	type SpacecraftId,
} from "./rocket_config";

type GameStateValue = {
	scene: SceneId;
	selection: RocketSelection;
	orbit_state: OrbitInsertion | null;
	beginMission: () => void;
	returnToMenu: () => void;
	returnToAssembly: () => void;
	beginLaunch: () => void;
	beginOrbit: (state: OrbitInsertion) => void;
	beginCruise: () => void;
	returnToOrbit: () => void;
	returnToLaunch: () => void;
	setLaunchVehicle: (id: LaunchVehicleId) => void;
	setSpacecraft: (id: SpacecraftId) => void;
	toggleInstrument: (id: InstrumentId) => void;
	setDestination: (id: string) => void;
};

const GameStateContext = createContext<GameStateValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
	const [scene, setScene] = useState<SceneId>("menu");
	const [selection, set_selection] =
		useState<RocketSelection>(DEFAULT_SELECTION);
	const [orbit_state, set_orbit_state] = useState<OrbitInsertion | null>(null);

	const beginMission = useCallback(() => {
		setScene((current) =>
			canTransition(current, "assembly") ? "assembly" : current,
		);
	}, []);

	const returnToMenu = useCallback(() => {
		setScene((current) => (canTransition(current, "menu") ? "menu" : current));
	}, []);

	const returnToAssembly = useCallback(() => {
		setScene((current) =>
			canTransition(current, "assembly") ? "assembly" : current,
		);
	}, []);

	const beginLaunch = useCallback(() => {
		setScene((current) =>
			canTransition(current, "launch") ? "launch" : current,
		);
	}, []);

	const beginOrbit = useCallback((state: OrbitInsertion) => {
		set_orbit_state(state);
		setScene((current) =>
			canTransition(current, "orbit") ? "orbit" : current,
		);
	}, []);

	const beginCruise = useCallback(() => {
		setScene((current) =>
			canTransition(current, "cruise") ? "cruise" : current,
		);
	}, []);

	const returnToOrbit = useCallback(() => {
		setScene((current) =>
			canTransition(current, "orbit") ? "orbit" : current,
		);
	}, []);

	const returnToLaunch = useCallback(() => {
		setScene((current) =>
			canTransition(current, "launch") ? "launch" : current,
		);
	}, []);

	const setLaunchVehicle = useCallback((id: LaunchVehicleId) => {
		set_selection((current) => ({
			...current,
			launch_vehicle_id: id,
		}));
	}, []);

	const setSpacecraft = useCallback((id: SpacecraftId) => {
		set_selection((current) => ({ ...current, spacecraft_id: id }));
	}, []);

	const toggleInstrument = useCallback((id: InstrumentId) => {
		set_selection((current) => {
			const selected = current.instrument_ids.includes(id);
			return {
				...current,
				instrument_ids: selected
					? current.instrument_ids.filter(
							(instrument_id) => instrument_id !== id,
						)
					: [...current.instrument_ids, id],
			};
		});
	}, []);

	const setDestination = useCallback((id: string) => {
		set_selection((current) => ({ ...current, destination_id: id }));
	}, []);

	const value = useMemo(
		() => ({
			scene,
			selection,
			orbit_state,
			beginMission,
			returnToMenu,
			returnToAssembly,
			beginLaunch,
			beginOrbit,
			beginCruise,
			returnToOrbit,
			returnToLaunch,
			setLaunchVehicle,
			setSpacecraft,
			toggleInstrument,
			setDestination,
		}),
		[
			scene,
			selection,
			orbit_state,
			beginMission,
			returnToMenu,
			returnToAssembly,
			beginLaunch,
			beginOrbit,
			beginCruise,
			returnToOrbit,
			returnToLaunch,
			setLaunchVehicle,
			setSpacecraft,
			toggleInstrument,
			setDestination,
		],
	);

	return (
		<GameStateContext.Provider value={value}>
			{children}
		</GameStateContext.Provider>
	);
}

export function useGameState(): GameStateValue {
	const value = useContext(GameStateContext);
	if (!value) {
		throw new Error("useGameState must be used within a GameStateProvider");
	}
	return value;
}
