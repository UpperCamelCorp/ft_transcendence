import { game } from "./pong.js";

class Paddle {
    x: number;
    y: number;
    color : string;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 5, this.y - 20, 10, 40);
    }

    clear(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(this.x - 5, this.y - 20, 10, 40);
    }
}

class Ball {
    x: number;
    y: number;
    constructor(x: number, y: number, dx: number, dy: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

class Game {
    private leftPaddle : Paddle;
    private rightPaddle : Paddle;
    private ball : Ball;
    private ctx : CanvasRenderingContext2D;
    private socket: WebSocket;
    private animationId : number;
    private canvas : HTMLCanvasElement;
    private leftScore: number;
    private rightScore: number

    constructor(canvas : HTMLCanvasElement, leftColor: string, rightColor: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.socket = socket;
        this.leftPaddle = new Paddle(((canvas.width / 2) / 2) - 80, canvas.height / 2, leftColor);
        this.rightPaddle = new Paddle((canvas.width / 2) + ((canvas.width / 2) / 2) + 80, canvas.height / 2, rightColor);
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, 5, 5);
        this.leftScore = 0;
        this.rightScore = 0;
        this.animationId = 0;
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

    private updateScoreDisplay() {
        const leftScoreElem = document.getElementById('score-left');
        const rightScoreElem = document.getElementById('score-right');
        if (leftScoreElem) leftScoreElem.textContent = String(this.leftScore);
        if (rightScoreElem) rightScoreElem.textContent = String(this.rightScore);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'KeyW':
                this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Up',
                        action: 'Down'
                    }));
                break;
            case 'KeyS':
                this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Down',
                        action: 'Down'
                    }));
                break;
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'KeyW':
                this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Up',
                        action: 'Up'
                    }));
                break;
            case 'KeyS':
                this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Down',
                        action: 'Up'
                    }));
                break;
        }
    };

    private handleTouchStart = (up: boolean) => {
        if (up)
            this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Up',
                        action: 'Down'
                    }));
        else
            this.socket.send(JSON.stringify({
                        type: 'move',
                        dir: 'Down',
                        action: 'Down'
                    }));
    }

    private handleTouchEnd = (up: boolean) => {
        if (up)
            this.socket.send(JSON.stringify({
                    type: 'move',
                    dir: 'Up',
                    action: 'Up'
                }));
        else
            this.socket.send(JSON.stringify({
                    type: 'move',
                    dir: 'Down',
                    action: 'Up'
                }));
    }
    
    private loop = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap();
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.animationId = requestAnimationFrame(this.loop);
    };

    public update = (update: any) => {
        this.ball.x = update.ballx;
        this.ball.y = update.bally;
        this.leftPaddle.x = update.leftx;
        this.leftPaddle.y = update.lefty;
        this.rightPaddle.x = update.rightx;
        this.rightPaddle.y = update.righty;
    }

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
        this.updateScoreDisplay();
    }

    public wait(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-3 z-50";
        overlay.innerHTML = `<span class="text-4xl text-slate-300 font-bold">Waiting...</span>`

        document.body.appendChild(overlay);
        return overlay;
    }

    public GameOver(winner: string) {
        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-10 z-50";
        overlay.innerHTML = `
            <span class="text-3xl font-bold m-3" >Game Over</span>
            <span id="player" class="text-2xl font-bold m-4 mb-8">${winner} Won!</span>
            <div class="flex m-2 space-x-8">
                <button id="return-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>
                <button id="retry-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Retry</button>
            </div>
        `
        document.body.appendChild(overlay);

        const returnButton = document.getElementById('return-button');

        returnButton?.addEventListener('click', () => {
            overlay.remove();
            game()
        });
    }

    public stop() {
        cancelAnimationFrame(this.animationId);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}


export const onlineGame = (roomId: number, user: number, color: string) => {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const container = canvas.parentElement;
    let overlay: HTMLDivElement;
    if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * (9 / 16);
    }

    const socket = new WebSocket(`ws://${window.location.host}/game/play`);

    const game = new Game(canvas, color, 'white', socket);
    game.start();
    socket.onopen = () => {
        try {
            socket.send(JSON.stringify({
                    type: 'join',
                    roomId: roomId,
                    name: user,
                    color: color
                }));
        } catch (e) {
            console.log(e);
        }
    }

    socket.onmessage = (data) => {
        const rep = JSON.parse(data.data);
        switch (rep.type) {
            case 'update':
                game.update(rep);
                break;
            case 'wait':
                overlay = game.wait();
                break;
            case 'start':
                if (overlay)
                    overlay.remove();
                break;
            case 'gameover':
                game.stop();
                game.GameOver(rep.winner);
            case 'disconnect':
                game.stop();
        }
    }
}