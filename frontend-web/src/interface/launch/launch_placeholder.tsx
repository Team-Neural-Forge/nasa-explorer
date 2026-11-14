import { STARTING_BUDGET_USD_M } from "../../state/economy";
import { useGameState } from "../../state/game_state";
import {
	computeRocketStats,
	formatDeltaV,
	formatMass,
} from "../../state/rocket_config";

export function LaunchPlaceholder() {
	const { selection, returnToAssembly, returnToMenu } = useGameState();
	const stats = computeRocketStats(selection, STARTING_BUDGET_USD_M);

	return (
		<section className="assembly-overlay" aria-label="Launch sequence">
			<header className="assembly-header">
				<p className="menu-eyebrow">Launch — Earth</p>
				<h2 className="assembly-title">Cleared for launch</h2>
				<p className="menu-tagline">
					The design is locked. The interactive ascent arrives in the next build
					step; for now, here is what the mission is carrying.
				</p>
			</header>

			<dl className="assembly-readouts">
				<div className="assembly-readout">
					<dt>Total mass</dt>
					<dd>{formatMass(stats.total_mass_kg)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Thrust-to-weight</dt>
					<dd>{stats.twr.toFixed(2)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Delta-v</dt>
					<dd>{formatDeltaV(stats.delta_v_m_s)}</dd>
				</div>
				<div className="assembly-readout">
					<dt>Instruments</dt>
					<dd>{selection.instrument_ids.length}</dd>
				</div>
			</dl>

			<button
				type="button"
				className="assembly-launch"
				onClick={returnToAssembly}
			>
				Back to assembly
			</button>
			<button type="button" className="assembly-back" onClick={returnToMenu}>
				Return to menu
			</button>
		</section>
	);
}
