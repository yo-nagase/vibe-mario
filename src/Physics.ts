import { Rectangle } from './types';

export class Physics {
    static readonly GRAVITY = 1200;
    static readonly MAX_FALL_SPEED = 800;
    static readonly FRICTION = 0.85;

    static checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    static getOverlap(rect1: Rectangle, rect2: Rectangle): { x: number; y: number } {
        const overlapX = Math.min(
            rect1.x + rect1.width - rect2.x,
            rect2.x + rect2.width - rect1.x
        );
        const overlapY = Math.min(
            rect1.y + rect1.height - rect2.y,
            rect2.y + rect2.height - rect1.y
        );
        return { x: overlapX, y: overlapY };
    }

    static applyGravity(velocityY: number, deltaTime: number): number {
        const newVelocity = velocityY + this.GRAVITY * deltaTime;
        return Math.min(newVelocity, this.MAX_FALL_SPEED);
    }
}
