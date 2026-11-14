export type GameWorld = {
	update: (dt_seconds: number) => void;
	draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
};
