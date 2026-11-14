import { useSyncExternalStore } from "react";

export type SandboxMode =
	| "earth"
	| "rocket"
	| "launch"
	| "orbit"
	| "cruise"
	| "landing";

let mode: SandboxMode = "earth";
const listeners = new Set<() => void>();

export function getSandboxMode(): SandboxMode {
	return mode;
}

export function subscribeSandboxMode(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function publishSandboxMode(next: SandboxMode): void {
	if (next === mode) return;
	mode = next;
	for (const listener of listeners) listener();
}

export function useSandboxMode(): SandboxMode {
	return useSyncExternalStore(
		subscribeSandboxMode,
		getSandboxMode,
		getSandboxMode,
	);
}
