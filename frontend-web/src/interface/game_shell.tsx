import { useGameState } from "../state/game_state";
import { AssemblyPanel } from "./assembly/assembly_panel";
import { GameCanvas } from "./game_canvas";
import { LaunchHud } from "./launch/launch_hud";
import { MenuOverlay } from "./menu/menu_overlay";
import { OrbitHud } from "./orbit/orbit_hud";

export function GameShell() {
	const { scene } = useGameState();

	return (
		<main className="game-shell">
			<GameCanvas />
			<div className="game-ui">
				{scene === "menu" ? <MenuOverlay /> : null}
				{scene === "assembly" ? <AssemblyPanel /> : null}
				{scene === "launch" ? <LaunchHud /> : null}
				{scene === "orbit" ? <OrbitHud /> : null}
			</div>
		</main>
	);
}
