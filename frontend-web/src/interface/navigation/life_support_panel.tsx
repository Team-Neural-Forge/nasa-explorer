import { useSyncExternalStore } from "react";
import {
	EVA_BATTERY_SECONDS,
	EVA_SCRUBBER_SECONDS,
	EVA_SUPPLY_SECONDS,
} from "../../engine/life_support";
import {
	getLifeSupportTelemetry,
	subscribeLifeSupportTelemetry,
} from "../../state/life_support_telemetry";

export function LifeSupportPanel() {
	const status = useSyncExternalStore(
		subscribeLifeSupportTelemetry,
		getLifeSupportTelemetry,
		getLifeSupportTelemetry,
	);
	const oxygen = Math.ceil((status.oxygen_seconds / EVA_SUPPLY_SECONDS) * 100);
	const scrubber = Math.ceil(
		(status.scrubber_seconds / EVA_SCRUBBER_SECONDS) * 100,
	);
	const battery = Math.ceil(
		(status.battery_seconds / EVA_BATTERY_SECONDS) * 100,
	);
	const minutes = Math.ceil(status.oxygen_seconds / 60);
	return (
		<section className="life-support" aria-label="Astronaut life support">
			<strong>
				Player status ·{" "}
				{status.environment === "eva"
					? "Spacewalk"
					: status.environment === "earth"
						? "Earth surface"
						: "Spacecraft cabin"}
			</strong>
			<span>
				Health: {Math.ceil(status.health)}% · Pressure:{" "}
				{status.pressure_kpa.toFixed(1)} kPa · CO₂:{" "}
				{status.co2_percent.toFixed(2)}% (model)
			</span>
			{status.environment === "eva" ? (
				<span>
					O₂ supply: {oxygen}% ({Math.floor(minutes / 60)}h {minutes % 60}m) ·
					CO₂ scrubber: {scrubber}% · Battery: {battery}%
				</span>
			) : (
				<span>Air and cabin life support: safe (assumed)</span>
			)}
			{status.environment === "eva" &&
			(Math.min(oxygen, scrubber, battery) <= 25 || status.health < 100) ? (
				<span className="landing-danger" role="status">
					{status.health < 100
						? "Life support danger — health is falling."
						: "Low suit resources — return to the spacecraft."}
				</span>
			) : null}
			<details>
				<summary>How life support works</summary>
				<p>
					NASA suits supply oxygen, maintain pressure, remove carbon dioxide and
					provide electrical power. Capacities, CO₂ buildup, pressure loss and
					health damage are simplified game assumptions, not medical
					predictions. The cabin is assumed to have functioning life support.
				</p>
				<a
					href="https://www.nasa.gov/missions/station/spacewalk-spacesuit-basics/"
					target="_blank"
					rel="noreferrer"
				>
					NASA: spacesuit life support
				</a>{" "}
				·{" "}
				<a
					href="https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-a-spacewalk-grades-5-8/"
					target="_blank"
					rel="noreferrer"
				>
					NASA: spacewalk duration
				</a>
			</details>
		</section>
	);
}
