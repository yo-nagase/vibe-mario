import { PowerUpType } from './types';
import { Physics } from './Physics';

export class PowerUp {
    x: number;
    y: number;
    width: number = 32;
    height: number = 32;
    velocityX: number = 50;
    velocityY: number = 0;

    private type: PowerUpType;
    private collected: boolean = false;
    private animationFrame: number = 0;
    private animationTimer: number = 0;

    constructor(x: number, y: number, type: PowerUpType) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    update(deltaTime: number): void {
        if (this.collected) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.15) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }

        // Apply gravity
        this.velocityY = Physics.applyGravity(this.velocityY, deltaTime);

        // Move
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.collected) return;

        ctx.save();

        if (this.type === PowerUpType.MUSHROOM) {
            // Draw mushroom power-up
            ctx.fillStyle = '#e74c3c';
            // Cap
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + 12, 14, 0, Math.PI * 2);
            ctx.fill();

            // Spots
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y + 8, 4, 0, Math.PI * 2);
            ctx.arc(this.x + 22, this.y + 8, 4, 0, Math.PI * 2);
            ctx.fill();

            // Stem
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(this.x + 12, this.y + 16, 8, 12);
        } else if (this.type === PowerUpType.STAR) {
            // Draw star power-up
            ctx.fillStyle = '#f1c40f';
            this.drawStar(ctx, this.x + this.width / 2, this.y + this.height / 2, 5, 12, 6);

            // Add sparkle effect
            if (this.animationFrame === 0) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.x + 4, this.y + 4, 3, 3);
                ctx.fillRect(this.x + this.width - 7, this.y + this.height - 7, 3, 3);
            }
        } else if (this.type === PowerUpType.HAMMER) {
            // Draw hammer power-up
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            // Hammer handle
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(centerX - 2, centerY, 4, 16);

            // Hammer head
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(centerX - 10, centerY - 8, 20, 8);

            // Hammer head detail
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(centerX - 8, centerY - 6, 16, 4);

            // Shine effect
            ctx.fillStyle = '#fff';
            ctx.fillRect(centerX - 6, centerY - 7, 4, 2);

            // Rotating effect
            if (this.animationFrame === 0) {
                ctx.strokeStyle = 'rgba(149, 165, 166, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    getCollisionBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    collect(): void {
        this.collected = true;
    }

    isCollected(): boolean {
        return this.collected;
    }

    getType(): PowerUpType {
        return this.type;
    }

    setGrounded(grounded: boolean): void {
        if (grounded) {
            this.velocityY = 0;
        }
    }

    reverseDirection(): void {
        this.velocityX = -this.velocityX;
    }
}
