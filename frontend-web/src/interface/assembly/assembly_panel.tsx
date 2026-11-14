import { formatBudget, STARTING_BUDGET_USD_M } from "../../state/economy";
import { useGameState } from "../../state/game_state";
import {
	computeRocketStats,
	formatDeltaV,
	formatMass,
	getDestinationOptions,
	getInstrumentOptions,
	getLaunchVehicleOptions,
	getSpacecraftOptions,
} from "../../state/rocket_config";

const launch_vehicle_options = getLaunchVehicleOptions();
const spacecraft_options = getSpacecraftOptions();
const instrument_options = getInstrumentOptions();
const destination_options = getDestinationOptions();

export function AssemblyPanel() {
	const {
		selection,
		setLaunchVehicle,
		setSpacecraft,
		toggleInstrument,
		setDestination,
		beginLaunch,
		returnToMenu,
	} = useGameState();

	const stats = computeRocketStats(selection, STARTING_BUDGET_USD_M);
	const destination = destination_options.find(
		(option) => option.id === selection.destination_id,
	);

	return (
		<section className="assembly-overlay" aria-label="Rocket assembly">
			<header className="assembly-header">
				<p className="menu-eyebrow">Mission assembly — Earth</p>
				<h2 className="assembly-title">Build your rocket</h2>
				<p className="menu-tagline">
					Assembly happens only on Earth. Choose a launcher, spacecraft, and
					instruments; the design locks at launch.
				</p>
			</header>

			<div className="assembly-body">
				<div className="assembly-choices">
					<fieldset className="assembly-group">
						<legend>Launch vehicle</legend>
						{launch_vehicle_options.map((vehicle) => (
							<label key={vehicle.id} className="assembly-choice">
								<input
									type="radio"
									name="launch-vehicle"
									value={vehicle.id}
									checked={selection.launch_vehicle_id === vehicle.id}
									onChange={() => setLaunchVehicle(vehicle.id)}
								/>
								<span className="assembly-choice-main">
									<span className="assembly-choice-name">{vehicle.name}</span>
									<span className="assembly-choice-meta">
										{vehicle.vehicle_class} · {vehicle.thrust_kn} kN ·{" "}
										{formatBudget(vehicle.cost_usd_m)}
									</span>
								</span>
							</label>
						))}
					</fieldset>

					<fieldset className="assembly-group">
						<legend>Spacecraft</legend>
						{spacecraft_options.map((craft) => (
							<label key={craft.id} className="assembly-choice">
								<input
									type="radio"
									name="spacecraft"
									value={craft.id}
									checked={selection.spacecraft_id === craft.id}
									onChange={() => setSpacecraft(craft.id)}
								/>
								<span className="assembly-choice-main">
									<span className="assembly-choice-name">{craft.name}</span>
									<span className="assembly-choice-meta">
										{craft.target} · {formatMass(craft.dry_mass_kg)} ·{" "}
										{formatBudget(craft.cost_usd_m)}
									</span>
								</span>
							</label>
						))}
					</fieldset>

					<fieldset className="assembly-group">
						<legend>Instruments</legend>
						{instrument_options.map((instrument) => (
							<label key={instrument.id} className="assembly-choice">
								<input
									type="checkbox"
									value={instrument.id}
									checked={selection.instrument_ids.includes(instrument.id)}
									onChange={() => toggleInstrument(instrument.id)}
								/>
								<span className="assembly-choice-main">
									<span className="assembly-choice-name">
										{instrument.name}
									</span>
									<span className="assembly-choice-meta">
										{instrument.science_area} · {formatMass(instrument.mass_kg)}{" "}
										· {instrument.power_w} W ·{" "}
										{formatBudget(instrument.cost_usd_m)}
									</span>
								</span>
							</label>
						))}
					</fieldset>
				</div>

				<aside className="assembly-summary" aria-label="Design summary">
					<div className="assembly-target">
						<label htmlFor="assembly-destination">Target</label>
						<select
							id="assembly-destination"
							value={selection.destination_id}
							onChange={(event) => setDestination(event.target.value)}
						>
							{destination_options.map((option) => (
								<option key={option.id} value={option.id}>
									{option.name}
								</option>
							))}
						</select>
						<p>{destination?.note}</p>
					</div>

					<dl className="assembly-readouts">
						<div className="assembly-readout">
							<dt>Total mass</dt>
							<dd>{formatMass(stats.total_mass_kg)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Dry mass</dt>
							<dd>{formatMass(stats.dry_mass_kg)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Propellant</dt>
							<dd>{formatMass(stats.propellant_kg)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Thrust-to-weight</dt>
							<dd>{stats.twr.toFixed(2)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Delta-v available</dt>
							<dd>{formatDeltaV(stats.delta_v_m_s)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Delta-v required</dt>
							<dd>{formatDeltaV(stats.required_delta_v_m_s)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Cost</dt>
							<dd>{formatBudget(stats.cost_usd_m)}</dd>
						</div>
						<div className="assembly-readout">
							<dt>Budget</dt>
							<dd>{formatBudget(STARTING_BUDGET_USD_M)}</dd>
						</div>
					</dl>

					{stats.warnings.length > 0 ? (
						<ul className="assembly-warnings">
							{stats.warnings.map((warning) => (
								<li key={warning}>{warning}</li>
							))}
						</ul>
					) : (
						<p className="assembly-ok">
							Design clears the launch checks for this target.
						</p>
					)}

					<button
						type="button"
						className="assembly-launch"
						disabled={!stats.can_launch}
						onClick={beginLaunch}
					>
						Lock design &amp; launch
					</button>
					<button
						type="button"
						className="assembly-back"
						onClick={returnToMenu}
					>
						Return to menu
					</button>
				</aside>
			</div>
		</section>
	);
}
