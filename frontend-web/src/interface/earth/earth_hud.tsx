import { useEffect, useState, useSyncExternalStore } from "react";
import {
	earth_input,
	getEarthLocation,
	subscribeEarthLocation,
} from "../../state/earth_interaction";
import { useGameState } from "../../state/game_state";

export function EarthHud() {
	const location = useSyncExternalStore(
		subscribeEarthLocation,
		getEarthLocation,
		getEarthLocation,
	);
	const { beginLaunch, returnToMenu } = useGameState();
	const [notice, set_notice] = useState("");
	useEffect(() => {
		function interact(event: KeyboardEvent) {
			if (
				event.code !== "KeyE" ||
				event.repeat ||
				event.target instanceof HTMLButtonElement
			)
				return;
			if (location === "rocket") beginLaunch();
			if (location === "store")
				set_notice("The Mission Store arrives in the next milestone.");
		}
		window.addEventListener("keydown", interact);
		return () => window.removeEventListener("keydown", interact);
	}, [beginLaunch, location]);
	useEffect(
		() => () => {
			earth_input.left = false;
			earth_input.right = false;
			earth_input.jump = false;
		},
		[],
	);
	return (
		<section className="earth-hud" aria-label="Earth surface controls">
			<div className="earth-hud-top">
				<span>EARTH · LAUNCH SITE</span>
				<button type="button" onClick={returnToMenu}>
					Menu
				</button>
			</div>
			<div className="earth-hud-bottom">
				<p>Move: A/D or ←/→ · Jump: Space/W/↑ · Interact: E</p>
				{location === "rocket" && (
					<button type="button" onClick={beginLaunch}>
						E · Launch starter rocket
					</button>
				)}
				{location === "store" && (
					<button
						type="button"
						onClick={() =>
							set_notice("The Mission Store arrives in the next milestone.")
						}
					>
						E · Mission Store
					</button>
				)}
				<p role="status">{notice}</p>
				<div className="earth-touch">
					{(
						[
							["left", "←"],
							["right", "→"],
							["jump", "Jump"],
						] as const
					).map(([key, label]) => (
						<button
							key={key}
							type="button"
							onPointerDown={(event) => {
								event.currentTarget.setPointerCapture(event.pointerId);
								earth_input[key] = true;
							}}
							onPointerUp={() => {
								earth_input[key] = false;
							}}
							onPointerCancel={() => {
								earth_input[key] = false;
							}}
							onLostPointerCapture={() => {
								earth_input[key] = false;
							}}
						>
							{label}
						</button>
					))}
				</div>
			</div>
		</section>
	);
}
