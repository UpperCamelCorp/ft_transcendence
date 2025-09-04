import { loginResponse } from "./loginPage";

class Paddle {
    x: number;
    y: number;
    color : string;
    dir : string;

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.dir = 'NONE';
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 5, this.y - 20, 10, 40);
    }

    moveUp() {
        if (this.y - 10 > 0)
            this.y -= 10;
    }

    moveDown() {
        if (this.y + 10 < canva.height)
            this.y += 10;
    }

    clear(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(this.x - 5, this.y - 20, 10, 40);
    }
}

let leftPaddle : Paddle;
let rightPaddle : Paddle;
let canva : HTMLCanvasElement;

const keyDown = (key: any) => {
    const code = key.code;
    if (code === 'KeyS')
        leftPaddle.dir = 'DOWN';
    if (code === 'KeyW')
        leftPaddle.dir = 'UP';
    if (code === 'ArrowDown')
        rightPaddle.dir = 'DOWN';
    if (code === 'ArrowUp')
        rightPaddle.dir = 'UP';
}

const KeyUp = (key: any) => {
    const code = key.code;
    if (code == 'KeyS' || code == 'KeyW')
        leftPaddle.dir = 'NONE';
    if (code == 'ArrowDown' || code == 'ArrowUp')
        rightPaddle.dir = 'NONE';
}

const update = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canva.width, canva.height);
    ctx.strokeStyle = 'white';
    ctx.setLineDash([5]);
    ctx.moveTo(canva.width / 2, 0);
    ctx.lineTo(canva.width / 2, canva.height);
    ctx.stroke();
    if (leftPaddle.dir != 'NONE') {
        if (leftPaddle.dir == 'UP')
            leftPaddle.moveUp();
        else
            leftPaddle.moveDown();
    }
    if (rightPaddle.dir != 'NONE') {
        if (rightPaddle.dir == 'UP')
            rightPaddle.moveUp();
        else
            rightPaddle.moveDown();
    }
    leftPaddle.draw(ctx);
    rightPaddle.draw(ctx);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(canva.width / 2, canva.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    requestAnimationFrame(() => update(ctx));
}

export const gameInit = () => {

    canva = document.getElementById('game') as HTMLCanvasElement;
    const container = canva.parentElement;

    if (canva && container) {
        canva.width = container.clientWidth - 10;
        canva.height = canva.width * (9 / 16);
    }

    const ctx = canva?.getContext('2d');
    leftPaddle = new Paddle(((canva.width / 2) / 2) - 80, canva.height / 2, 'white');
    rightPaddle = new Paddle((canva.width / 2) + ((canva.width / 2) / 2) + 80, canva.height / 2, 'white');
    if (ctx)
    {
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', KeyUp);
        requestAnimationFrame(() => update(ctx));
    }
}