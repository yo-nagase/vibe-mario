import { Entity } from './types';
import { Physics } from './Physics';
import { InputHandler } from './InputHandler';

export class Player implements Entity {
    x: number;
    y: number;
    width: number = 32;
    height: number = 32;
    velocityX: number = 0;
    velocityY: number = 0;

    private readonly MOVE_SPEED = 250;
    private readonly SUPER_DASH_SPEED = 450;
    private readonly JUMP_FORCE = -500;
    private readonly DOUBLE_JUMP_FORCE = -450;
    private readonly MAX_SPEED = 300;
    private readonly SUPER_DASH_MAX_SPEED = 500;
    private readonly SUPER_DASH_TIME = 3.0;

    private isGrounded: boolean = false;
    private isPowered: boolean = false;
    private isInvincible: boolean = false;
    private invincibleTimer: number = 0;
    private hasHammer: boolean = false;
    private hammerTimer: number = 0;
    private facingRight: boolean = true;
    private animationFrame: number = 0;
    private animationTimer: number = 0;
    private jumpCount: number = 0;
    private readonly MAX_JUMPS = 3;
    private jumpKeyWasPressed: boolean = false;
    private runTimer: number = 0;
    private lastRunDirection: number = 0;
    private isSuperDashing: boolean = false;
    private chargeTime: number = 0;
    private isCharging: boolean = false;
    private shootCooldown: number = 0;
    private readonly SHOOT_COOLDOWN = 0.3;
    private readonly CHARGE_LEVEL_1 = 0.5;  // Small charged shot
    private readonly CHARGE_LEVEL_2 = 1.5;  // Medium charged shot
    private readonly CHARGE_LEVEL_3 = 2.5;  // Maximum charged shot

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update(deltaTime: number): void {
        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.1) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        if (this.isInvincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }

        if (this.hasHammer) {
            this.hammerTimer -= deltaTime;
            if (this.hammerTimer <= 0) {
                this.hasHammer = false;
            }
        }

        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        // Apply gravity
        this.velocityY = Physics.applyGravity(this.velocityY, deltaTime);

        // Apply friction
        this.velocityX *= Physics.FRICTION;

        // Update position
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    handleInput(input: InputHandler): { jumped: boolean; jumpNumber: number } {
        // Horizontal movement
        let currentDirection = 0;
        const baseSpeed = this.isSuperDashing ? this.SUPER_DASH_SPEED : this.MOVE_SPEED;
        const maxSpeed = this.isSuperDashing ? this.SUPER_DASH_MAX_SPEED : this.MAX_SPEED;

        if (input.isLeft()) {
            this.velocityX = -baseSpeed;
            this.facingRight = false;
            currentDirection = -1;
        } else if (input.isRight()) {
            this.velocityX = baseSpeed;
            this.facingRight = true;
            currentDirection = 1;
        }

        // Clamp velocity
        this.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, this.velocityX));

        // Jumping with triple jump support
        const jumpPressed = input.isJump();
        let jumpedThisFrame = false;
        let jumpNumber = 0;

        if (jumpPressed && !this.jumpKeyWasPressed) {
            // Jump key just pressed
            if (this.isGrounded) {
                // First jump
                this.velocityY = this.JUMP_FORCE;
                this.isGrounded = false;
                this.jumpCount = 1;
                jumpedThisFrame = true;
                jumpNumber = 1;
            } else if (this.jumpCount < this.MAX_JUMPS) {
                // Additional jumps (2nd and 3rd)
                this.velocityY = this.DOUBLE_JUMP_FORCE;
                this.jumpCount++;
                jumpedThisFrame = true;
                jumpNumber = this.jumpCount;
            }
        }

        this.jumpKeyWasPressed = jumpPressed;

        // Update run timer for super dash
        if (currentDirection !== 0 && currentDirection === this.lastRunDirection && this.isGrounded) {
            this.runTimer += 0.016; // Approximate deltaTime
            if (this.runTimer >= this.SUPER_DASH_TIME) {
                this.isSuperDashing = true;
            }
        } else {
            this.runTimer = 0;
            this.isSuperDashing = false;
        }
        this.lastRunDirection = currentDirection;

        // Return jump info for sound
        return { jumped: jumpedThisFrame, jumpNumber };
    }

    handleShooting(input: InputHandler, deltaTime: number): { shoot: boolean; chargeLevel: number } {
        const shootPressed = input.isShoot();

        if (shootPressed) {
            if (!this.isCharging && this.shootCooldown <= 0) {
                this.isCharging = true;
                this.chargeTime = 0;
            }

            if (this.isCharging) {
                this.chargeTime += deltaTime;
            }
        } else {
            // Released shoot button
            if (this.isCharging && this.shootCooldown <= 0) {
                this.isCharging = false;
                const chargeLevel = this.getChargeLevel();
                this.chargeTime = 0;
                this.shootCooldown = this.SHOOT_COOLDOWN;
                return { shoot: true, chargeLevel };
            }
            this.isCharging = false;
            this.chargeTime = 0;
        }

        return { shoot: false, chargeLevel: 0 };
    }

    getChargeLevel(): number {
        // Returns 0, 1, 2, or 3 based on charge time
        if (this.chargeTime < this.CHARGE_LEVEL_1) {
            return 0; // Normal shot
        } else if (this.chargeTime < this.CHARGE_LEVEL_2) {
            return 1; // Level 1 charged
        } else if (this.chargeTime < this.CHARGE_LEVEL_3) {
            return 2; // Level 2 charged
        } else {
            return 3; // Level 3 max charged
        }
    }

    getChargeProgress(): number {
        // Returns 0-1 for visual effects
        return Math.min(this.chargeTime / this.CHARGE_LEVEL_3, 1.0);
    }

    isChargingShot(): boolean {
        return this.isCharging;
    }

    getFacingRight(): boolean {
        return this.facingRight;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        // Flicker when invincible
        if (this.isInvincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const scale = this.isPowered ? 1.2 : 1.0;

        // Walking animation offset
        const walkCycle = Math.abs(this.velocityX) > 10 ? Math.sin(this.animationFrame) * 2 : 0;
        const isJumping = !this.isGrounded;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height, this.width * 0.4, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        const legColor = '#2c3e50';
        const legY = this.y + this.height - 14 * scale;

        if (!isJumping) {
            // Left leg
            ctx.fillStyle = legColor;
            ctx.beginPath();
            ctx.ellipse(centerX - 6, legY + walkCycle, 4 * scale, 8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Right leg
            ctx.beginPath();
            ctx.ellipse(centerX + 6, legY - walkCycle, 4 * scale, 8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Jumping pose - legs together
            ctx.fillStyle = legColor;
            ctx.beginPath();
            ctx.ellipse(centerX - 4, legY, 4 * scale, 10 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 4, legY, 4 * scale, 10 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Body
        const bodyColor = this.isPowered ? '#ff6b6b' : '#e74c3c';
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body shading
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 4, 10 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Arms
        const armColor = bodyColor;
        const armY = centerY;

        if (!isJumping) {
            // Left arm (back)
            ctx.fillStyle = armColor;
            ctx.beginPath();
            ctx.ellipse(centerX - 12 * scale, armY + Math.sin(this.animationFrame * 2) * 3, 4 * scale, 10 * scale, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // Right arm (front)
            ctx.beginPath();
            ctx.ellipse(centerX + 12 * scale, armY - Math.sin(this.animationFrame * 2) * 3, 4 * scale, 10 * scale, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Draw hammer if player has it
            if (this.hasHammer) {
                const hammerX = centerX + (this.facingRight ? 18 : -18) * scale;
                const hammerY = armY + 8;
                const swingAngle = Math.sin(this.animationFrame * 3) * 0.5;

                ctx.save();
                ctx.translate(hammerX, hammerY);
                ctx.rotate(swingAngle);

                // Handle
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-2, -8, 4, 16);

                // Head
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(-8, -16, 16, 8);

                // Shine
                ctx.fillStyle = '#fff';
                ctx.fillRect(-6, -15, 4, 2);

                ctx.restore();
            }
        } else {
            // Jumping pose - arms up
            ctx.fillStyle = armColor;
            ctx.beginPath();
            ctx.ellipse(centerX - 14 * scale, armY - 8, 4 * scale, 10 * scale, -0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 14 * scale, armY - 8, 4 * scale, 10 * scale, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Head
        const headColor = '#f0c78a';
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 12 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Cap
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 10 * scale, 11 * scale, Math.PI, Math.PI * 2);
        ctx.fill();

        // Cap brim
        ctx.fillStyle = '#922b21';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 12 * scale, 12 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeOffsetX = this.facingRight ? 3 : -3;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX - 3, this.y + 12 * scale, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX + 3, this.y + 12 * scale, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX - 3 + (this.facingRight ? 1 : -1), this.y + 12 * scale, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX + 3 + (this.facingRight ? 1 : -1), this.y + 12 * scale, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#e6a86a';
        ctx.beginPath();
        ctx.arc(centerX + (this.facingRight ? 6 : -6), this.y + 14 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (smile)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX + (this.facingRight ? 2 : -2), this.y + 16 * scale, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Super dash effect
        if (this.isSuperDashing) {
            // Speed lines
            ctx.strokeStyle = 'rgba(255, 200, 0, 0.6)';
            ctx.lineWidth = 3;
            const direction = this.facingRight ? -1 : 1;
            for (let i = 0; i < 5; i++) {
                const offset = i * 10 + (this.animationFrame * 5) % 10;
                ctx.beginPath();
                ctx.moveTo(centerX + direction * (20 + offset), centerY - 10 + i * 5);
                ctx.lineTo(centerX + direction * (40 + offset), centerY - 10 + i * 5);
                ctx.stroke();
            }

            // Glow around player
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width);
            gradient.addColorStop(0, 'rgba(255, 200, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
            ctx.fill();
        }

        // Charging indicator
        if (this.isCharging) {
            const chargeLevel = this.getChargeLevel();
            const chargeProgress = this.getChargeProgress();
            const radius = this.width * (0.8 + chargeProgress * 0.8);
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

            // Color based on charge level
            if (chargeLevel === 3) {
                // Max charge - rainbow effect
                gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 20, 147, 0)');
            } else if (chargeLevel === 2) {
                // Level 2 - blue
                gradient.addColorStop(0, 'rgba(52, 152, 219, 0.7)');
                gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.4)');
                gradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
            } else if (chargeLevel === 1) {
                // Level 1 - green
                gradient.addColorStop(0, 'rgba(46, 204, 113, 0.6)');
                gradient.addColorStop(0.5, 'rgba(46, 204, 113, 0.3)');
                gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
            } else {
                // Normal - orange
                gradient.addColorStop(0, 'rgba(230, 126, 34, 0.5)');
                gradient.addColorStop(0.5, 'rgba(230, 126, 34, 0.25)');
                gradient.addColorStop(1, 'rgba(230, 126, 34, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Sparkles for charged levels
            if (chargeLevel >= 1) {
                ctx.fillStyle = '#fff';
                const numSparkles = chargeLevel * 2;
                for (let i = 0; i < numSparkles; i++) {
                    const angle = (this.animationFrame + i * (Math.PI * 2 / numSparkles)) * 2;
                    const sparkDist = this.width * (0.6 + chargeLevel * 0.2);
                    const sparkX = centerX + Math.cos(angle) * sparkDist;
                    const sparkY = centerY + Math.sin(angle) * sparkDist;
                    const sparkSize = chargeLevel >= 3 ? 3 : 2;
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
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

    setGrounded(grounded: boolean): void {
        this.isGrounded = grounded;
        if (grounded) {
            this.jumpCount = 0;
        }
    }

    setPowered(powered: boolean): void {
        this.isPowered = powered;
        this.height = powered ? 48 : 32;
    }

    setInvincible(duration: number): void {
        this.isInvincible = true;
        this.invincibleTimer = duration;
    }

    getInvincible(): boolean {
        return this.isInvincible;
    }

    getPowered(): boolean {
        return this.isPowered;
    }

    takeDamage(): boolean {
        if (this.isInvincible) return false;

        if (this.isPowered) {
            this.setPowered(false);
            this.setInvincible(2);
            return false;
        }
        return true; // Player dies
    }

    reset(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isPowered = false;
        this.isInvincible = false;
        this.height = 32;
        this.jumpCount = 0;
        this.jumpKeyWasPressed = false;
        this.runTimer = 0;
        this.lastRunDirection = 0;
        this.isSuperDashing = false;
    }

    isSuperDash(): boolean {
        return this.isSuperDashing;
    }

    setHammer(duration: number): void {
        this.hasHammer = true;
        this.hammerTimer = duration;
    }

    hasHammerPower(): boolean {
        return this.hasHammer;
    }
}
