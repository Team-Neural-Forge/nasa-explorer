export type Vec2 = {
	x: number;
	y: number;
};

export function add(left: Vec2, right: Vec2): Vec2 {
	return { x: left.x + right.x, y: left.y + right.y };
}

export function subtract(left: Vec2, right: Vec2): Vec2 {
	return { x: left.x - right.x, y: left.y - right.y };
}

export function scale(vector: Vec2, factor: number): Vec2 {
	return { x: vector.x * factor, y: vector.y * factor };
}

export function length(vector: Vec2): number {
	return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vec2): Vec2 {
	const magnitude = length(vector);
	if (magnitude === 0) {
		return { x: 0, y: 0 };
	}
	return { x: vector.x / magnitude, y: vector.y / magnitude };
}
