import { useGameState } from "../state/game_state";
import { AssemblyPlaceholder } from "./assembly/assembly_placeholder";
import { GameCanvas } from "./game_canvas";
import { MenuOverlay } from "./menu/menu_overlay";

export function GameShell() {
	const { scene } = useGameState();

	return (
		<main className="game-shell">
			<GameCanvas />
			<div className="game-ui">
				{scene === "menu" ? <MenuOverlay /> : <AssemblyPlaceholder />}
			</div>
		</main>
	);
}
