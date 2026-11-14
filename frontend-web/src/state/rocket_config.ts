import instrumentsJson from "../data/catalog/instruments.json";
import launchVehiclesJson from "../data/catalog/launch_vehicles.json";
import spacecraftJson from "../data/catalog/spacecraft.json";
import tuningJson from "../data/gameplay_tuning.json";
import { getBodyConstants } from "../engine/gravity_bodies";

const tuning = tuningJson;
const STANDARD_GRAVITY = 9.80665;
const SAFE_LIFTOFF_TWR = 1.05;

export type LaunchVehicleId = keyof typeof tuning.launch_vehicles;
export type SpacecraftId = keyof typeof tuning.spacecraft;
export type InstrumentId = keyof typeof tuning.instruments;

export type RocketSelection = {
	launch_vehicle_id: LaunchVehicleId;
	spacecraft_id: SpacecraftId;
	instrument_ids: InstrumentId[];
	destination_id: string;
};

export type LaunchVehicleOption = {
	id: LaunchVehicleId;
	name: string;
	vehicle_class: string;
	cost_usd_m: number;
	dry_mass_kg: number;
	propellant_kg: number;
	thrust_kn: number;
	isp_s: number;
	reliability: number;
};

export type SpacecraftOption = {
	id: SpacecraftId;
	name: string;
	operator: string;
	target: string;
	cost_usd_m: number;
	dry_mass_kg: number;
};

export type InstrumentOption = {
	id: InstrumentId;
	name: string;
	science_area: string;
	mass_kg: number;
	power_w: number;
	cost_usd_m: number;
};

export type DestinationOption = {
	id: string;
	name: string;
	required_delta_v_m_s: number;
	note: string;
};

export type LanderStats = {
	dry_mass_kg: number;
	propellant_kg: number;
	total_mass_kg: number;
	thrust_n: number;
	isp_s: number;
	twr_moon: number;
	delta_v_m_s: number;
};

export type RocketStats = {
	dry_mass_kg: number;
	propellant_kg: number;
	total_mass_kg: number;
	thrust_n: number;
	isp_s: number;
	twr: number;
	delta_v_m_s: number;
	required_delta_v_m_s: number;
	cost_usd_m: number;
	within_budget: boolean;
	can_launch: boolean;
	warnings: string[];
};

const launch_vehicle_catalog = new Map(
	launchVehiclesJson.vehicles.map((vehicle) => [vehicle.id, vehicle]),
);
const spacecraft_catalog = new Map(
	spacecraftJson.spacecraft.map((craft) => [craft.id, craft]),
);
const instrument_catalog = new Map(
	instrumentsJson.instruments.map((instrument) => [instrument.id, instrument]),
);

export const DEFAULT_SELECTION: RocketSelection = {
	launch_vehicle_id: "medium_lift",
	spacecraft_id: "orion",
	instrument_ids: [],
	destination_id: "low_earth_orbit",
};

export function getLaunchVehicleOptions(): LaunchVehicleOption[] {
	return (Object.keys(tuning.launch_vehicles) as LaunchVehicleId[]).map(
		(id) => {
			const stats = tuning.launch_vehicles[id];
			const catalog = launch_vehicle_catalog.get(id);
			return {
				id,
				name: catalog?.name ?? id,
				vehicle_class: catalog?.class ?? "unknown",
				cost_usd_m: stats.cost_usd_m,
				dry_mass_kg: stats.dry_mass_kg,
				propellant_kg: stats.propellant_kg,
				thrust_kn: stats.thrust_kn,
				isp_s: stats.isp_s,
				reliability: stats.reliability,
			};
		},
	);
}

export function getSpacecraftOptions(): SpacecraftOption[] {
	return (Object.keys(tuning.spacecraft) as SpacecraftId[]).map((id) => {
		const stats = tuning.spacecraft[id];
		const catalog = spacecraft_catalog.get(id);
		return {
			id,
			name: catalog?.name ?? id,
			operator: catalog?.operator ?? "unknown",
			target: catalog?.target ?? "unknown",
			cost_usd_m: stats.cost_usd_m,
			dry_mass_kg: stats.dry_mass_kg,
		};
	});
}

export function getInstrumentOptions(): InstrumentOption[] {
	return (Object.keys(tuning.instruments) as InstrumentId[]).map((id) => {
		const stats = tuning.instruments[id];
		const catalog = instrument_catalog.get(id);
		return {
			id,
			name: catalog?.name ?? id,
			science_area: catalog?.science_area ?? "unknown",
			mass_kg: stats.mass_kg,
			power_w: stats.power_w,
			cost_usd_m: stats.cost_usd_m,
		};
	});
}

export function getDestinationOptions(): DestinationOption[] {
	return [...tuning.destinations];
}

export function getLaunchVehicleOption(
	id: LaunchVehicleId,
): LaunchVehicleOption | undefined {
	return getLaunchVehicleOptions().find((option) => option.id === id);
}

export function computeRocketStats(
	selection: RocketSelection,
	budget_usd_m: number,
): RocketStats {
	const vehicle = tuning.launch_vehicles[selection.launch_vehicle_id];
	const spacecraft = tuning.spacecraft[selection.spacecraft_id];
	const instruments = selection.instrument_ids.map(
		(id) => tuning.instruments[id],
	);

	const instrument_mass_kg = instruments.reduce(
		(total, instrument) => total + instrument.mass_kg,
		0,
	);
	const instrument_cost_usd_m = instruments.reduce(
		(total, instrument) => total + instrument.cost_usd_m,
		0,
	);
	const instrument_power_w = instruments.reduce(
		(total, instrument) => total + instrument.power_w,
		0,
	);

	const dry_mass_kg =
		vehicle.dry_mass_kg + spacecraft.dry_mass_kg + instrument_mass_kg;
	const propellant_kg = vehicle.propellant_kg;
	const total_mass_kg = dry_mass_kg + propellant_kg;
	const thrust_n = vehicle.thrust_kn * 1000;
	const twr = thrust_n / (total_mass_kg * STANDARD_GRAVITY);
	const delta_v_m_s =
		vehicle.isp_s * STANDARD_GRAVITY * Math.log(total_mass_kg / dry_mass_kg);
	const cost_usd_m =
		vehicle.cost_usd_m + spacecraft.cost_usd_m + instrument_cost_usd_m;

	const destination = tuning.destinations.find(
		(option) => option.id === selection.destination_id,
	);
	const required_delta_v_m_s =
		destination?.required_delta_v_m_s ??
		tuning.destinations[0].required_delta_v_m_s;
	const within_budget = cost_usd_m <= budget_usd_m;

	const warnings: string[] = [];
	if (twr < SAFE_LIFTOFF_TWR) {
		warnings.push(
			`Thrust-to-weight is ${twr.toFixed(2)}; it must be above ${SAFE_LIFTOFF_TWR.toFixed(2)} to lift off.`,
		);
	}
	if (delta_v_m_s < required_delta_v_m_s) {
		warnings.push(
			`Available delta-v is ${formatDeltaV(delta_v_m_s)}, short of the ${formatDeltaV(required_delta_v_m_s)} needed for ${destination?.name ?? "the target"}.`,
		);
	}
	if (!within_budget) {
		warnings.push("This design is over budget.");
	}
	if (instrument_power_w > 0) {
		warnings.push(
			`Instruments draw ${instrument_power_w.toFixed(0)} W; power budgeting arrives with the mission systems build.`,
		);
	}

	return {
		dry_mass_kg,
		propellant_kg,
		total_mass_kg,
		thrust_n,
		isp_s: vehicle.isp_s,
		twr,
		delta_v_m_s,
		required_delta_v_m_s,
		cost_usd_m,
		within_budget,
		can_launch:
			twr >= SAFE_LIFTOFF_TWR &&
			delta_v_m_s >= required_delta_v_m_s &&
			within_budget,
		warnings,
	};
}

export function computeLanderStats(selection: RocketSelection): LanderStats {
	const stage = tuning.descent_stage;
	const spacecraft = tuning.spacecraft[selection.spacecraft_id];
	const instruments = selection.instrument_ids.map(
		(id) => tuning.instruments[id],
	);
	const instrument_mass_kg = instruments.reduce(
		(total, instrument) => total + instrument.mass_kg,
		0,
	);
	const dry_mass_kg =
		stage.dry_mass_kg + spacecraft.dry_mass_kg + instrument_mass_kg;
	const propellant_kg = stage.propellant_kg;
	const total_mass_kg = dry_mass_kg + propellant_kg;
	const thrust_n = stage.thrust_kn * 1000;
	const moon_gravity = getBodyConstants("moon").surface_gravity_m_s2;

	return {
		dry_mass_kg,
		propellant_kg,
		total_mass_kg,
		thrust_n,
		isp_s: stage.isp_s,
		twr_moon: thrust_n / (total_mass_kg * moon_gravity),
		delta_v_m_s:
			stage.isp_s * STANDARD_GRAVITY * Math.log(total_mass_kg / dry_mass_kg),
	};
}

export function formatMass(mass_kg: number): string {
	if (mass_kg >= 1000) {
		return `${(mass_kg / 1000).toFixed(1)} t`;
	}
	return `${mass_kg.toFixed(0)} kg`;
}

export function formatDeltaV(delta_v_m_s: number): string {
	return `${(delta_v_m_s / 1000).toFixed(1)} km/s`;
}
