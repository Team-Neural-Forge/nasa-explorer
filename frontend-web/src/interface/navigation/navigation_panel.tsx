import { Body } from "astronomy-engine";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
	formatVector,
	getBarycentricPosition,
	interpolateTransfer,
	navigation_bodies,
} from "../../engine/solar_navigation";
import {
	getCruiseTelemetry,
	subscribeCruiseTelemetry,
} from "../../state/cruise_telemetry";
import { useGameState } from "../../state/game_state";
import {
	getLandingTelemetry,
	subscribeLandingTelemetry,
} from "../../state/landing_telemetry";
import {
	getLaunchTelemetry,
	subscribeLaunchTelemetry,
} from "../../state/launch_telemetry";
import {
	getOrbitTelemetry,
	subscribeOrbitTelemetry,
} from "../../state/orbit_telemetry";
import { useSandboxMode } from "../../state/sandbox_mode";
import { getSimulationTime } from "../../state/simulation_clock";
import { LifeSupportPanel } from "./life_support_panel";

export function NavigationPanel() {
	const { restartMission } = useGameState();
	const mode = useSandboxMode();
	const [open, set_open] = useState(false);
	const [time_ms, set_time_ms] = useState(getSimulationTime);
	const cruise = useSyncExternalStore(
		subscribeCruiseTelemetry,
		getCruiseTelemetry,
		getCruiseTelemetry,
	);
	const launch = useSyncExternalStore(
		subscribeLaunchTelemetry,
		getLaunchTelemetry,
		getLaunchTelemetry,
	);
	const orbit = useSyncExternalStore(
		subscribeOrbitTelemetry,
		getOrbitTelemetry,
		getOrbitTelemetry,
	);
	const landing = useSyncExternalStore(
		subscribeLandingTelemetry,
		getLandingTelemetry,
		getLandingTelemetry,
	);
	useEffect(() => {
		const timer = window.setInterval(
			() => set_time_ms(getSimulationTime()),
			250,
		);
		return () => window.clearInterval(timer);
	}, []);
	const earth = getBarycentricPosition(Body.Earth, time_ms);
	const moon = getBarycentricPosition(Body.Moon, time_ms);
	const position =
		mode === "cruise"
			? interpolateTransfer(earth, moon, cruise.progress)
			: mode === "landing"
				? moon
				: earth;
	const description =
		mode === "cruise"
			? "Estimated route interpolation between Earth and Moon centers; not a simulated trajectory."
			: mode === "landing"
				? "Moon center proxy; the landing site's orientation is not modeled."
				: "Earth center proxy; the player's surface or orbital orientation is not modeled in this frame.";
	const local_position =
		mode === "launch"
			? `Earth-centered game plane X ${Math.round(launch.position_x_m)} m, Y ${Math.round(launch.position_y_m)} m`
			: mode === "orbit"
				? `Orbit angle ${(((orbit.orbit_angle_rad * 180) / Math.PI) % 360).toFixed(1)}°, altitude ${(orbit.altitude_m / 1000).toFixed(1)} km; EVA relative X ${orbit.astronaut_x_m.toFixed(1)} m, Y ${orbit.astronaut_y_m.toFixed(1)} m`
				: mode === "cruise"
					? `${(cruise.progress * 100).toFixed(1)}% along the guided transfer; ${(cruise.distance_remaining_m / 1000).toFixed(0)} km remaining`
					: mode === "landing"
						? `Moon landing plane X ${landing.horizontal_position_m.toFixed(0)} m, altitude ${landing.altitude_m.toFixed(0)} m`
						: "Earth launch site; surface coordinates are not georeferenced.";
	return (
		<aside className="navigation-panel" aria-label="Navigation">
			<div className="navigation-summary">
				<LifeSupportPanel />
				<strong>
					Solar navigation ·{" "}
					{new Date(time_ms).toISOString().replace("T", " ").slice(0, 19)} UTC
				</strong>
				<span>
					Approx. position (SSB / EQJ, km): {formatVector(position, "km")}
				</span>
				<span>{description}</span>
				<span>Local position: {local_position}</span>
				<div className="navigation-actions">
					<button
						type="button"
						onClick={() => set_open(!open)}
						aria-expanded={open}
					>
						{open ? "Close guide" : "Navigation guide"}
					</button>
					<button type="button" onClick={restartMission}>
						Restart on Earth
					</button>
				</div>
			</div>
			{open && (
				<section
					className="navigation-guide"
					aria-label="Solar System navigation guide"
				>
					<h2>Solar System coordinates</h2>
					<p>
						Origin: Solar System barycenter (SSB). Axes: J2000 mean equator
						(EQJ), approximately aligned with ICRF. Body-center positions are
						geometric, model estimates in astronomical units (AU); one AU is
						approximately 149.6 million km. The simulation clock starts at your
						current date and advances with game time and time warp.
					</p>
					<table>
						<thead>
							<tr>
								<th>Body</th>
								<th>X, Y, Z (AU)</th>
							</tr>
						</thead>
						<tbody>
							{navigation_bodies.map((body) => (
								<tr key={body}>
									<td>{body}</td>
									<td>
										{formatVector(getBarycentricPosition(body, time_ms), "AU")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<p>
						Europa and Enceladus positions are not yet modeled. The spacecraft
						proxies above are not navigable ephemerides; no position is
						transmitted to NASA.
					</p>
					<p>
						<a
							href="https://ssd.jpl.nasa.gov/horizons/"
							target="_blank"
							rel="noreferrer"
						>
							NASA/JPL Horizons reference
						</a>{" "}
						·{" "}
						<a
							href="https://github.com/cosinekitty/astronomy"
							target="_blank"
							rel="noreferrer"
						>
							Astronomy Engine model
						</a>
					</p>
				</section>
			)}
		</aside>
	);
}
