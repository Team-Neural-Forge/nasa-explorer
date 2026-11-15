import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { LifeSupport } from "../engine/life_support";
import { publishLifeSupportTelemetry } from "./life_support_telemetry";
import {
	DEFAULT_SELECTION,
	type InstrumentId,
	type LaunchVehicleId,
	type RocketSelection,
	type SpacecraftId,
} from "./rocket_config";
import { resetSimulationTime } from "./simulation_clock";

type GameStateValue = {
	menu_open: boolean;
	started: boolean;
	mission_id: number;
	selection: RocketSelection;
	startOrResume: () => void;
	openMenu: () => void;
	restartMission: () => void;
	setLaunchVehicle: (id: LaunchVehicleId) => void;
	setSpacecraft: (id: SpacecraftId) => void;
	toggleInstrument: (id: InstrumentId) => void;
	setDestination: (id: string) => void;
};

const GameStateContext = createContext<GameStateValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
	const [menu_open, set_menu_open] = useState(true);
	const [started, set_started] = useState(false);
	const [mission_id, set_mission_id] = useState(0);
	const started_ref = useRef(false);
	const [selection, set_selection] =
		useState<RocketSelection>(DEFAULT_SELECTION);

	const startOrResume = useCallback(() => {
		if (!started_ref.current) {
			resetSimulationTime();
			started_ref.current = true;
			set_started(true);
		}
		set_menu_open(false);
	}, []);

	const openMenu = useCallback(() => {
		set_menu_open(true);
	}, []);

	const restartMission = useCallback(() => {
		resetSimulationTime();
		publishLifeSupportTelemetry(new LifeSupport().snapshot());
		started_ref.current = true;
		set_started(true);
		set_selection(DEFAULT_SELECTION);
		set_mission_id((current) => current + 1);
		set_menu_open(false);
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
			menu_open,
			started,
			mission_id,
			selection,
			startOrResume,
			openMenu,
			restartMission,
			setLaunchVehicle,
			setSpacecraft,
			toggleInstrument,
			setDestination,
		}),
		[
			menu_open,
			started,
			mission_id,
			selection,
			startOrResume,
			openMenu,
			restartMission,
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
