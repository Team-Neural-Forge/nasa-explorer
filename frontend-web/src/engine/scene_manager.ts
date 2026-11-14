export type SceneId = "menu" | "assembly";

const ALLOWED_TRANSITIONS: Record<SceneId, SceneId[]> = {
	menu: ["assembly"],
	assembly: ["menu"],
};

export function canTransition(from: SceneId, to: SceneId): boolean {
	return ALLOWED_TRANSITIONS[from].includes(to);
}

export function transitionScene(from: SceneId, to: SceneId): SceneId {
	if (!canTransition(from, to)) {
		throw new Error(`Invalid scene transition: ${from} -> ${to}`);
	}
	return to;
}
