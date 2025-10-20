import { Game } from './Game';

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    if (!canvas) {
        console.error('Could not find game canvas');
        return;
    }

    // Create and initialize the game
    const game = new Game(canvas);

    console.log('Game initialized! Click "Start Game" to play.');
});
