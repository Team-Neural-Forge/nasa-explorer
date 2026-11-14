import { getTransferLeg } from "../lib/nasa";
import { TIME_WARP_FACTORS, type TimeWarpFactor } from "./time_warp";

const DEFAULT_WARP_INDEX = 4;
const SECONDS_PER_DAY = 86_400;
const FALLBACK_DISTANCE_KM = 384_400;
const FALLBACK_TRANSFER_DAYS = 3;

export type CruiseStatus = "cruising" | "arrived";

export type CruiseSnapshot = {
	progress: number;
	distance_total_m: number;
	distance_remaining_m: number;
	eta_seconds: number;
	speed_m_s: number;
	warp: TimeWarpFactor;
	status: CruiseStatus;
	message: string;
};

export class CruiseSimulation {
	private readonly distance_total_m: number;
	private readonly travel_seconds: number;
	private readonly average_speed_m_s: number;

	private traveled_m = 0;
	private warp_index = DEFAULT_WARP_INDEX;
	private status: CruiseStatus = "cruising";

	constructor() {
		const leg = getTransferLeg("earth_moon");
		const distance_km = leg?.distance_km ?? FALLBACK_DISTANCE_KM;
		const transfer_days = leg?.transfer_days ?? FALLBACK_TRANSFER_DAYS;
		this.distance_total_m = distance_km * 1000;
		this.travel_seconds = transfer_days * SECONDS_PER_DAY;
		this.average_speed_m_s = this.distance_total_m / this.travel_seconds;
	}

	get warp(): TimeWarpFactor {
		return TIME_WARP_FACTORS[this.warp_index];
	}

	get total_distance_m(): number {
		return this.distance_total_m;
	}

	increase_warp(): void {
		this.warp_index = Math.min(
			this.warp_index + 1,
			TIME_WARP_FACTORS.length - 1,
		);
	}

	decrease_warp(): void {
		this.warp_index = Math.max(this.warp_index - 1, 0);
	}

	set_warp_index(index: number): void {
		this.warp_index = Math.max(
			0,
			Math.min(TIME_WARP_FACTORS.length - 1, index),
		);
	}

	update(dt_seconds: number): void {
		if (this.status === "arrived") {
			return;
		}
		this.traveled_m = Math.min(
			this.distance_total_m,
			this.traveled_m + this.average_speed_m_s * dt_seconds * this.warp,
		);
		if (this.traveled_m >= this.distance_total_m) {
			this.status = "arrived";
		}
	}

	snapshot(): CruiseSnapshot {
		const progress = this.traveled_m / this.distance_total_m;
		const distance_remaining_m = this.distance_total_m - this.traveled_m;
		return {
			progress: Math.max(0, Math.min(1, progress)),
			distance_total_m: this.distance_total_m,
			distance_remaining_m,
			eta_seconds: distance_remaining_m / this.average_speed_m_s,
			speed_m_s: this.average_speed_m_s,
			warp: this.warp,
			status: this.status,
			message:
				this.status === "arrived"
					? "Arrived at the Moon. Lunar approach and landing arrive in the next build step."
					: `Cruising to the Moon. Time warp ×${this.warp.toLocaleString("en-US")}.`,
		};
	}
}
