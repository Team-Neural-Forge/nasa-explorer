import { useSyncExternalStore } from "react";
import { TIME_WARP_FACTORS } from "../../engine/time_warp";
import { useGameState } from "../../state/game_state";
import { orbit_actions } from "../../state/orbit_control";
import {
	getOrbitTelemetry,
	subscribeOrbitTelemetry,
} from "../../state/orbit_telemetry";

function formatAltitude(altitude_m: number): string {
	if (altitude_m >= 1000) {
		return `${(altitude_m / 1000).toFixed(1)} km`;
	}
	return `${altitude_m.toFixed(0)} m`;
}

function formatSpeed(speed_m_s: number): string {
	if (speed_m_s >= 1000) {
		return `${(speed_m_s / 1000).toFixed(2)} km/s`;
	}
	return `${speed_m_s.toFixed(0)} m/s`;
}

function formatPeriod(period_s: number): string {
	return `${(period_s / 60).toFixed(1)} min`;
}

function formatWarp(warp: number): string {
	return `×${warp.toLocaleString("en-US")}`;
}

export function OrbitHud() {
	const telemetry = useSyncExternalStore(
		subscribeOrbitTelemetry,
		getOrbitTelemetry,
		getOrbitTelemetry,
	);
	const { returnToLaunch, returnToMenu } = useGameState();
	const is_eva = telemetry.mode === "eva";
	const can_toggle_eva = !is_eva || telemetry.can_reenter;

	return (
		<section className="launch-hud" aria-label="Orbit controls">
			<header className="launch-hud-header">
				<p className="menu-eyebrow">Low Earth orbit</p>
				<h2 className="assembly-title launch-status launch-status-orbit">
					Orbit
				</h2>
				<p className="launch-message" role="status" aria-live="polite">
					{telemetry.message}
				</p>
			</header>

			<dl className="launch-readouts">
				<div className="assembly-readout">
					<dt>Altitude</dt>
					<dd>{formatAltitude(telemetry.altitude_m)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Orbital speed</dt>
					<dd>{formatSpeed(telemetry.speed_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Period</dt>
					<dd>{formatPeriod(telemetry.period_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Time warp</dt>
					<dd>{formatWarp(telemetry.warp)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Mode</dt>
					<dd>{is_eva ? "EVA" : "Inside"}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Hatch distance</dt>
					<dd>
						{is_eva ? `${telemetry.astronaut_distance_m.toFixed(1)} m` : "—"}
					</dd>
				</div>
			</dl>

			<div className="orbit-warp">
				<div className="orbit-warp-header">
					<span>Time warp</span>
					<strong>{formatWarp(telemetry.warp)}</strong>
				</div>
				<div className="orbit-warp-buttons">
					{TIME_WARP_FACTORS.map((factor, index) => (
						<button
							key={factor}
							type="button"
							className={`launch-button${telemetry.warp === factor ? " launch-button-active" : ""}`}
							disabled={is_eva}
							onClick={() => orbit_actions.current?.set_warp_index(index)}
						>
							{formatWarp(factor)}
						</button>
					))}
				</div>
				{is_eva ? (
					<p className="orbit-note">
						Time warp pauses while you are outside the spacecraft.
					</p>
				) : null}
			</div>

			<div className="launch-controls">
				<button
					type="button"
					className="launch-button launch-button-primary"
					disabled={!can_toggle_eva}
					onClick={() => orbit_actions.current?.toggle_eva()}
				>
					{is_eva ? "Enter spacecraft (E)" : "Exit spacecraft (E)"}
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={!is_eva}
					onClick={() => orbit_actions.current?.return_to_ship()}
				>
					Return to ship
				</button>
			</div>

			<p className="launch-keys">
				Keyboard: E exit/enter · W/A/S/D or arrows RCS · [ / ] time warp
			</p>

			<div className="orbit-note">
				Interplanetary cruise and the Moon transfer arrive in the next build
				step.
			</div>

			<div className="launch-actions">
				<button
					type="button"
					className="launch-button"
					onClick={returnToLaunch}
				>
					Back to launch
				</button>
				<button type="button" className="assembly-back" onClick={returnToMenu}>
					Return to menu
				</button>
			</div>
		</section>
	);
}
