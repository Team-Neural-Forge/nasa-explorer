import { useGameState } from "../state/game_state";
import { AssemblyPanel } from "./assembly/assembly_panel";
import { GameCanvas } from "./game_canvas";
import { LaunchPlaceholder } from "./launch/launch_placeholder";
import { MenuOverlay } from "./menu/menu_overlay";

export function GameShell() {
	const { scene } = useGameState();

	return (
		<main className="game-shell">
			<GameCanvas />
			<div className="game-ui">
				{scene === "menu" ? <MenuOverlay /> : null}
				{scene === "assembly" ? <AssemblyPanel /> : null}
				{scene === "launch" ? <LaunchPlaceholder /> : null}
			</div>
		</main>
	);
}
