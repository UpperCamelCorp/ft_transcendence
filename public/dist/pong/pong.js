import { render } from "../render.js";
import { gameInit } from "./game.js";
import { onlineGame } from "./onlineGame.js";
const pongGame = () => `
    <div class="w-full h-full max-w-4xl p-3 mx-2 aspect-video flex flex-col items-center justify-center">
        <p class="text-white text-4xl">Score</p>
        <div class="flex gap-8 my-4 text-white bg-gray-800/70 text-3xl border rounded-3xl border-b-cyan-400 p-4">
            <span id="score-left">0</span>
            <span>-</span>
            <span id="score-right">0</span>
        </div>
        <canvas id="game" class="bg-black/50">
        </canvas>
        <div class="w-full flex justify-center space-x-8 mt-12 md:hidden">
            <button id="up" class="bg-red-700 rounded-2xl">
                <img src="../svg/game-arrow.svg" alt="up-arrow" class="w-20 h-20 m-3">
            </button>
           <button id="down" class="bg-cyan-700 rounded-2xl">
                <img src="../svg/game-arrow.svg" alt="down-arrow" class="w-20 h-20 rotate-180 m-3">
            </button>
        </div>
    </div>`;
const gameChoice = () => `        
    <div class="w-full max-w-3xl p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C] to-[#142033]">
        <div class="text-slate-300 flex flex-col items-center">
            <h1 class="text-5xl font-bold text-white mb-2">PONG GAME</h1>
            <p>Welcome to the pong game</p>
            <p>Play with your friends and more !</p>
        </div>
        <div class="m-4 p-3 flex items-center justify-center gap-x-10 text-slate-300 text-2xl">
            <button id="local-button" class="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">
                <img src="../svg/local-game.svg" alt="local-game" class="w-12 h-12 m-3">
                <span>Local Game</span>
            </button>
            <button id="online-button" class="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 hover:border-cyan-300 transition-all duration-200">
                <img src="../svg/online-game.svg" alt="online-game" class="w-12 h-12 m-3">
                <span>Online Game</span>
            </button>
        </div>
    </div>`;
const gameCustom = () => ` <div class="w-full max-w-3xl p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C] to-[#142033]">
            <div class="flex flex-col items-center p-2">
                <span class="text-white text-2xl font-bold m-2">Game Options</span>
                <div class="flex items-center justify-evenly w-full">
                    <div class="flex flex-col items-center m-4">
                        <label for="max-point" class="text-white m-2">Max points</label>
                        <input 
                            type="range"
                            id="max-point"
                            name="max-point"
                            value="1"
                            min="1"
                            max="10"
                        >
                        <span id="max-value" class="text-2xl text-white">1</span>
                    </div>                
                    <div class="flex flex-col items-center">
                        <div class="flex flex-col items-center my-5">
                            <label for="left-color" class="text-white">Left paddle color</label>
                            <input 
                                type="color"
                                id="left-color"
                                name="left-color"
                                value="#FFFFFF"
                            >
                        </div>
                        <div class="flex flex-col items-center my-5">
                            <label for="right-color" class="text-white">Right paddle color</label>
                            <input 
                                type="color"
                                id="right-color"
                                name="color"
                                value="#FFFFFF"
                            >
                        </div>
                    </div>
                </div>
                <button id="start" class="text-white p-4 px-5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#334155] border border-cyan-400 hover:border-cyan-300 transition-all duration-200">Start</button>
            </div>
        </div>`;
const custom = () => {
    render(gameCustom());
    const maxPointInput = document.getElementById('max-point');
    const pointText = document.getElementById('max-value');
    const startButton = document.getElementById('start');
    const leftColorInput = document.getElementById('left-color');
    const rightColorInput = document.getElementById('right-color');
    if (pointText && maxPointInput) {
        pointText.textContent = maxPointInput.value;
        maxPointInput.addEventListener('input', (e) => {
            if (pointText) {
                pointText.textContent = maxPointInput.value;
            }
        });
    }
    startButton?.addEventListener('click', () => {
        const leftColor = leftColorInput?.value;
        const rightColor = rightColorInput?.value;
        const maxPoint = parseInt(maxPointInput?.value || '1');
        render(pongGame());
        gameInit(maxPoint, leftColor, rightColor);
    });
};
export const game = () => {
    render(gameChoice());
    const localButton = document.getElementById('local-button');
    const onlineButton = document.getElementById('online-button');
    localButton?.addEventListener('click', () => {
        custom();
    });
    onlineButton?.addEventListener('click', () => {
        onlineGame();
    });
};
