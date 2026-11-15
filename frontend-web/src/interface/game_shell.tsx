import { useSyncExternalStore } from "react";
import { useGameState } from "../state/game_state";
import {
	getLifeSupportTelemetry,
	subscribeLifeSupportTelemetry,
} from "../state/life_support_telemetry";
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
	const { menu_open, mission_id, restartMission } = useGameState();
	const mode = useSandboxMode();
	const life_support = useSyncExternalStore(
		subscribeLifeSupportTelemetry,
		getLifeSupportTelemetry,
		getLifeSupportTelemetry,
	);

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
				{!menu_open && life_support.deceased ? (
					<section
						className="life-support-failure"
						role="alertdialog"
						aria-label="Life support failure"
					>
						<div>
							<h2>Life support exhausted</h2>
							<p>
								Suit life support failed and health fell to zero. Oxygen supply,
								pressure, power and carbon dioxide removal are essential on a
								spacewalk.
							</p>
							<p>
								This is a simplified game model, not a prediction of survival
								time.
							</p>
							<button type="button" onClick={restartMission}>
								Restart on Earth
							</button>
						</div>
					</section>
				) : null}
			</div>
		</main>
	);
}
