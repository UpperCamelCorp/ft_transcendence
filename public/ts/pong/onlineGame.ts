import { router } from "../index.js";
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

    draw(ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) {
        const scaledX = this.x / scaleX;
        const scaledY = this.y / scaleY;
        const scaledWidth = 10 / scaleX;
        const scaledHeight = 40 / scaleY;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(scaledX - scaledWidth/2, scaledY - scaledHeight/2, scaledWidth, scaledHeight);
    }
}

class Ball {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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
    private scaleX: number;
    private scaleY: number;
    private overlays: HTMLDivElement[];

    constructor(canvas : HTMLCanvasElement, leftColor: string, rightColor: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.socket = socket;
        this.leftPaddle = new Paddle(80, 504 / 2, leftColor);
        this.rightPaddle = new Paddle(896 - 80, 504 / 2, rightColor);
        this.ball = new Ball(896 / 2, 504 / 2);
        this.leftScore = 0;
        this.rightScore = 0;
        this.scaleX = 896 / canvas.width;
        this.scaleY = 504 / canvas.height;
        this.animationId = 0;
        this.overlays = [];
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
        this.leftPaddle.draw(this.ctx, this.scaleX, this.scaleY);
        this.rightPaddle.draw(this.ctx, this.scaleX, this.scaleY);
        this.ball.draw(this.ctx, this.scaleX, this.scaleY);
        this.updateScoreDisplay();
        this.animationId = requestAnimationFrame(this.loop);
    };

    public updateScale = () => {
        this.scaleX = 896 / this.canvas.width;
        this.scaleY = 504 / this.canvas.height;
    }

    public update = (update: any) => {
        this.ball.x = update.ballx;
        this.ball.y = update.bally;
        this.leftPaddle.x = update.leftx;
        this.leftPaddle.y = update.lefty;
        this.rightPaddle.x = update.rightx;
        this.rightPaddle.y = update.righty;
        this.leftScore = update.scores[0];
        this.rightScore = update.scores[1];
    }

     public cleanAll = () => {
        this.stop();
        
        this.socket.close();
        this.overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        });
        this.overlays = [];
    }

    public clean = () => {
        this.overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        });
    }

    public setUsers = (data: any) => {
        const leftPicture = document.getElementById('left-image') as HTMLImageElement;
        const rightPicture = document.getElementById('right-image') as HTMLImageElement;
        const leftPlayer = document.getElementById('left-name');
        const rightPlayer = document.getElementById('right-name');

        if (data.player1Picture)
            leftPicture.src = data.player1Picture;
        if (data.player2Picture)
            rightPicture.src = data.player2Picture;
        if (leftPlayer && data.player1)
            leftPlayer.textContent = data.player1;
        if (rightPlayer && data.player2)
            rightPlayer.textContent = data.player2;
    }

    public start = () => {

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

    public full = () => {
        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-10 z-50";
        overlay.innerHTML = `<span class="text-4xl text-slate-300 font-bold">This game is full</span>
                            <button id="return-button" class="mt-5 text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>`

        document.body.appendChild(overlay);
        this.overlays.push(overlay);

        const returnButton = document.getElementById('return-button');

        returnButton?.addEventListener('click', () => {
            this.cleanAll();
            game();
            currentGame = null;
        });
    }

    public disconnect = (player: string) => {
        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-10 z-50";
        overlay.innerHTML = `<span class="text-4xl text-slate-300 font-bold">${player} left</span>
                            <button id="return-button" class="mt-5 text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>`

        document.body.appendChild(overlay);
        this.overlays.push(overlay);

        const returnButton = document.getElementById('return-button');

        returnButton?.addEventListener('click', () => {
            this.cleanAll();
            game();
            currentGame = null;
        });
    }

    public wait = () => {
        const overlay = document.createElement('div');
        overlay.className = "fixed top-1/2 right-1/2 transform -translate-y-1/2 translate-x-1/2 rounded-2xl bg-black/70 text-white flex flex-col items-center justify-center p-10 z-50";
        overlay.innerHTML = `<span class="text-4xl text-slate-300 font-bold">Waiting...</span>`

        document.body.appendChild(overlay);
        this.overlays.push(overlay);
    }

    public GameOver = (winner: string) => {
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
        this.overlays.push(overlay);

        const returnButton = document.getElementById('return-button');

        returnButton?.addEventListener('click', () => {
            this.cleanAll();
            game();
            currentGame = null;
        });
    }

    public stop = () => {
        cancelAnimationFrame(this.animationId);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

let currentGame: Game | null;


export const onlineGame = (roomId: number, user: string, color: string) => {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const container = canvas.parentElement;
    if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * (9 / 16);
    }

    const socket = new WebSocket(`ws://${window.location.host}/game/play`);
    currentGame = new Game(canvas, color, 'white', socket);

    let picture = localStorage.getItem('picture');
    let userSetter = {
        player1Picture : '',
        player2Picture: '',
        player1: '',
        player2: ''
    };
    if (picture)
        userSetter.player1Picture = picture;
    else
        picture = '';
    if (user)
        userSetter.player1 = user;
    currentGame.setUsers(userSetter);
    currentGame.start();
    window.addEventListener('resize', () => {
        const container = canvas.parentElement;
        if (canvas && container) {
            canvas.width = container.clientWidth;
            canvas.height = canvas.width * (9 / 16);
        }
        currentGame?.updateScale();
    });
    socket.onopen = () => {
        const userJWT = localStorage.getItem('authToken');
        try {
            socket.send(JSON.stringify({
                    type: 'join',
                    roomId: roomId,
                    name: user,
                    token : userJWT,
                    picture: picture,
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
                currentGame?.update(rep);
                break;
            case 'wait':
                currentGame?.wait();
                break;
            case 'start':
                currentGame?.clean();
                currentGame?.setUsers(rep);
                break;
            case 'gameover':
                currentGame?.cleanAll();
                currentGame?.GameOver(rep.winner);
                break ;
            case 'disconnect':
                currentGame?.cleanAll();
                currentGame?.disconnect(rep.left);
                break;
            case 'full':
                currentGame?.cleanAll();
                currentGame?.full();
                break;
            case 'error':
                currentGame?.cleanAll();
                router.navigate('login');
        }
    }
}

export const cleanOnlineGame = () => {
    console.log("online cleaned");
    if (currentGame) {
        currentGame.cleanAll();
        currentGame = null;
    }
}