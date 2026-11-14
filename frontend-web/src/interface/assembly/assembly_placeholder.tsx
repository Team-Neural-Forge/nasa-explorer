import { useGameState } from "../../state/game_state";

export function AssemblyPlaceholder() {
	const { returnToMenu } = useGameState();

	return (
		<section className="assembly-overlay" aria-label="Rocket assembly">
			<header className="menu-brand">
				<p className="menu-eyebrow">Mission assembly — Earth</p>
				<h2 className="assembly-title">Build your rocket</h2>
				<p className="menu-tagline">
					Assembly is the next build step. The menu handed off without a cut,
					and the mission world is still running underneath.
				</p>
			</header>

			<dl className="assembly-readouts">
				<div className="assembly-readout">
					<dt>Mass</dt>
					<dd>—</dd>
				</div>
				<div className="assembly-readout">
					<dt>Thrust-to-weight</dt>
					<dd>—</dd>
				</div>
				<div className="assembly-readout">
					<dt>Delta-v</dt>
					<dd>—</dd>
				</div>
				<div className="assembly-readout">
					<dt>Budget</dt>
					<dd>—</dd>
				</div>
			</dl>

			<button type="button" className="menu-option" onClick={returnToMenu}>
				Return to menu
			</button>
		</section>
	);
}
