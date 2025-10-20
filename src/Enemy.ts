import { Entity, EnemyType } from './types';
import { Physics } from './Physics';

export class Enemy implements Entity {
    x: number;
    y: number;
    width: number = 32;
    height: number = 32;
    velocityX: number = -60;
    velocityY: number = 0;

    private type: EnemyType;
    private isDead: boolean = false;
    private animationFrame: number = 0;
    private animationTimer: number = 0;
    private flyingAmplitude: number = 30;
    private flyingSpeed: number = 2;
    private initialY: number;
    private canBeStomped: boolean = true;

    constructor(x: number, y: number, type: EnemyType = EnemyType.GOOMBA) {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.type = type;

        // Configure based on type
        if (type === EnemyType.FLYING) {
            this.velocityX = -80;
            this.velocityY = 0;
        } else if (type === EnemyType.SPIKE) {
            this.velocityX = -40;
            this.canBeStomped = false;
        } else if (type === EnemyType.FIRE) {
            this.velocityX = -70;
            this.width = 28;
            this.height = 28;
        }
    }

    update(deltaTime: number): void {
        if (this.isDead) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.2) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }

        // Flying enemy behavior
        if (this.type === EnemyType.FLYING) {
            this.y = this.initialY + Math.sin(this.animationFrame * this.flyingSpeed) * this.flyingAmplitude;
            this.x += this.velocityX * deltaTime;
        } else {
            // Apply gravity for ground enemies
            this.velocityY = Physics.applyGravity(this.velocityY, deltaTime);

            // Move
            this.x += this.velocityX * deltaTime;
            this.y += this.velocityY * deltaTime;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.isDead) return;

        ctx.save();

        if (this.type === EnemyType.GOOMBA) {
            // Draw Goomba (mushroom-like enemy)
            ctx.fillStyle = '#8B4513';
            // Body
            ctx.fillRect(this.x + 4, this.y + 12, this.width - 8, this.height - 12);
            // Head
            ctx.fillStyle = '#A0522D';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + 10, 12, 0, Math.PI * 2);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 8, this.y + 6, 6, 6);
            ctx.fillRect(this.x + 18, this.y + 6, 6, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + 10, this.y + 8, 3, 3);
            ctx.fillRect(this.x + 20, this.y + 8, 3, 3);
        } else if (this.type === EnemyType.KOOPA) {
            // Draw Koopa (turtle-like enemy)
            // Shell
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x + 2, this.y + 8, this.width - 4, this.height - 12);
            // Shell pattern
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(this.x + 6, this.y + 12, this.width - 12, 4);
            // Head
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(this.x + 8, this.y + this.height - 8, 16, 8);
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + 10, this.y + this.height - 6, 4, 4);
            ctx.fillRect(this.x + 18, this.y + this.height - 6, 4, 4);
        } else if (this.type === EnemyType.FLYING) {
            // Draw Flying enemy (bat/bird-like)
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            // Body
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            const wingFlap = Math.sin(this.animationFrame * 4) * 5;
            ctx.fillStyle = '#9b59b6';
            ctx.beginPath();
            ctx.ellipse(centerX - 8, centerY - 2 + wingFlap, 6, 8, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 8, centerY - 2 + wingFlap, 6, 8, 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(centerX - 3, centerY - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 3, centerY - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === EnemyType.SPIKE) {
            // Draw Spike enemy (dangerous hedgehog-like)
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            // Body
            ctx.fillStyle = '#34495e';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 4, 12, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Spikes
            ctx.fillStyle = '#e74c3c';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI;
                const spikeX = centerX + Math.cos(angle - Math.PI / 2) * 8;
                const spikeY = centerY + Math.sin(angle - Math.PI / 2) * 8;

                ctx.beginPath();
                ctx.moveTo(spikeX, spikeY);
                ctx.lineTo(spikeX - 4, spikeY - 8);
                ctx.lineTo(spikeX + 4, spikeY - 8);
                ctx.closePath();
                ctx.fill();
            }

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX - 4, centerY + 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 4, centerY + 2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === EnemyType.FIRE) {
            // Draw Fire enemy (flame-like)
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            // Flame effect
            const flamePhase = Math.sin(this.animationFrame * 6);

            // Outer flame
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 12);
            ctx.bezierCurveTo(
                centerX - 10, centerY - 8 + flamePhase * 2,
                centerX - 8, centerY + 8,
                centerX, centerY + 12
            );
            ctx.bezierCurveTo(
                centerX + 8, centerY + 8,
                centerX + 10, centerY - 8 + flamePhase * 2,
                centerX, centerY - 12
            );
            ctx.fill();

            // Middle flame
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 8);
            ctx.bezierCurveTo(
                centerX - 6, centerY - 4 + flamePhase,
                centerX - 5, centerY + 6,
                centerX, centerY + 8
            );
            ctx.bezierCurveTo(
                centerX + 5, centerY + 6,
                centerX + 6, centerY - 4 + flamePhase,
                centerX, centerY - 8
            );
            ctx.fill();

            // Inner flame
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 2, centerY - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    getCollisionBox(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    reverseDirection(): void {
        this.velocityX = -this.velocityX;
    }

    kill(): void {
        this.isDead = true;
    }

    getIsDead(): boolean {
        return this.isDead;
    }

    setGrounded(grounded: boolean): void {
        if (grounded && this.type !== EnemyType.FLYING) {
            this.velocityY = 0;
        }
    }

    getCanBeStomped(): boolean {
        return this.canBeStomped;
    }

    getType(): EnemyType {
        return this.type;
    }
}
