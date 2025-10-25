import { router } from "../index.js";
import { render } from "../render.js";
import { gameInit } from "./game.js";
import { onlineGame } from "./onlineGame.js";
import { t } from "../i18n.js";

const pongGame = () => `
    <div class="w-full h-full max-w-4xl p-3 mx-2 aspect-video flex flex-col items-center justify-center">
        <p class="text-white text-4xl">${t('pong.scoreLabel')}</p>
        <div class="flex items-center gap-8 my-4 text-white bg-gray-800/70 text-3xl border rounded-3xl border-b-cyan-400 p-4">
            <div class="flex mx-3 mr-10 space-x-1 items-center">
                <img id="left-image" src="../images/default-pp.png" alt="left-user-image" class="w-12 h-12 rounded-full">
                <span class="text-white" id="left-name">${t('pong.player1')}</span>
            </div>
            <span id="score-left">0</span>
            <span>-</span>
            <span id="score-right">0</span>
            <div class="flex mx-3 ml-10 space-x-1 items-center">
                <img id="right-image" src="../images/default-pp.png" alt="right-user-image" class="w-12 h-12 rounded-full">
                <span class="text-white" id="right-name">${t('pong.player2')}</span>
            </div>
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
    </div>`

const gameChoice = () => `
    <div class="w-full max-w-3xl p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C] to-[#142033]">
        <div class="text-slate-300 flex flex-col items-center">
            <h1 class="text-5xl font-bold text-white mb-2">${t('pong.title')}</h1>
            <p>${t('pong.welcome')}</p>
            <p>${t('pong.playDesc')}</p>
        </div>
        <div class="m-4 p-3 flex items-center justify-center gap-x-10 text-slate-300 text-2xl">
            <button id="local-button" class="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">
                <img src="../svg/local-game.svg" alt="local-game" class="w-12 h-12 m-3">
                <span>${t('pong.localGame')}</span>
            </button>
            <button id="online-button" class="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 hover:border-cyan-300 transition-all duration-200">
                <img src="../svg/online-game.svg" alt="online-game" class="w-12 h-12 m-3">
                <span>${t('pong.onlineGame')}</span>
            </button>
        </div>
    </div>`

const gameCustom = () => ` <div class="w-full max-w-3xl p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C] to-[#142033]">
            <div class="flex flex-col items-center p-2">
                <span class="text-white text-2xl font-bold m-2">${t('pong.optionsTitle')}</span>
                <div class="flex items-center justify-evenly w-full">
                    <div class="flex flex-col items-center m-4">
                        <label for="max-point" class="text-white m-2">${t('pong.maxPoints')}</label>
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
                            <label for="left-color" class="text-white">${t('pong.leftColor')}</label>
                            <input
                                type="color"
                                id="left-color"
                                name="left-color"
                                value="#FFFFFF"
                            >
                        </div>
                        <div class="flex flex-col items-center my-5">
                            <label for="right-color" class="text-white">${t('pong.rightColor')}</label>
                            <input
                                type="color"
                                id="right-color"
                                name="color"
                                value="#FFFFFF"
                            >
                        </div>
                    </div>
                </div>
                <button id="start" class="text-white p-4 px-5 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#334155] border border-cyan-400 hover:border-cyan-300 transition-all duration-200">${t('pong.start')}</button>
            </div>
        </div>`

const onlineGameCustom = () => `
    <div class="w-full max-w-3xl p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C] to-[#142033]">
        <h2 class="w-full text-center text-white text-2xl font-bold m-2">${t('pong.playPong')}</h2>
        <div class="flex w-full">
            <div class="w-full flex flex-col items-center justify-start">
                <div class="flex flex-col m-4">
                    <label for="room" class="text-slate-300">${t('pong.roomId')}</label>
                    <input
                        id="room"
                        name="room"
                        type="number"
                        max="9999"
                        min="0"
                        placeholder="${t('pong.roomPlaceholder')}"
                        class="px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                    >
                </div>
            </div>
            <div class="w-full flex flex-col justify-center items-start">
                <div class="flex flex-col m-3">
                    <label for="name" class="text-slate-300">${t('pong.displayName')}</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        class="px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                    >
                </div>
                <div class="flex flex-col m-3">
                    <label for="color" class="text-slate-300">${t('pong.paddleColor')}</label>
                    <input
                        id="color"
                        name="color"
                        type="color"
                        value="#FFFFFF"
                    >
                </div>
            </div>
        </div>
        <div class="w-full flex justify-center mt-4">
            <button id="play" class="bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                ${t('pong.play')}
            </button>
        </div>
    </div>`

const OnlineCustom = () => {
    const token = localStorage.getItem('authToken');
    if (!token)
        return router.navigate('/login');
    render(onlineGameCustom());
    const playButton = document.getElementById('play');
    const roomIdInput = document.getElementById('room') as HTMLInputElement;
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const colorInput = document.getElementById('color') as HTMLInputElement;
    let user = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            user = null;
        }
    }
    if (user && nameInput) {
        nameInput.placeholder = user.username;
    }
    playButton?.addEventListener('click', () => {
        render(pongGame());
        const roomId = parseInt(roomIdInput?.value || '0');
        const color = colorInput?.value;
        let name;
        if (user && !nameInput?.value)
            name = user.username;
        else
            name = nameInput?.value;
        onlineGame(roomId, name, color);
    });
}

const custom = () => {
    render(gameCustom());
    const maxPointInput = document.getElementById('max-point') as HTMLInputElement;
    const pointText = document.getElementById('max-value');
    const startButton = document.getElementById('start');
    const leftColorInput = document.getElementById('left-color') as HTMLInputElement;
    const rightColorInput = document.getElementById('right-color') as HTMLInputElement;

    if (pointText && maxPointInput) {
        pointText.textContent = maxPointInput.value;
        maxPointInput.addEventListener('input', (e) =>{
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
    })
}

export const game = () => {
    render(gameChoice());
    const localButton = document.getElementById('local-button');
    const onlineButton = document.getElementById('online-button');
    localButton?.addEventListener('click', () => {
        custom();
    });
    onlineButton?.addEventListener('click', () => {
        OnlineCustom();
    })

}