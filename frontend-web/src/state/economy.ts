import tuningJson from "../data/gameplay_tuning.json";

export const STARTING_BUDGET_USD_M = tuningJson.economy.starting_budget_usd_m;
export const BUDGET_ACCRUAL_USD_M_PER_MINUTE =
	tuningJson.economy.accrual_usd_m_per_minute;

export function formatBudget(value_usd_m: number): string {
	return `$${value_usd_m.toFixed(0)}M`;
}
