import { useEffect, useState, useSyncExternalStore } from "react";
import {
	earth_input,
	getEarthLocation,
	getEarthWarning,
	subscribeEarthLocation,
	subscribeEarthWarning,
} from "../../state/earth_interaction";
import {
	getEarthStoreIndicator,
	subscribeEarthStoreIndicator,
} from "../../state/earth_navigation";
import { ASTRONAUT_MASS_KG } from "../../state/earth_scene";
import { useGameState } from "../../state/game_state";
import { sandbox_actions } from "../../state/sandbox_actions";

export function EarthHud() {
	const location = useSyncExternalStore(
		subscribeEarthLocation,
		getEarthLocation,
		getEarthLocation,
	);
	const warning = useSyncExternalStore(
		subscribeEarthWarning,
		getEarthWarning,
		getEarthWarning,
	);
	const store_indicator = useSyncExternalStore(
		subscribeEarthStoreIndicator,
		getEarthStoreIndicator,
		getEarthStoreIndicator,
	);
	const { openMenu } = useGameState();
	const [notice, set_notice] = useState("");
	useEffect(() => {
		function interact(event: KeyboardEvent) {
			if (
				event.code !== "KeyE" ||
				event.repeat ||
				event.target instanceof HTMLButtonElement
			)
				return;
			if (location === "rocket") sandbox_actions.current?.enter_rocket();
			if (location === "store")
				set_notice("The Mission Store arrives in the next milestone.");
		}
		window.addEventListener("keydown", interact);
		return () => window.removeEventListener("keydown", interact);
	}, [location]);
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
				<button type="button" onClick={openMenu}>
					Menu
				</button>
			</div>
			{store_indicator.visible ? (
				<div
					className={`earth-store-arrow earth-store-arrow-${store_indicator.direction}`}
					role="status"
				>
					<span className="earth-store-arrow-label">
						Mission Store · {Math.round(store_indicator.distance_m)} m
					</span>
					<span className="earth-store-arrow-icon" aria-hidden="true">
						{store_indicator.direction === "right" ? "→" : "←"}
					</span>
				</div>
			) : null}
			{warning ? (
				<div className="earth-warning" role="alert">
					Edge of the launch site — turn back.
				</div>
			) : null}
			<div className="earth-hud-bottom">
				<p>
					Move: A/D or ←/→ · Jump: Space/W/↑ · Interact: E · Astronaut:{" "}
					{ASTRONAUT_MASS_KG} kg
				</p>
				{location === "rocket" && (
					<button
						type="button"
						onClick={() => sandbox_actions.current?.enter_rocket()}
					>
						E · Enter rocket
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
