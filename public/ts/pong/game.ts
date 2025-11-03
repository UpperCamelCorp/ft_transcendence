import { game } from "./pong.js";
import { t } from "../i18n.js";

class Paddle {
    x: number;
    y: number;
    color : string;
    upPressed : boolean;
    downPressed : boolean;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.upPressed = false;
        this.downPressed = false;
    }

    draw(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
        const scaledX = this.x / scaleX;
        const scaledY = this.y / scaleY;
        const scaledWidth = 10 / scaleX;
        const scaledHeight = 40 / scaleY;

        ctx.fillStyle = this.color;
        ctx.fillRect(scaledX - scaledWidth/2, scaledY - scaledHeight/2, scaledWidth, scaledHeight);
    }

    moveUp() {
        if (this.y - 5 > 0)
            this.y -= 5;
    }

    moveDown(height: number) {
        if (this.y + 5 < 504)
            this.y += 5;
    }

    reset() {
        this.y = 504 / 2;
    }
}

class Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.dx = 5;
        this.dy = 5;
    }

    draw(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
        const scaledX = this.x / scaleX;
        const scaledY = this.y / scaleY;
        const scaledRadius = 10 / Math.min(scaleX, scaleY);
        ctx.fillStyle = 'white';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update(canvas: HTMLCanvasElement) {
        this.x += this.dx;
        this.y += this.dy;

        if (this.y + this.dy >= 504 || this.y + this.dy <= 0)
            this.dy = -this.dy;
    }

    checkCollision(paddle: Paddle): boolean {
        return (
            this.x + this.dx < paddle.x + 10 &&
            this.x + this.dx > paddle.x - 10 &&
            this.y > paddle.y - 40 &&
            this.y < paddle.y + 40
        );
    }

    reset() {
        this.x = 896 / 2;
        this.y = 504 / 2;
    }

}

class Game {
    private leftPaddle : Paddle;
    private rightPaddle : Paddle;
    private ball : Ball;
    private ctx : CanvasRenderingContext2D;
    private animationId : number;
    private canvas : HTMLCanvasElement;
    private scaleX: number;
    private scaleY: number;
    private players : [string, string];
    private leftScore: number;
    private rightScore: number
    private gameStart: boolean;
    private maxPoints : number;
    private winner: string;
    private onEnd?: (winner : string) => void;
    public tournament : boolean = false;
    private _beforeUnloadHandler?: () => void;

    constructor(canvas : HTMLCanvasElement, players: [string, string], maxPoints: number, leftColor: string, rightColor: string, onEnd?: (winner : string) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.leftPaddle = new Paddle(80, 504 / 2, leftColor);
        this.rightPaddle = new Paddle(896 - 80, 504 / 2, rightColor);
        this.ball = new Ball(896 / 2, 504 / 2);
        this.scaleX = 896 / canvas.width;
        this.scaleY = 504 / canvas.height;
        this.players = players;
        this.leftScore = 0;
        this.rightScore = 0;
        this.gameStart = false;
        this.maxPoints = maxPoints;
        this.animationId = 0;
        this.winner = '';
        this.onEnd = onEnd;
    }

    private drawMap() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash([5]);
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private updatePaddles() {
        if (this.leftPaddle.upPressed) this.leftPaddle.moveUp();
        if (this.leftPaddle.downPressed) this.leftPaddle.moveDown(this.canvas.height);
        if (this.rightPaddle.upPressed) this.rightPaddle.moveUp();
        if (this.rightPaddle.downPressed) this.rightPaddle.moveDown(this.canvas.height);
    }

    private updateScoreDisplay() {
        const leftScoreElem = document.getElementById('score-left');
        const rightScoreElem = document.getElementById('score-right');
        if (leftScoreElem) leftScoreElem.textContent = String(this.leftScore);
        if (rightScoreElem) rightScoreElem.textContent = String(this.rightScore);
    }

    private updateBall() {
        const prevX = this.ball.x;
        this.ball.update(this.canvas);

        if (this.ball.checkCollision(this.leftPaddle) || this.ball.checkCollision(this.rightPaddle)) {
            this.ball.dx = -this.ball.dx;
        }

        if (prevX > 0 && this.ball.x <= 0) {
            this.rightScore++;
            this.updateScoreDisplay();
            this.ball.reset();
            this.rightPaddle.reset();
            this.leftPaddle.reset();
            this.gameStart = false;
            if (this.rightScore == this.maxPoints) {
                this.winner = this.players[1];
                this.stop();
            }
        }

        else if (prevX < 896 && this.ball.x >= 896) {
            this.leftScore++;
            this.updateScoreDisplay();
            this.ball.reset();
            this.rightPaddle.reset();
            this.leftPaddle.reset();
            this.gameStart = false;
            if (this.leftScore == this.maxPoints) {
                this.winner = this.players[0];
                this.stop();
            }
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        if (!this.gameStart)
            this.gameStart = true;
        switch (e.code) {
            case 'KeyW':
                this.leftPaddle.upPressed = true;
                break;
            case 'KeyS':
                this.leftPaddle.downPressed = true;
                break;
            case 'ArrowUp':
                this.rightPaddle.upPressed = true;
                break;
            case 'ArrowDown':
                this.rightPaddle.downPressed = true;
                break;
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        switch (e.code) {
            case 'KeyW':
                this.leftPaddle.upPressed = false;
                break;
            case 'KeyS':
                this.leftPaddle.downPressed = false;
                break;
            case 'ArrowUp':
                this.rightPaddle.upPressed = false;
                break;
            case 'ArrowDown':
                this.rightPaddle.downPressed = false;
                break;
        }
    };

    private handleTouchStart = (up: boolean) => {
        if (!this.gameStart)
            this.gameStart = true;
        if (up)
            this.leftPaddle.upPressed = true;
        else
            this.leftPaddle.downPressed = true;
    }

    private handleTouchEnd = (up: boolean) => {
        if (up)
            this.leftPaddle.upPressed = false;
        else
            this.leftPaddle.downPressed = false;
    }

    private loop = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap();
        if (this.gameStart) {
            this.updatePaddles();
            this.updateBall();
        }
        this.leftPaddle.draw(this.ctx, this.scaleX, this.scaleY);
        this.rightPaddle.draw(this.ctx, this.scaleX, this.scaleY);
        this.ball.draw(this.ctx, this.scaleX, this.scaleY);
        this.animationId = requestAnimationFrame(this.loop);
    };

    public setUsers = () => {
        const leftName = document.getElementById('left-name') as HTMLSpanElement;
        const rightName = document.getElementById('right-name') as HTMLSpanElement;

        leftName.textContent = this.players[0];
        rightName.textContent = this.players[1];
    }

    public updateScale = () => {
        this.scaleX = 896 / this.canvas.width;
        this.scaleY = 504 / this.canvas.height;
    }

    public start() {
        if (this.gameStart) return;
        this.gameStart = true;

        cancelAnimationFrame(this.animationId);

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        const upArrow = document.getElementById('up');
        const downArrow = document.getElementById('down');
        upArrow?.addEventListener('touchstart', () => this.handleTouchStart(true));
        upArrow?.addEventListener('touchend', () => this.handleTouchEnd(true));
        downArrow?.addEventListener('touchstart', () => this.handleTouchStart(false));
        downArrow?.addEventListener('touchend', () => this.handleTouchEnd(false));

        this.loop();
        this.rightScore = 0;
        this.leftScore = 0;
        this.ball.dx = Math.floor(Math.random() * 2) % 2 ? this.ball.dx: -this.ball.dx;
        this.ball.dy = Math.floor(Math.random() * 2) % 2 ? this.ball.dy: -this.ball.dy;
        this.updateScoreDisplay();

        try {
            fetch('/api/metrics/local', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'start' })
            }).catch(() => {});
        } catch (e) {
            console.warn('metrics start failed', e);
        }

        this._beforeUnloadHandler = () => {
            if (!this.gameStart) return;
            try {
                navigator.sendBeacon && navigator.sendBeacon('/api/metrics/local', JSON.stringify({ event: 'stop' }));
            } catch (e) {}
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    public stop() {
        cancelAnimationFrame(this.animationId);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        if (this.gameStart) {
            this.gameStart = false;
            try {
                fetch('/api/metrics/local', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: 'stop' })
                }).catch(() => {});
            } catch (e) {
                console.warn('metrics stop failed', e);
            }
        }

        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
            this._beforeUnloadHandler = undefined;
        }

        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-3 z-50";
        if (!this.tournament) {
            this.onEnd?.(this.winner);
            overlay.innerHTML = `
                <span class="text-3xl font-bold m-3" >${t('pong.gameOverTitle')}</span>
                <span id="player" class="text-2xl font-bold m-4 mb-8">${this.winner} ${t('pong.wonSuffix')}</span>
                <div class="flex m-2 space-x-8">
                    <button id="return-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>
                    <button id="retry-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Retry</button>
                </div>`;
        }
        else {
            overlay.innerHTML = `
                <span class="text-3xl font-bold m-3" >Game Over</span>
                <span id="player" class="text-2xl font-bold m-4 mb-8">${this.winner} ${t('pong.wonSuffix')}</span>
                <div class="flex m-2 space-x-8">
                    <button id="next-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Next</button>
                </div>`;
        }
        document.body.appendChild(overlay);

        const returnButton = document.getElementById('return-button');
        const retryButton = document.getElementById('retry-button');
        const nextButton = document.getElementById('next-button');

        returnButton?.addEventListener('click', () => {
            overlay.remove();
            game()
        });
        retryButton?.addEventListener('click', () => {
            overlay.remove();
            this.start()
        });
        nextButton?.addEventListener('click', () => {
            overlay.remove();
            this.onEnd?.(this.winner);
        });
    }
}


export const gameInit = async (max: number = 3, leftColor: string = 'white', rightColor: string = 'white', players: [string , string] = ['Player 1', 'Player 2'], tournament : boolean = false): Promise<string> => {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const container = canvas.parentElement;
    if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * (9 / 16);
        console.log(canvas.width, canvas.height);
    }
    return new Promise<string>((resolve) => {
        const game = new Game(canvas, players, max, leftColor, rightColor, resolve);
        if (tournament) game.tournament = true;
        window.addEventListener('resize', () => {
            const container = canvas.parentElement;
            if (canvas && container) {
                canvas.width = container.clientWidth - 10;
                canvas.height = canvas.width * (9 / 16);
                game.updateScale();
            }
        });
        game.setUsers();
        game.start();
    });
}