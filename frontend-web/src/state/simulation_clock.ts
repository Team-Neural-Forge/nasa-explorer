let simulation_time_ms = Date.now();

export function getSimulationTime(): number {
	return simulation_time_ms;
}

export function resetSimulationTime(): void {
	simulation_time_ms = Date.now();
}

export function advanceSimulationTime(seconds: number): void {
	if (Number.isFinite(seconds) && seconds > 0)
		simulation_time_ms += seconds * 1000;
}
