import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { canTransition, type SceneId } from "../engine/scene_manager";

type GameStateValue = {
	scene: SceneId;
	beginMission: () => void;
	returnToMenu: () => void;
};

const GameStateContext = createContext<GameStateValue | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
	const [scene, setScene] = useState<SceneId>("menu");

	const beginMission = useCallback(() => {
		setScene((current) =>
			canTransition(current, "assembly") ? "assembly" : current,
		);
	}, []);

	const returnToMenu = useCallback(() => {
		setScene((current) => (canTransition(current, "menu") ? "menu" : current));
	}, []);

	const value = useMemo(
		() => ({ scene, beginMission, returnToMenu }),
		[scene, beginMission, returnToMenu],
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
