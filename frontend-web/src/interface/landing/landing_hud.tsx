import { useSyncExternalStore } from "react";
import { useGameState } from "../../state/game_state";
import { landing_actions } from "../../state/landing_control";
import {
	getLandingTelemetry,
	subscribeLandingTelemetry,
} from "../../state/landing_telemetry";

const STATUS_LABELS = {
	flying: "Descent",
	landed: "Landed",
	crashed: "Crash",
} as const;

function formatAltitude(altitude_m: number): string {
	if (altitude_m >= 1000) {
		return `${(altitude_m / 1000).toFixed(2)} km`;
	}
	return `${altitude_m.toFixed(0)} m`;
}

function formatSpeed(speed_m_s: number): string {
	return `${speed_m_s.toFixed(1)} m/s`;
}

export function LandingHud() {
	const telemetry = useSyncExternalStore(
		subscribeLandingTelemetry,
		getLandingTelemetry,
		getLandingTelemetry,
	);
	const { returnToCruise, returnToMenu } = useGameState();
	const status = telemetry.status;
	const descending_too_fast =
		Math.abs(telemetry.vertical_speed_m_s) > telemetry.safe_vertical_m_s;
	const drifting =
		telemetry.horizontal_speed_m_s > telemetry.safe_horizontal_m_s;
	const tilted = Math.abs(telemetry.attitude_deg) > telemetry.safe_tilt_deg;

	return (
		<section className="launch-hud" aria-label="Lunar landing controls">
			<header className="launch-hud-header">
				<p className="menu-eyebrow">Lunar descent</p>
				<h2
					className={`assembly-title launch-status${
						status === "landed"
							? " launch-status-orbit"
							: status === "crashed"
								? " launch-status-crashed"
								: ""
					}`}
				>
					{STATUS_LABELS[status]}
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
					<dt>Vertical speed</dt>
					<dd className={descending_too_fast ? "landing-danger" : ""}>
						{formatSpeed(telemetry.vertical_speed_m_s)}
					</dd>
				</div>
				<div className="assembly-readout">
					<dt>Horizontal speed</dt>
					<dd className={drifting ? "landing-danger" : ""}>
						{formatSpeed(telemetry.horizontal_speed_m_s)}
					</dd>
				</div>
				<div className="assembly-readout">
					<dt>Tilt</dt>
					<dd className={tilted ? "landing-danger" : ""}>
						{telemetry.attitude_deg.toFixed(0)}°
					</dd>
				</div>
				<div className="assembly-readout">
					<dt>Fuel</dt>
					<dd>{(telemetry.fuel_fraction * 100).toFixed(0)}%</dd>
				</div>
				<div className="assembly-readout">
					<dt>Throttle</dt>
					<dd>{(telemetry.throttle * 100).toFixed(0)}%</dd>
				</div>
				<div className="assembly-readout">
					<dt>Hover throttle</dt>
					<dd>{(telemetry.hover_throttle * 100).toFixed(0)}%</dd>
				</div>
				<div className="assembly-readout">
					<dt>TWR</dt>
					<dd>{telemetry.twr.toFixed(2)}</dd>
				</div>
			</dl>

			<p className="orbit-note">
				Safe touchdown: vertical ≤ {telemetry.safe_vertical_m_s} m/s, horizontal
				≤ {telemetry.safe_horizontal_m_s} m/s, tilt ≤ {telemetry.safe_tilt_deg}
				°.
			</p>

			<div className="launch-controls">
				<button
					type="button"
					className="launch-button"
					disabled={status !== "flying"}
					onClick={() => landing_actions.current?.throttle_down()}
				>
					Throttle −
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={status !== "flying"}
					onClick={() => landing_actions.current?.throttle_up()}
				>
					Throttle +
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={status !== "flying"}
					onClick={() => landing_actions.current?.rotate_left()}
				>
					Pitch left
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={status !== "flying"}
					onClick={() => landing_actions.current?.rotate_right()}
				>
					Pitch right
				</button>
				<button
					type="button"
					className={`launch-button landing-autopilot${telemetry.autopilot ? " launch-button-active" : ""}`}
					disabled={status !== "flying"}
					onClick={() => landing_actions.current?.toggle_autopilot()}
				>
					{telemetry.autopilot ? "Disengage autopilot" : "Auto-land"}
				</button>
			</div>

			<p className="launch-keys">
				Keyboard: ↑/↓ throttle · ←/→ pitch · P autopilot · R retry landing
			</p>

			<div className="launch-actions">
				{status === "crashed" ? (
					<button
						type="button"
						className="launch-button launch-button-primary"
						onClick={() => landing_actions.current?.retry()}
					>
						Retry landing
					</button>
				) : null}
				{status === "landed" ? (
					<div className="orbit-note">
						Surface exploration and the whole-Moon view arrive in the next build
						step.
					</div>
				) : null}
				<button
					type="button"
					className="launch-button"
					onClick={returnToCruise}
				>
					Return to cruise
				</button>
				<button type="button" className="assembly-back" onClick={returnToMenu}>
					Return to menu
				</button>
			</div>
		</section>
	);
}
