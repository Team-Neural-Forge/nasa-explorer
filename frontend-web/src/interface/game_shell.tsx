import { useGameState } from "../state/game_state";
import { useSandboxMode } from "../state/sandbox_mode";
import { CruiseHud } from "./cruise/cruise_hud";
import { EarthHud } from "./earth/earth_hud";
import { GameCanvas } from "./game_canvas";
import { LandingHud } from "./landing/landing_hud";
import { LaunchHud } from "./launch/launch_hud";
import { MenuOverlay } from "./menu/menu_overlay";
import { NavigationPanel } from "./navigation/navigation_panel";
import { OrbitHud } from "./orbit/orbit_hud";

export function GameShell() {
	const { menu_open, mission_id } = useGameState();
	const mode = useSandboxMode();

	return (
		<main className="game-shell">
			<GameCanvas key={mission_id} />
			<div className="game-ui">
				{menu_open ? <MenuOverlay /> : null}
				{!menu_open && mode === "earth" ? <EarthHud /> : null}
				{!menu_open && (mode === "rocket" || mode === "launch") ? (
					<LaunchHud />
				) : null}
				{!menu_open && mode === "orbit" ? <OrbitHud /> : null}
				{!menu_open && mode === "cruise" ? <CruiseHud /> : null}
				{!menu_open && mode === "landing" ? <LandingHud /> : null}
				{!menu_open ? <NavigationPanel /> : null}
			</div>
		</main>
	);
}
