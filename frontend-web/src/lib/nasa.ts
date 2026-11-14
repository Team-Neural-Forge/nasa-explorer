import bodiesJson from "../data/bodies.json";
import instrumentsJson from "../data/catalog/instruments.json";
import launchVehiclesJson from "../data/catalog/launch_vehicles.json";
import spacecraftJson from "../data/catalog/spacecraft.json";
import creditsJson from "../data/credits.json";
import quizzesJson from "../data/quizzes.json";
import transferLegsJson from "../data/transfer_legs.json";

const bodies = bodiesJson.bodies;
const quizzes = quizzesJson.quizzes;
const transferLegs = transferLegsJson.legs;
const launchVehicles = launchVehiclesJson.vehicles;
const instruments = instrumentsJson.instruments;
const spacecraft = spacecraftJson.spacecraft;
const imageCredits = creditsJson.images;

export type BodyId = keyof typeof bodies;
export type Body = (typeof bodies)[BodyId];
export type Quiz = (typeof quizzes)[number];
export type TransferLeg = (typeof transferLegs)[number];
export type LaunchVehicle = (typeof launchVehicles)[number];
export type Instrument = (typeof instruments)[number];
export type Spacecraft = (typeof spacecraft)[number];
export type ImageCredit = (typeof imageCredits)[number];

export function getBodies(): Body[] {
	return Object.values(bodies);
}

export function getBody(id: BodyId): Body {
	return bodies[id];
}

export function getQuizzes(): Quiz[] {
	return quizzes;
}

export function getQuiz(stage: string): Quiz | undefined {
	return quizzes.find((quiz) => quiz.stage === stage);
}

export function getTransferLegs(): TransferLeg[] {
	return transferLegs;
}

export function getTransferLeg(id: string): TransferLeg | undefined {
	return transferLegs.find((leg) => leg.id === id);
}

export function getLaunchVehicles(): LaunchVehicle[] {
	return launchVehicles;
}

export function getInstruments(): Instrument[] {
	return instruments;
}

export function getSpacecraft(): Spacecraft[] {
	return spacecraft;
}

export function getImageCredits(): ImageCredit[] {
	return imageCredits;
}

export function getImageCredit(id: string): ImageCredit | undefined {
	return imageCredits.find((image) => image.id === id);
}

/**
 * Real-surface-gravity helper for mechanics. Pass a `scale` to make movement
 * playable while keeping the underlying NASA value intact.
 */
export function scaledGravity(id: BodyId, scale = 1): number {
	return getBody(id).gravity_m_s2 * scale;
}
