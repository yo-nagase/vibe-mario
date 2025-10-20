export class Collectible {
    x: number;
    y: number;
    width: number = 24;
    height: number = 24;
    private collected: boolean = false;
    private animationFrame: number = 0;
    private animationTimer: number = 0;
    private floatOffset: number = 0;
    value: number = 10;

    constructor(x: number, y: number, value: number = 10) {
        this.x = x;
        this.y = y;
        this.value = value;
    }

    update(deltaTime: number): void {
        if (this.collected) return;

        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.1) {
            this.animationFrame += 1;
            this.animationTimer = 0;
        }

        // Float animation
        this.floatOffset = Math.sin(this.animationFrame * 0.2) * 3;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.collected) return;

        ctx.save();

        const renderY = this.y + this.floatOffset;

        // Draw coin
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, renderY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner circle
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, renderY + this.height / 2, this.width / 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw shine
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + this.width / 2 - 2, renderY + 6, 4, 4);

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

    collect(): void {
        this.collected = true;
    }

    isCollected(): boolean {
        return this.collected;
    }
}
