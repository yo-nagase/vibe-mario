import { Platform } from './Platform';
import { Enemy } from './Enemy';
import { Collectible } from './Collectible';
import { PowerUp } from './PowerUp';
import { TileType, EnemyType, PowerUpType } from './types';

export interface LevelData {
    platforms: { x: number; y: number; width: number; height: number; type: TileType }[];
    enemies: { x: number; y: number; type: EnemyType }[];
    collectibles: { x: number; y: number; value: number }[];
    powerUps: { x: number; y: number; type: PowerUpType }[];
    playerStart: { x: number; y: number };
    goalX: number;
    background: string;
}

export class Level {
    platforms: Platform[] = [];
    enemies: Enemy[] = [];
    collectibles: Collectible[] = [];
    powerUps: PowerUp[] = [];
    playerStartX: number = 50;
    playerStartY: number = 300;
    goalX: number = 3500;
    background: string = '#5c94fc';
    levelNumber: number;

    constructor(levelNumber: number) {
        this.levelNumber = levelNumber;
        this.loadLevel(levelNumber);
    }

    private loadLevel(levelNumber: number): void {
        const levelData = this.getLevelData(levelNumber);

        this.platforms = levelData.platforms.map(
            p => new Platform(p.x, p.y, p.width, p.height, p.type)
        );

        this.enemies = levelData.enemies.map(
            e => new Enemy(e.x, e.y, e.type)
        );

        this.collectibles = levelData.collectibles.map(
            c => new Collectible(c.x, c.y, c.value)
        );

        this.powerUps = levelData.powerUps.map(
            p => new PowerUp(p.x, p.y, p.type)
        );

        this.playerStartX = levelData.playerStart.x;
        this.playerStartY = levelData.playerStart.y;
        this.goalX = levelData.goalX;
        this.background = levelData.background;
    }

    private getLevelData(levelNumber: number): LevelData {
        const levels: LevelData[] = [
            // Level 1 - Tutorial
            {
                playerStart: { x: 50, y: 300 },
                goalX: 2800,
                background: '#5c94fc',
                platforms: [
                    // Ground
                    { x: 0, y: 550, width: 800, height: 50, type: TileType.GROUND },
                    { x: 900, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 1400, y: 550, width: 600, height: 50, type: TileType.GROUND },
                    { x: 2100, y: 550, width: 800, height: 50, type: TileType.GROUND },

                    // Floating platforms
                    { x: 850, y: 450, width: 96, height: 32, type: TileType.BRICK },
                    { x: 1000, y: 350, width: 96, height: 32, type: TileType.BRICK },
                    { x: 1250, y: 450, width: 96, height: 32, type: TileType.BRICK },

                    // Question blocks
                    { x: 400, y: 400, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 1500, y: 400, width: 32, height: 32, type: TileType.QUESTION },

                    // Pipe
                    { x: 700, y: 486, width: 64, height: 64, type: TileType.PIPE },
                    { x: 1800, y: 454, width: 64, height: 96, type: TileType.PIPE },

                    // Stairs at end
                    { x: 2600, y: 518, width: 32, height: 32, type: TileType.GROUND },
                    { x: 2632, y: 486, width: 32, height: 64, type: TileType.GROUND },
                    { x: 2664, y: 454, width: 32, height: 96, type: TileType.GROUND },
                    { x: 2696, y: 422, width: 32, height: 128, type: TileType.GROUND },
                ],
                enemies: [
                    { x: 500, y: 500, type: EnemyType.GOOMBA },
                    { x: 800, y: 350, type: EnemyType.FLYING },
                    { x: 1100, y: 500, type: EnemyType.GOOMBA },
                    { x: 1600, y: 500, type: EnemyType.KOOPA },
                    { x: 2000, y: 500, type: EnemyType.FIRE },
                    { x: 2300, y: 500, type: EnemyType.GOOMBA },
                ],
                collectibles: [
                    { x: 300, y: 500, value: 10 },
                    { x: 450, y: 350, value: 10 },
                    { x: 850, y: 400, value: 10 },
                    { x: 1000, y: 300, value: 10 },
                    { x: 1250, y: 400, value: 10 },
                    { x: 1700, y: 500, value: 10 },
                    { x: 2000, y: 500, value: 10 },
                    { x: 2200, y: 500, value: 10 },
                ],
                powerUps: [
                    { x: 1500, y: 350, type: PowerUpType.MUSHROOM },
                    { x: 2000, y: 400, type: PowerUpType.HAMMER },
                    { x: 2400, y: 400, type: PowerUpType.STAR },
                ],
            },
            // Level 2 - Intermediate
            {
                playerStart: { x: 50, y: 300 },
                goalX: 3500,
                background: '#4a86e8',
                platforms: [
                    // Ground with gaps
                    { x: 0, y: 550, width: 600, height: 50, type: TileType.GROUND },
                    { x: 750, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 1300, y: 550, width: 300, height: 50, type: TileType.GROUND },
                    { x: 1750, y: 550, width: 500, height: 50, type: TileType.GROUND },
                    { x: 2400, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 2950, y: 550, width: 650, height: 50, type: TileType.GROUND },

                    // Elevated platforms
                    { x: 300, y: 400, width: 128, height: 32, type: TileType.BRICK },
                    { x: 600, y: 350, width: 96, height: 32, type: TileType.BRICK },
                    { x: 900, y: 400, width: 128, height: 32, type: TileType.BRICK },
                    { x: 1150, y: 450, width: 96, height: 32, type: TileType.BRICK },
                    { x: 1650, y: 400, width: 96, height: 32, type: TileType.BRICK },
                    { x: 2000, y: 350, width: 128, height: 32, type: TileType.BRICK },
                    { x: 2300, y: 450, width: 96, height: 32, type: TileType.BRICK },
                    { x: 2850, y: 400, width: 96, height: 32, type: TileType.BRICK },

                    // Question blocks
                    { x: 500, y: 350, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 1400, y: 400, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 2200, y: 350, width: 32, height: 32, type: TileType.QUESTION },

                    // Pipes
                    { x: 800, y: 486, width: 64, height: 64, type: TileType.PIPE },
                    { x: 1900, y: 454, width: 64, height: 96, type: TileType.PIPE },
                    { x: 2700, y: 422, width: 64, height: 128, type: TileType.PIPE },
                ],
                enemies: [
                    { x: 400, y: 500, type: EnemyType.GOOMBA },
                    { x: 700, y: 350, type: EnemyType.FLYING },
                    { x: 850, y: 500, type: EnemyType.KOOPA },
                    { x: 1000, y: 500, type: EnemyType.SPIKE },
                    { x: 1200, y: 400, type: EnemyType.FLYING },
                    { x: 1450, y: 500, type: EnemyType.FIRE },
                    { x: 1850, y: 500, type: EnemyType.KOOPA },
                    { x: 2100, y: 350, type: EnemyType.FLYING },
                    { x: 2500, y: 500, type: EnemyType.SPIKE },
                    { x: 2650, y: 500, type: EnemyType.KOOPA },
                    { x: 2900, y: 400, type: EnemyType.FLYING },
                    { x: 3100, y: 500, type: EnemyType.FIRE },
                ],
                collectibles: [
                    { x: 200, y: 500, value: 10 },
                    { x: 400, y: 500, value: 10 },
                    { x: 650, y: 300, value: 10 },
                    { x: 900, y: 350, value: 10 },
                    { x: 1200, y: 400, value: 10 },
                    { x: 1650, y: 350, value: 10 },
                    { x: 2000, y: 300, value: 10 },
                    { x: 2500, y: 500, value: 10 },
                    { x: 2850, y: 350, value: 10 },
                    { x: 3200, y: 500, value: 10 },
                ],
                powerUps: [
                    { x: 500, y: 300, type: PowerUpType.MUSHROOM },
                    { x: 1400, y: 350, type: PowerUpType.STAR },
                    { x: 1800, y: 350, type: PowerUpType.HAMMER },
                    { x: 2200, y: 300, type: PowerUpType.STAR },
                    { x: 2800, y: 400, type: PowerUpType.HAMMER },
                    { x: 3200, y: 400, type: PowerUpType.STAR },
                ],
            },
            // Level 3 - Advanced
            {
                playerStart: { x: 50, y: 300 },
                goalX: 4200,
                background: '#3d78d8',
                platforms: [
                    // Complex ground pattern
                    { x: 0, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 600, y: 550, width: 300, height: 50, type: TileType.GROUND },
                    { x: 1050, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 1600, y: 550, width: 300, height: 50, type: TileType.GROUND },
                    { x: 2050, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 2600, y: 550, width: 300, height: 50, type: TileType.GROUND },
                    { x: 3050, y: 550, width: 400, height: 50, type: TileType.GROUND },
                    { x: 3600, y: 550, width: 700, height: 50, type: TileType.GROUND },

                    // Multi-level platforms
                    { x: 200, y: 450, width: 96, height: 32, type: TileType.BRICK },
                    { x: 400, y: 350, width: 96, height: 32, type: TileType.BRICK },
                    { x: 700, y: 450, width: 128, height: 32, type: TileType.BRICK },
                    { x: 950, y: 400, width: 96, height: 32, type: TileType.BRICK },
                    { x: 1200, y: 350, width: 128, height: 32, type: TileType.BRICK },
                    { x: 1500, y: 450, width: 96, height: 32, type: TileType.BRICK },
                    { x: 1750, y: 400, width: 128, height: 32, type: TileType.BRICK },
                    { x: 2000, y: 300, width: 96, height: 32, type: TileType.BRICK },
                    { x: 2300, y: 450, width: 128, height: 32, type: TileType.BRICK },
                    { x: 2650, y: 400, width: 96, height: 32, type: TileType.BRICK },
                    { x: 2950, y: 350, width: 96, height: 32, type: TileType.BRICK },
                    { x: 3200, y: 450, width: 128, height: 32, type: TileType.BRICK },
                    { x: 3550, y: 400, width: 96, height: 32, type: TileType.BRICK },

                    // Question blocks
                    { x: 600, y: 400, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 1350, y: 300, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 2100, y: 250, width: 32, height: 32, type: TileType.QUESTION },
                    { x: 3000, y: 300, width: 32, height: 32, type: TileType.QUESTION },

                    // Pipes
                    { x: 500, y: 486, width: 64, height: 64, type: TileType.PIPE },
                    { x: 1100, y: 454, width: 64, height: 96, type: TileType.PIPE },
                    { x: 2200, y: 422, width: 64, height: 128, type: TileType.PIPE },
                    { x: 3400, y: 454, width: 64, height: 96, type: TileType.PIPE },
                ],
                enemies: [
                    { x: 300, y: 500, type: EnemyType.KOOPA },
                    { x: 500, y: 350, type: EnemyType.FLYING },
                    { x: 700, y: 500, type: EnemyType.SPIKE },
                    { x: 900, y: 500, type: EnemyType.KOOPA },
                    { x: 1100, y: 400, type: EnemyType.FLYING },
                    { x: 1200, y: 500, type: EnemyType.FIRE },
                    { x: 1400, y: 500, type: EnemyType.KOOPA },
                    { x: 1600, y: 350, type: EnemyType.FLYING },
                    { x: 1700, y: 500, type: EnemyType.SPIKE },
                    { x: 1950, y: 400, type: EnemyType.FLYING },
                    { x: 2100, y: 500, type: EnemyType.FIRE },
                    { x: 2400, y: 500, type: EnemyType.GOOMBA },
                    { x: 2600, y: 350, type: EnemyType.FLYING },
                    { x: 2700, y: 500, type: EnemyType.SPIKE },
                    { x: 3000, y: 400, type: EnemyType.FLYING },
                    { x: 3100, y: 500, type: EnemyType.FIRE },
                    { x: 3500, y: 500, type: EnemyType.KOOPA },
                    { x: 3700, y: 350, type: EnemyType.FLYING },
                    { x: 3800, y: 500, type: EnemyType.SPIKE },
                ],
                collectibles: [
                    { x: 250, y: 500, value: 10 },
                    { x: 450, y: 300, value: 10 },
                    { x: 750, y: 400, value: 10 },
                    { x: 1000, y: 350, value: 10 },
                    { x: 1250, y: 300, value: 10 },
                    { x: 1550, y: 400, value: 10 },
                    { x: 1800, y: 350, value: 10 },
                    { x: 2050, y: 250, value: 10 },
                    { x: 2350, y: 400, value: 10 },
                    { x: 2700, y: 350, value: 10 },
                    { x: 3000, y: 300, value: 10 },
                    { x: 3250, y: 400, value: 10 },
                    { x: 3850, y: 500, value: 10 },
                ],
                powerUps: [
                    { x: 600, y: 350, type: PowerUpType.MUSHROOM },
                    { x: 1350, y: 250, type: PowerUpType.STAR },
                    { x: 1800, y: 300, type: PowerUpType.HAMMER },
                    { x: 2100, y: 200, type: PowerUpType.STAR },
                    { x: 2600, y: 350, type: PowerUpType.HAMMER },
                    { x: 3000, y: 250, type: PowerUpType.MUSHROOM },
                    { x: 3400, y: 350, type: PowerUpType.HAMMER },
                    { x: 3600, y: 350, type: PowerUpType.STAR },
                ],
            },
        ];

        return levels[levelNumber - 1] || levels[0];
    }

    update(deltaTime: number): void {
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.collectibles.forEach(coin => coin.update(deltaTime));
        this.powerUps.forEach(powerUp => powerUp.update(deltaTime));
    }

    render(ctx: CanvasRenderingContext2D, cameraX: number): void {
        this.platforms.forEach(platform => platform.render(ctx));
        this.enemies.forEach(enemy => enemy.render(ctx));
        this.collectibles.forEach(coin => coin.render(ctx));
        this.powerUps.forEach(powerUp => powerUp.render(ctx));

        // Draw goal flag
        this.renderGoal(ctx);
    }

    private renderGoal(ctx: CanvasRenderingContext2D): void {
        // Flag pole
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.goalX, 400, 8, 150);

        // Flag
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(this.goalX + 8, 400);
        ctx.lineTo(this.goalX + 58, 420);
        ctx.lineTo(this.goalX + 8, 440);
        ctx.closePath();
        ctx.fill();

        // Pole top
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.goalX + 4, 395, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}
