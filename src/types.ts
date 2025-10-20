export interface Vector2 {
    x: number;
    y: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Entity extends Rectangle {
    velocityX: number;
    velocityY: number;
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    getCollisionBox(): Rectangle;
}

export enum TileType {
    EMPTY = 0,
    GROUND = 1,
    BRICK = 2,
    QUESTION = 3,
    PIPE = 4,
}

export enum PowerUpType {
    MUSHROOM = 'mushroom',
    STAR = 'star',
    HAMMER = 'hammer',
}

export enum EnemyType {
    GOOMBA = 'goomba',
    KOOPA = 'koopa',
    FLYING = 'flying',
    SPIKE = 'spike',
    FIRE = 'fire',
}

export interface GameState {
    score: number;
    lives: number;
    coins: number;
    currentLevel: number;
    isPowered: boolean;
    isInvincible: boolean;
}
