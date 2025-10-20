import { TileType } from './types';

export class Platform {
    x: number;
    y: number;
    width: number;
    height: number;
    type: TileType;
    private isActivated: boolean = false;

    constructor(x: number, y: number, width: number, height: number, type: TileType = TileType.GROUND) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    activate(): boolean {
        if (this.type === TileType.QUESTION && !this.isActivated) {
            this.isActivated = true;
            return true;
        }
        return false;
    }

    isQuestionBlock(): boolean {
        return this.type === TileType.QUESTION;
    }

    getIsActivated(): boolean {
        return this.isActivated;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        switch (this.type) {
            case TileType.GROUND:
                // Brown ground block
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                // Add texture
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
                break;

            case TileType.BRICK:
                // Red brick block
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#922b21';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                // Brick pattern
                ctx.strokeStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width / 2, this.y + this.height);
                ctx.stroke();
                break;

            case TileType.QUESTION:
                // Yellow question block or gray if activated
                if (this.isActivated) {
                    ctx.fillStyle = '#95a5a6';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.strokeStyle = '#7f8c8d';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                } else {
                    ctx.fillStyle = '#f39c12';
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.strokeStyle = '#d68910';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                    // Question mark
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', this.x + this.width / 2, this.y + this.height / 2);
                }
                break;

            case TileType.PIPE:
                // Green pipe
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                // Pipe top
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(this.x - 4, this.y, this.width + 8, 8);
                // Pipe detail
                ctx.strokeStyle = '#229954';
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x + 8, this.y + 12, this.width - 16, this.height - 16);
                break;
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
}
