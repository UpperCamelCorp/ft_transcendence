import { game } from "./pong.js";

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

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 5, this.y - 20, 10, 40);
    }

    moveUp() {
        if (this.y - 10 > 0 + 10)
            this.y -= 10;
    }

    moveDown(height: number) {
        if (this.y + 10 < height - 10)
            this.y += 10;
    }

    reset(y: number) {
        this.y = y;
    }

    clear(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(this.x - 5, this.y - 20, 10, 40);
    }
}

class Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
    constructor(x: number, y: number, dx: number, dy: number) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update(canvas: HTMLCanvasElement) {
        this.x += this.dx;
        this.y += this.dy;
        

        if (this.y + this.dy >= canvas.height || this.y + this.dy <= 0)
            this.dy = -this.dy;
    }

    checkCollision(paddle: Paddle): boolean {
        return (
            this.x + this.dx < paddle.x + 10 &&
            this.x + this.dx > paddle.x - 10 &&
            this.y > paddle.y - 30 &&
            this.y < paddle.y + 30
        );
    }

    reset(canvas: HTMLCanvasElement) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
    }
}

class Game {
    private leftPaddle : Paddle;
    private rightPaddle : Paddle;
    private ball : Ball;
    private ctx : CanvasRenderingContext2D;
    private animationId : number;
    private canvas : HTMLCanvasElement;
    private leftScore: number;
    private rightScore: number
    private gameStart: boolean;
    private maxPoints : number;
    private winner: string;

    constructor(canvas : HTMLCanvasElement, maxPoints: number, leftColor: string, rightColor: string) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.leftPaddle = new Paddle(((canvas.width / 2) / 2) - 80, canvas.height / 2, leftColor);
        this.rightPaddle = new Paddle((canvas.width / 2) + ((canvas.width / 2) / 2) + 80, canvas.height / 2, rightColor);
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, 5, 5);
        this.leftScore = 0;
        this.rightScore = 0;
        this.gameStart = false;
        this.maxPoints = maxPoints;
        this.animationId = 0;
        this.winner = '';
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
            this.ball.reset(this.canvas);
            this.rightPaddle.reset(this.canvas.height / 2);
            this.leftPaddle.reset(this.canvas.height / 2);
            this.gameStart = false;
            if (this.rightScore == this.maxPoints) {
                this.winner = 'Player 2';
                this.stop();
            }
        }

        else if (prevX < this.canvas.width && this.ball.x >= this.canvas.width) {
            this.leftScore++;
            this.updateScoreDisplay();
            this.ball.reset(this.canvas);
            this.rightPaddle.reset(this.canvas.height / 2);
            this.leftPaddle.reset(this.canvas.height / 2);
            this.gameStart = false;
            if (this.leftScore == this.maxPoints) {
                this.winner = 'Player 1';    
                this.stop();
            }
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
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
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.animationId = requestAnimationFrame(this.loop);
    };

    public start() {

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
        this.ball.dx = Math.floor(Math.random() * 2) % 2 ? 5: -5;
        this.ball.dy = Math.floor(Math.random() * 2) % 2 ? 5: -5;
        console.log('dx = ', this.ball.dx,);
        console.log('dy = ', this.ball.dy);
        this.updateScoreDisplay();
    }

    public stop() {
        cancelAnimationFrame(this.animationId);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);

        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-3 z-50";
        overlay.innerHTML = `
            <span class="text-3xl font-bold m-3" >Game Over</span>
            <span id="player" class="text-2xl font-bold m-4 mb-8">${this.winner} Won!</span>
            <div class="flex m-2 space-x-8">
                <button id="return-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>
                <button id="retry-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Retry</button>
            </div>
        `
        document.body.appendChild(overlay);

        const returnButton = document.getElementById('return-button');
        const retryButton = document.getElementById('retry-button');

        returnButton?.addEventListener('click', () => {
            overlay.remove();
            game()
        });
        retryButton?.addEventListener('click', () => {
            overlay.remove();
            this.start()
        });
    }
}


export const gameInit = (max: number, leftColor: string = 'white', rightColor: string = 'white') => {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const container = canvas.parentElement;
    if (canvas && container) {
        canvas.width = container.clientWidth - 10;
        canvas.height = canvas.width * (9 / 16);
    }
    const game = new Game(canvas, max, leftColor, rightColor);
    game.start();
}