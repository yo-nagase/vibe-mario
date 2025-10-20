# Super Platform Adventure

A full-featured Mario-like platformer game built with TypeScript and HTML5 Canvas.

## Features

- **Player Controls**: Smooth movement and jumping mechanics
- **Physics System**: Realistic gravity and collision detection
- **Enemies**: Two types of enemies (Goombas and Koopas) with AI
- **Collectibles**: Coins to collect for points
- **Power-ups**:
  - Mushroom: Makes player bigger and grants extra hit point
  - Star: Grants temporary invincibility
- **Multiple Levels**: 3 levels with increasing difficulty
- **Score System**: Track your score, coins, and lives
- **Beautiful Graphics**: Retro-styled visuals with smooth animations

## Controls

- **Arrow Keys** or **WASD**: Move left/right
- **Space** / **Up Arrow** / **W**: Jump
- **Down Arrow** / **S**: Duck (visual only)

## Gameplay

- Collect coins to increase your score
- Jump on enemies to defeat them (100 points each)
- Avoid touching enemies from the side or you'll take damage
- Collect power-ups:
  - Mushroom gives you an extra hit point
  - Star makes you invincible for 10 seconds
- Reach the flag at the end of each level to progress
- Complete all 3 levels to win!

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── main.ts          - Entry point
├── Game.ts          - Main game loop and state management
├── Player.ts        - Player character
├── Enemy.ts         - Enemy entities
├── Collectible.ts   - Coins and collectibles
├── PowerUp.ts       - Power-up items
├── Platform.ts      - Platform/tile rendering
├── Level.ts         - Level data and management
├── Physics.ts       - Physics and collision detection
├── InputHandler.ts  - Keyboard input handling
└── types.ts         - TypeScript type definitions
```

## Game Mechanics

### Physics
- Gravity: 1200 units/s²
- Jump Force: -500 units/s
- Max Fall Speed: 800 units/s
- Friction: 0.85

### Scoring
- Coin: 10 points
- Enemy Defeat: 100 points
- Mushroom: 500 points
- Star: 1000 points
- Level Complete: 1000 points

### Lives
- Start with 3 lives
- Lose a life when:
  - Hit by enemy (when not powered/invincible)
  - Fall off the level
- When powered up, taking damage removes power-up instead of losing a life

Enjoy the game!
