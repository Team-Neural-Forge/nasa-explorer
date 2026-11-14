import { useGameState } from "../state/game_state";
import { AssemblyPanel } from "./assembly/assembly_panel";
import { CruiseHud } from "./cruise/cruise_hud";
import { GameCanvas } from "./game_canvas";
import { LandingHud } from "./landing/landing_hud";
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
				{scene === "cruise" ? <CruiseHud /> : null}
				{scene === "landing" ? <LandingHud /> : null}
			</div>
		</main>
	);
}
