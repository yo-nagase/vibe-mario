export class Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    private chargeLevel: number; // 0=normal, 1-3=charged levels
    private destroyed: boolean = false;
    private animationFrame: number = 0;
    private animationTimer: number = 0;

    constructor(x: number, y: number, direction: number, chargeLevel: number) {
        this.x = x;
        this.y = y;
        this.chargeLevel = chargeLevel;

        // Size and speed based on charge level
        if (chargeLevel === 3) {
            this.width = 40;
            this.height = 40;
            this.velocityX = direction * 600;
        } else if (chargeLevel === 2) {
            this.width = 28;
            this.height = 28;
            this.velocityX = direction * 550;
        } else if (chargeLevel === 1) {
            this.width = 18;
            this.height = 18;
            this.velocityX = direction * 450;
        } else {
            this.width = 12;
            this.height = 12;
            this.velocityX = direction * 350;
        }
    }

    update(deltaTime: number): void {
        if (this.destroyed) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.05) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        this.x += this.velocityX * deltaTime;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.destroyed) return;

        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.chargeLevel === 3) {
            // Max charge - rainbow explosion effect
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width / 2);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, '#8A2BE2');
            gradient.addColorStop(1, '#FF1493');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Outer glow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
            ctx.fill();

            // Rotating sparkles
            for (let i = 0; i < 8; i++) {
                const angle = (this.animationFrame + i) * (Math.PI / 4);
                const sparkX = centerX + Math.cos(angle) * this.width * 0.4;
                const sparkY = centerY + Math.sin(angle) * this.width * 0.4;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.chargeLevel === 2) {
            // Level 2 - blue energy ball
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            ctx.fillStyle = '#5dade2';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
            ctx.fill();

            // Inner core
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 6, 0, Math.PI * 2);
            ctx.fill();

            // Sparkles
            for (let i = 0; i < 4; i++) {
                const angle = (this.animationFrame + i) * (Math.PI / 2);
                const sparkX = centerX + Math.cos(angle) * this.width * 0.35;
                const sparkY = centerY + Math.sin(angle) * this.width * 0.35;
                ctx.fillStyle = '#fff';
                ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
            }
        } else if (this.chargeLevel === 1) {
            // Level 1 - green energy
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Glow
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal shot - red
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Inner circle
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 4, 0, Math.PI * 2);
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

    destroy(): void {
        this.destroyed = true;
    }

    isDestroyed(): boolean {
        return this.destroyed;
    }

    getChargeLevel(): number {
        return this.chargeLevel;
    }

    getDamage(): number {
        // Damage based on charge level
        if (this.chargeLevel === 3) return 300;
        if (this.chargeLevel === 2) return 200;
        if (this.chargeLevel === 1) return 150;
        return 100;
    }

    isOffScreen(cameraX: number, screenWidth: number): boolean {
        return this.x < cameraX - 50 || this.x > cameraX + screenWidth + 50;
    }
}
