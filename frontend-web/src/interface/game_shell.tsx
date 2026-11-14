import { useGameState } from "../state/game_state";
import { CruiseHud } from "./cruise/cruise_hud";
import { EarthHud } from "./earth/earth_hud";
import { GameCanvas } from "./game_canvas";
import { LandingHud } from "./landing/landing_hud";
import { LaunchHud } from "./launch/launch_hud";
import { MenuOverlay } from "./menu/menu_overlay";
import { NavigationPanel } from "./navigation/navigation_panel";
import { OrbitHud } from "./orbit/orbit_hud";

export function GameShell() {
	const { scene, mission_id } = useGameState();

	return (
		<main className="game-shell">
			<GameCanvas key={mission_id} />
			<div className="game-ui">
				{scene === "menu" ? <MenuOverlay /> : null}
				{scene === "earth" ? <EarthHud /> : null}
				{scene === "launch" ? <LaunchHud /> : null}
				{scene === "orbit" ? <OrbitHud /> : null}
				{scene === "cruise" ? <CruiseHud /> : null}
				{scene === "landing" ? <LandingHud /> : null}
				{scene !== "menu" ? <NavigationPanel /> : null}
			</div>
		</main>
	);
}
