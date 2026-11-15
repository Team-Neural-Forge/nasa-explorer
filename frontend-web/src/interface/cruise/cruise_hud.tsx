import { useSyncExternalStore } from "react";
import { CRUISE_TIME_WARP_FACTORS } from "../../engine/time_warp";
import { cruise_actions } from "../../state/cruise_control";
import {
	getCruiseTelemetry,
	subscribeCruiseTelemetry,
} from "../../state/cruise_telemetry";
import { useGameState } from "../../state/game_state";
import { sandbox_actions } from "../../state/sandbox_actions";

function formatDistance(distance_m: number): string {
	return `${Math.max(0, distance_m / 1000).toLocaleString("en-US", {
		maximumFractionDigits: 0,
	})} km`;
}

function formatSpeed(speed_m_s: number): string {
	return `${(speed_m_s / 1000).toFixed(2)} km/s`;
}

function formatEta(seconds: number): string {
	if (seconds <= 0) {
		return "arrived";
	}
	if (seconds < 60) {
		return `${Math.max(1, Math.round(seconds))}s`;
	}
	const days = Math.floor(seconds / 86_400);
	const hours = Math.floor((seconds % 86_400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) {
		return `${days}d ${hours}h`;
	}
	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}

function formatWarp(warp: number): string {
	return `×${warp.toLocaleString("en-US")}`;
}

export function CruiseHud() {
	const telemetry = useSyncExternalStore(
		subscribeCruiseTelemetry,
		getCruiseTelemetry,
		getCruiseTelemetry,
	);
	const { openMenu } = useGameState();
	const arrived = telemetry.status === "arrived";
	const progress_percent = Math.round(telemetry.progress * 100);

	return (
		<section className="launch-hud" aria-label="Cruise controls">
			<header className="launch-hud-header">
				<p className="menu-eyebrow">Earth → Moon</p>
				<h2
					className={`assembly-title launch-status${arrived ? " launch-status-orbit" : ""}`}
				>
					{arrived ? "Arrived" : "Cruise"}
				</h2>
				<p className="launch-message" role="status" aria-live="polite">
					{telemetry.message}
				</p>
			</header>

			<div className="orbit-warp">
				<div className="orbit-warp-header">
					<span>Time warp</span>
					<strong>{formatWarp(telemetry.warp)}</strong>
				</div>
				<div className="orbit-warp-buttons">
					{CRUISE_TIME_WARP_FACTORS.map((factor, index) => (
						<button
							key={factor}
							type="button"
							className={`launch-button${telemetry.warp === factor ? " launch-button-active" : ""}`}
							onClick={() => cruise_actions.current?.set_warp_index(index)}
						>
							{formatWarp(factor)}
						</button>
					))}
				</div>
				<p className="orbit-note">
					The distance is real; time warp only changes how fast the clock runs.
				</p>
			</div>

			<div className="orbit-progress">
				<div className="orbit-progress-header">
					<span>Progress</span>
					<strong>{progress_percent}%</strong>
				</div>
				<div
					className="orbit-progress-track"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={progress_percent}
					aria-label="Cruise progress"
				>
					<div
						className="orbit-progress-fill"
						style={{ width: `${progress_percent}%` }}
					/>
				</div>
			</div>

			<dl className="launch-readouts">
				<div className="assembly-readout">
					<dt>Distance remaining</dt>
					<dd>{formatDistance(telemetry.distance_remaining_m)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Total distance</dt>
					<dd>{formatDistance(telemetry.distance_total_m)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Cruise speed</dt>
					<dd>{formatSpeed(telemetry.speed_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Arrival in</dt>
					<dd>{formatEta(telemetry.eta_seconds / telemetry.warp)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Time warp</dt>
					<dd>{formatWarp(telemetry.warp)}</dd>
				</div>
			</dl>

			<p className="launch-keys">Keyboard: [ / ] time warp</p>

			<div className="launch-actions">
				{arrived ? (
					<>
						<button
							type="button"
							className="launch-button launch-button-primary"
							onClick={() => sandbox_actions.current?.begin_landing()}
						>
							Begin lunar approach
						</button>
						<button
							type="button"
							className="launch-button"
							onClick={() => sandbox_actions.current?.return_to_orbit()}
						>
							Return to orbit
						</button>
					</>
				) : null}
				<button type="button" className="assembly-back" onClick={openMenu}>
					Return to menu
				</button>
			</div>
		</section>
	);
}
