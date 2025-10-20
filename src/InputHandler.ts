export class InputHandler {
    private keys: Map<string, boolean> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.key.toLowerCase(), true);
            // Prevent default for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.key.toLowerCase(), false);
        });
    }

    isKeyPressed(key: string): boolean {
        return this.keys.get(key.toLowerCase()) || false;
    }

    isLeft(): boolean {
        return this.isKeyPressed('arrowleft') || this.isKeyPressed('a');
    }

    isRight(): boolean {
        return this.isKeyPressed('arrowright') || this.isKeyPressed('d');
    }

    isJump(): boolean {
        return this.isKeyPressed('arrowup') || this.isKeyPressed('w') || this.isKeyPressed(' ');
    }

    isDown(): boolean {
        return this.isKeyPressed('arrowdown') || this.isKeyPressed('s');
    }

    isShoot(): boolean {
        return this.isKeyPressed('x') || this.isKeyPressed('shift');
    }
}
