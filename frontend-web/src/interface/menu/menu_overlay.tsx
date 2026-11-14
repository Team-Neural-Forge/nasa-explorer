import { useState } from "react";
import { useGameState } from "../../state/game_state";

const COMING_SOON = "Coming soon in a future build.";

export function MenuOverlay() {
	const { startOrResume, started } = useGameState();
	const [notice, set_notice] = useState<string | null>(null);

	return (
		<section className="menu-overlay" aria-label="Main menu">
			<header className="menu-brand">
				<p className="menu-eyebrow">NASA Space Apps Challenge 2026</p>
				<h1 className="menu-title">NASA Explorer</h1>
				<p className="menu-tagline">
					Assemble a rocket. Fly the solar system. Learn why it is hard.
				</p>
			</header>

			<nav className="menu-options" aria-label="Menu options">
				<button
					type="button"
					className="menu-option menu-option-primary"
					onClick={startOrResume}
				>
					{started ? "Resume" : "Start Game"}
				</button>
				<button
					type="button"
					className="menu-option"
					onClick={() => set_notice(COMING_SOON)}
				>
					Start Multiplayer
				</button>
				<button
					type="button"
					className="menu-option"
					onClick={() => set_notice(COMING_SOON)}
				>
					Login
				</button>
				<button
					type="button"
					className="menu-option"
					onClick={() => set_notice("Settings are not available yet.")}
				>
					Settings
				</button>
				<button
					type="button"
					className="menu-option"
					onClick={() =>
						set_notice(
							"Built by Team Neural Forge. NASA data sources and credits are documented in the project docs.",
						)
					}
				>
					Credits
				</button>
			</nav>

			<p className="menu-notice" role="status" aria-live="polite">
				{notice ?? ""}
			</p>

			<p className="menu-footnote">
				The world is already running behind this menu.
			</p>
		</section>
	);
}
