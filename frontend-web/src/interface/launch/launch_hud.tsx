import { useSyncExternalStore } from "react";
import { FLIGHT_SPEED_FACTORS } from "../../engine/flight_speed";
import type { LaunchStatus } from "../../engine/launch_simulation";
import { useGameState } from "../../state/game_state";
import { launch_actions } from "../../state/launch_control";
import {
	getLaunchTelemetry,
	subscribeLaunchTelemetry,
} from "../../state/launch_telemetry";
import { sandbox_actions } from "../../state/sandbox_actions";

const STATUS_LABELS: Record<LaunchStatus, string> = {
	prelaunch: "Ready",
	flying: "Ascent",
	coasting: "Coasting",
	orbit: "Orbit",
	suborbital: "Suborbital",
	crashed: "Impact",
};

function formatAltitude(altitude_m: number): string {
	if (altitude_m >= 1000) {
		return `${(altitude_m / 1000).toFixed(1)} km`;
	}
	return `${altitude_m.toFixed(0)} m`;
}

function formatSpeed(speed_m_s: number): string {
	return `${speed_m_s.toFixed(0)} m/s`;
}

function formatApoapsis(apoapsis_m: number | null): string {
	return apoapsis_m === null ? "escape" : formatAltitude(apoapsis_m);
}

export function LaunchHud() {
	const telemetry = useSyncExternalStore(
		subscribeLaunchTelemetry,
		getLaunchTelemetry,
		getLaunchTelemetry,
	);
	const { openMenu } = useGameState();
	const status = telemetry.status;
	const is_prelaunch = status === "prelaunch";
	const is_terminal = status === "orbit" || status === "crashed";

	return (
		<section className="launch-hud" aria-label="Launch controls">
			<header className="launch-hud-header">
				<p className="menu-eyebrow">Launch — Earth</p>
				<h2 className={`assembly-title launch-status launch-status-${status}`}>
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
					<dt>Speed</dt>
					<dd>{formatSpeed(telemetry.speed_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Vertical</dt>
					<dd>{formatSpeed(telemetry.vertical_speed_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Horizontal</dt>
					<dd>{formatSpeed(telemetry.horizontal_speed_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Apoapsis</dt>
					<dd>{formatApoapsis(telemetry.apoapsis_m)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Periapsis</dt>
					<dd>{formatAltitude(Math.max(0, telemetry.periapsis_m))}</dd>
				</div>
				<div className="assembly-readout">
					<dt>TWR</dt>
					<dd>{telemetry.twr.toFixed(2)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Fuel</dt>
					<dd>{(telemetry.fuel_fraction * 100).toFixed(0)}%</dd>
				</div>
			</dl>

			<div className="launch-guidance">
				<div>
					<span>Guidance pitch</span>
					<strong>{telemetry.guidance_angle_deg.toFixed(0)}°</strong>
				</div>
				<div>
					<span>Your pitch</span>
					<strong>{telemetry.attitude_deg.toFixed(0)}°</strong>
				</div>
				<div>
					<span>Throttle</span>
					<strong>{(telemetry.throttle * 100).toFixed(0)}%</strong>
				</div>
			</div>

			<div className="launch-controls">
				<button
					type="button"
					className="launch-button launch-button-primary"
					disabled={!is_prelaunch}
					onClick={() => launch_actions.current?.ignite()}
				>
					Ignite
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={is_terminal}
					onClick={() => launch_actions.current?.throttle_down()}
				>
					Throttle −
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={is_terminal}
					onClick={() => launch_actions.current?.throttle_up()}
				>
					Throttle +
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={is_terminal}
					onClick={() => launch_actions.current?.rotate_left()}
				>
					Pitch left
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={is_terminal}
					onClick={() => launch_actions.current?.rotate_right()}
				>
					Pitch right
				</button>
				<button
					type="button"
					className="launch-button"
					disabled={is_terminal}
					onClick={() => launch_actions.current?.stage()}
				>
					Stage
				</button>
			</div>

			<div className="orbit-warp">
				<div className="orbit-warp-header">
					<span>Flight speed</span>
					<strong>×{telemetry.speed_factor}</strong>
				</div>
				<div className="orbit-warp-buttons">
					{FLIGHT_SPEED_FACTORS.map((factor, index) => (
						<button
							key={factor}
							type="button"
							className={`launch-button${telemetry.speed_factor === factor ? " launch-button-active" : ""}`}
							onClick={() => launch_actions.current?.set_speed(index)}
						>
							×{factor}
						</button>
					))}
				</div>
				<p className="orbit-note">
					Scales the ×4 simulation rate during ascent and coast — physics per
					simulated second is unchanged.
				</p>
			</div>

			<p className="launch-keys">
				Keyboard: Enter ignite · ↑/↓ throttle · ←/→ pitch · Space stage · [ / ]
				flight speed
			</p>

			<div className="launch-actions">
				{status === "orbit" ? (
					<button
						type="button"
						className="launch-button launch-button-primary"
						onClick={() =>
							sandbox_actions.current?.continue_to_orbit({
								altitude_m: telemetry.altitude_m,
								speed_m_s: telemetry.speed_m_s,
							})
						}
					>
						Continue to orbit
					</button>
				) : null}
				{status === "crashed" || status === "suborbital" ? (
					<p className="orbit-note">
						This run is over — use Restart on Earth (top-left) to fly again.
					</p>
				) : null}
				{is_prelaunch ? (
					<button
						type="button"
						className="launch-button"
						onClick={() => sandbox_actions.current?.exit_rocket()}
					>
						Exit rocket
					</button>
				) : null}
				<button type="button" className="assembly-back" onClick={openMenu}>
					Return to menu
				</button>
			</div>
		</section>
	);
}
