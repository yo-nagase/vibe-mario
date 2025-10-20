import { Player } from './Player';
import { Level } from './Level';
import { InputHandler } from './InputHandler';
import { Physics } from './Physics';
import { GameState, PowerUpType } from './types';
import { PowerUp } from './PowerUp';
import { Collectible } from './Collectible';
import { Projectile } from './Projectile';
import { SoundManager } from './SoundManager';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: Player;
    private level: Level;
    private input: InputHandler;
    private gameState: GameState;
    private projectiles: Projectile[] = [];
    private soundManager: SoundManager;

    private cameraX: number = 0;
    private readonly CAMERA_OFFSET = 300;

    private lastTime: number = 0;
    private animationFrameId: number = 0;

    private isRunning: boolean = false;
    private isPaused: boolean = false;
    private wasDashing: boolean = false;

    // UI Elements
    private startScreen: HTMLElement;
    private gameOverScreen: HTMLElement;
    private gameOverTitle: HTMLElement;
    private finalScoreElement: HTMLElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        this.ctx = ctx;

        this.input = new InputHandler();
        this.player = new Player(50, 300);
        this.level = new Level(1);
        this.soundManager = new SoundManager();

        this.gameState = {
            score: 0,
            lives: 3,
            coins: 0,
            currentLevel: 1,
            isPowered: false,
            isInvincible: false,
        };

        // Get UI elements
        this.startScreen = document.getElementById('startScreen')!;
        this.gameOverScreen = document.getElementById('gameOverScreen')!;
        this.gameOverTitle = document.getElementById('gameOverTitle')!;
        this.finalScoreElement = document.getElementById('finalScore')!;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.getElementById('startButton')?.addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton')?.addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame(): void {
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    restartGame(): void {
        this.gameState = {
            score: 0,
            lives: 3,
            coins: 0,
            currentLevel: 1,
            isPowered: false,
            isInvincible: false,
        };
        this.level = new Level(1);
        this.player.reset(this.level.playerStartX, this.level.playerStartY);
        this.projectiles = [];
        this.cameraX = 0;
        this.startGame();
    }

    private gameLoop = (currentTime: number): void => {
        if (!this.isRunning) return;

        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        if (!this.isPaused) {
            this.update(deltaTime);
        }

        this.render();

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        // Handle input
        const jumpInfo = this.player.handleInput(this.input);
        if (jumpInfo.jumped) {
            if (jumpInfo.jumpNumber === 1) {
                this.soundManager.playJumpSound();
            } else if (jumpInfo.jumpNumber === 2) {
                this.soundManager.playDoubleJumpSound();
            } else if (jumpInfo.jumpNumber === 3) {
                this.soundManager.playTripleJumpSound();
            }
        }

        // Handle shooting
        const shootResult = this.player.handleShooting(this.input, deltaTime);
        if (shootResult.shoot) {
            this.createProjectile(shootResult.chargeLevel);
            this.soundManager.playShootSound();
        }

        // Play dash sound when starting super dash
        if (this.player.isSuperDash() && !this.wasDashing) {
            this.soundManager.playDashSound();
        }
        this.wasDashing = this.player.isSuperDash();

        // Store old position
        const oldX = this.player.x;
        const oldY = this.player.y;

        // Update player
        this.player.update(deltaTime);

        // Update level
        this.level.update(deltaTime);

        // Update projectiles
        this.projectiles.forEach(projectile => projectile.update(deltaTime));

        // Remove off-screen projectiles
        this.projectiles = this.projectiles.filter(
            p => !p.isDestroyed() && !p.isOffScreen(this.cameraX, this.canvas.width)
        );

        // Collision detection with improved handling
        this.handleCollisions(oldX, oldY);

        // Update camera
        this.updateCamera();

        // Check win condition
        if (this.player.x > this.level.goalX) {
            this.completeLevel();
        }

        // Check death
        if (this.player.y > this.canvas.height) {
            this.handlePlayerDeath();
        }

        // Update game state
        this.gameState.isPowered = this.player.getPowered();
        this.gameState.isInvincible = this.player.getInvincible();
    }

    private handleCollisions(oldX: number, oldY: number): void {
        const playerBox = this.player.getCollisionBox();
        let isGrounded = false;

        // Platform collisions with improved resolution
        this.level.platforms.forEach(platform => {
            const platformBox = platform.getCollisionBox();

            if (Physics.checkCollision(playerBox, platformBox)) {
                const overlap = Physics.getOverlap(playerBox, platformBox);

                // Determine collision direction based on previous position
                const wasAbove = oldY + this.player.height <= platformBox.y + 5;
                const wasBelow = oldY >= platformBox.y + platformBox.height - 5;
                const wasLeft = oldX + this.player.width <= platformBox.x + 5;
                const wasRight = oldX >= platformBox.x + platformBox.width - 5;

                // Resolve collision based on smallest overlap and previous position
                if (overlap.y < overlap.x) {
                    // Vertical collision
                    if (this.player.velocityY > 0 && wasAbove) {
                        // Landing on platform
                        this.player.y = platformBox.y - this.player.height;
                        this.player.velocityY = 0;
                        isGrounded = true;
                    } else if (this.player.velocityY < 0 && wasBelow) {
                        // Hitting head - check if question block
                        this.player.y = platformBox.y + platformBox.height;
                        this.player.velocityY = 0;

                        // Activate question block
                        if (platform.activate()) {
                            this.spawnItemFromBlock(platform.x + platform.width / 2, platform.y - 40);
                        }
                    }
                } else {
                    // Horizontal collision - push out and stop horizontal velocity
                    if (wasLeft || this.player.x < platformBox.x) {
                        this.player.x = platformBox.x - this.player.width - 0.1;
                        this.player.velocityX = 0;
                    } else if (wasRight || this.player.x > platformBox.x) {
                        this.player.x = platformBox.x + platformBox.width + 0.1;
                        this.player.velocityX = 0;
                    }
                }
            }
        });

        this.player.setGrounded(isGrounded);

        // Enemy collisions and ground check
        this.level.enemies.forEach(enemy => {
            if (enemy.getIsDead()) return;

            const enemyBox = enemy.getCollisionBox();

            // Enemy platform collision
            let enemyGrounded = false;
            this.level.platforms.forEach(platform => {
                const platformBox = platform.getCollisionBox();
                if (Physics.checkCollision(enemyBox, platformBox)) {
                    const overlap = Physics.getOverlap(enemyBox, platformBox);
                    if (overlap.y < overlap.x && enemy.velocityY > 0) {
                        enemy.y = platformBox.y - enemy.height;
                        enemyGrounded = true;
                    } else if (overlap.x < overlap.y) {
                        enemy.reverseDirection();
                    }
                }
            });
            enemy.setGrounded(enemyGrounded);

            // Player-Enemy collision
            if (Physics.checkCollision(playerBox, enemyBox)) {
                // Hammer can kill any enemy
                if (this.player.hasHammerPower()) {
                    enemy.kill();
                    this.gameState.score += 150;
                    this.soundManager.playEnemyDefeatSound();
                }
                // Check if player is jumping on enemy
                else if (this.player.velocityY > 0 && this.player.y < enemy.y && enemy.getCanBeStomped()) {
                    // Can stomp on this enemy
                    enemy.kill();
                    this.player.velocityY = -300;
                    this.gameState.score += 100;
                    this.soundManager.playEnemyDefeatSound();
                } else {
                    // Player takes damage (including spike enemies)
                    if (this.player.takeDamage()) {
                        this.handlePlayerDeath();
                    }
                }
            }
        });

        // Projectile-Enemy collisions
        this.projectiles.forEach(projectile => {
            if (projectile.isDestroyed()) return;

            const projectileBox = projectile.getCollisionBox();

            this.level.enemies.forEach(enemy => {
                if (enemy.getIsDead()) return;

                const enemyBox = enemy.getCollisionBox();
                if (Physics.checkCollision(projectileBox, enemyBox)) {
                    enemy.kill();
                    projectile.destroy();
                    this.gameState.score += projectile.getDamage();
                    this.soundManager.playEnemyDefeatSound();
                }
            });
        });

        // Collectible collisions
        this.level.collectibles.forEach(coin => {
            if (coin.isCollected()) return;

            if (Physics.checkCollision(playerBox, coin.getCollisionBox())) {
                coin.collect();
                this.gameState.coins += 1;
                this.gameState.score += coin.value;
                this.soundManager.playCoinSound();
            }
        });

        // PowerUp collisions
        this.level.powerUps.forEach(powerUp => {
            if (powerUp.isCollected()) return;

            // PowerUp platform collision
            let powerUpGrounded = false;
            this.level.platforms.forEach(platform => {
                const platformBox = platform.getCollisionBox();
                const powerUpBox = powerUp.getCollisionBox();
                if (Physics.checkCollision(powerUpBox, platformBox)) {
                    const overlap = Physics.getOverlap(powerUpBox, platformBox);
                    if (overlap.y < overlap.x && powerUp.velocityY > 0) {
                        powerUp.y = platformBox.y - powerUp.height;
                        powerUpGrounded = true;
                    } else if (overlap.x < overlap.y) {
                        powerUp.reverseDirection();
                    }
                }
            });
            powerUp.setGrounded(powerUpGrounded);

            // Player collision
            if (Physics.checkCollision(playerBox, powerUp.getCollisionBox())) {
                powerUp.collect();
                const type = powerUp.getType();

                if (type === 'mushroom') {
                    this.player.setPowered(true);
                    this.gameState.score += 500;
                    this.soundManager.playPowerUpSound();
                } else if (type === 'star') {
                    this.player.setInvincible(10);
                    this.gameState.score += 1000;
                    this.soundManager.playPowerUpSound();
                } else if (type === 'hammer') {
                    this.player.setHammer(15);
                    this.gameState.score += 750;
                    this.soundManager.playPowerUpSound();
                }
            }
        });
    }

    private createProjectile(chargeLevel: number): void {
        const direction = this.player.getFacingRight() ? 1 : -1;
        const offsetX = this.player.getFacingRight() ? this.player.width : 0;
        const projectile = new Projectile(
            this.player.x + offsetX,
            this.player.y + this.player.height / 2 - 6,
            direction,
            chargeLevel
        );
        this.projectiles.push(projectile);
    }

    private spawnItemFromBlock(x: number, y: number): void {
        // Randomly spawn coin, mushroom, or star
        const rand = Math.random();

        if (rand < 0.5) {
            // Spawn coin
            const coin = new Collectible(x - 12, y, 10);
            this.level.collectibles.push(coin);
        } else if (rand < 0.85) {
            // Spawn mushroom
            const mushroom = new PowerUp(x - 16, y, PowerUpType.MUSHROOM);
            this.level.powerUps.push(mushroom);
        } else {
            // Spawn star
            const star = new PowerUp(x - 16, y, PowerUpType.STAR);
            this.level.powerUps.push(star);
        }
    }

    private updateCamera(): void {
        // Follow player
        const targetX = this.player.x - this.CAMERA_OFFSET;
        this.cameraX = Math.max(0, Math.min(targetX, this.level.goalX + 200 - this.canvas.width));
    }

    private render(): void {
        // Clear canvas
        this.ctx.fillStyle = this.level.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context and apply camera transform
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // Render level
        this.level.render(this.ctx, this.cameraX);

        // Render player
        this.player.render(this.ctx);

        // Render projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));

        this.ctx.restore();

        // Render HUD
        this.renderHUD();
    }

    private renderHUD(): void {
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';

        // Score
        this.ctx.fillText(`Score: ${this.gameState.score}`, 20, 30);

        // Coins
        this.ctx.fillText(`Coins: ${this.gameState.coins}`, 20, 60);

        // Lives
        this.ctx.fillText(`Lives: ${this.gameState.lives}`, 20, 90);

        // Level
        this.ctx.fillText(`Level: ${this.gameState.currentLevel}`, this.canvas.width - 120, 30);

        // Power status
        if (this.gameState.isPowered) {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillText('POWERED', this.canvas.width - 150, 60);
        }

        if (this.gameState.isInvincible) {
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillText('INVINCIBLE', this.canvas.width - 180, 90);
        }
    }

    private handlePlayerDeath(): void {
        this.gameState.lives -= 1;

        if (this.gameState.lives > 0) {
            // Respawn
            this.player.reset(this.level.playerStartX, this.level.playerStartY);
            this.projectiles = [];
            this.cameraX = 0;
        } else {
            // Game over
            this.gameOver(false);
        }
    }

    private completeLevel(): void {
        this.gameState.score += 1000;
        this.gameState.currentLevel += 1;

        if (this.gameState.currentLevel <= 3) {
            // Load next level
            this.level = new Level(this.gameState.currentLevel);
            this.player.reset(this.level.playerStartX, this.level.playerStartY);
            this.projectiles = [];
            this.cameraX = 0;
        } else {
            // Game completed
            this.gameOver(true);
        }
    }

    private gameOver(won: boolean): void {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);

        this.gameOverTitle.textContent = won ? 'Victory!' : 'Game Over!';
        this.finalScoreElement.textContent = `Final Score: ${this.gameState.score}`;
        this.gameOverScreen.classList.remove('hidden');
    }
}
