import { game } from "./pong.js";
import { gameInit } from "./game.js";
import { render } from "../render.js";
import { t } from "../i18n.js";

const nextGameOverlay = (player1 : string, player2: string): HTMLDivElement => {
    const overlay = document.createElement('div');
    overlay.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C]/70 to-[#142033]/70 z-50";
    overlay.innerHTML = `
        <h3 class="w-full text-center text-white text-3xl mb-4">${t('pong.nextGame')}</h3>
        <div class="w-full flex justify-evenly items-center">
            <div class="flex flex-col gap-y-2 justify-center items-center">
                <img src="/images/default-pp.png" alt="profile-picture" class="w-10 h-10 rounded-full">
                <span class="text-2xl text-slate-300">${player1}</span>
            </div>
            <span class="text-white font-bold text-6xl mx-5">VS</span>
            <div class="flex flex-col gap-y-2 justify-center items-center">
                <img src="/images/default-pp.png" alt="profile-picture" class="w-10 h-10 rounded-full">
                <span class="text-2xl text-slate-300">${player2}</span>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    return overlay;
}

const initCanva = () => {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const container = canvas.parentElement;
    if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * (9 / 16);
    }
}

const nextPhaseOverlay = (players: string[], phase: number): HTMLDivElement => {
    const overlay = document.createElement('div');
    overlay.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C]/70 to-[#142033]/70 z-50";
    overlay.innerHTML = `<h3 class="w-full text-center text-white text-3xl mb-4">${t('pong.phase')} ${phase}</h3>`;
    
    const innerOverlay = document.createElement('div');
    innerOverlay.className = "grid grid-cols-3 justify-center items-center gap-5";
    let it = 0;
    const borderClasses = [
        'border-cyan-700',
        'border-red-700',
        'border-green-700',
        'border-purple-700',
        'border-orange-700',
        'border-lime-700',
        'border-indigo-700'
    ];
    players.forEach(player => {
        const borderClass = borderClasses[it % borderClasses.length];
        innerOverlay.innerHTML += `
            <div class="flex flex-col gap-y-2 justify-center items-center">
                <img src="/images/default-pp.png" alt="profile-picture" class="w-10 h-10 rounded-full border-2 ${borderClass}">
                <span class="text-2xl text-slate-300">${player}</span>
            </div>`;
        if (!(it % 2)) {
            if (it != players.length - 1)
                innerOverlay.innerHTML += '<span class="text-white font-bold text-3xl mx-5">VS</span>';
            else
                innerOverlay.innerHTML += '<span class="text-white font-bold text-3xl mx-5">OUT</span>';
        }
        it++;
    });
    overlay.appendChild(innerOverlay);
    document.body.appendChild(overlay);
    return overlay;
}

const winnerOverlay = (winner: string): HTMLDivElement => {
    const overlay = document.createElement('div');
    overlay.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#18003C]/70 to-[#142033]/70 z-50";
    overlay.innerHTML = `
        <h3 class="w-full text-center text-white text-3xl mb-4">${t('pong.tournamentWinner')}</h3>
        <div class="w-full flex flex-col justify-evenly items-center">
            <div class="flex flex-col gap-y-2 justify-center items-center m-4">
                <img src="/images/default-pp.png" alt="profile-picture" class="w-10 h-10 rounded-full">
                <span class="text-2xl text-slate-300">${winner}</span>
            </div>
            <button id="return-button" class="text-2xl text-slate p-4 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] hover:from-[#334155] hover:to-[#475569] border border-cyan-400 transition-all duration-200">Return</button>
        </div>`;
    document.body.appendChild(overlay);
    return overlay;
}

const launchPhase = async (players : string[]): Promise<string[]> => {
    let nbRounds = Math.round(players.length / 2);
    const winners = [];
    for (let i = 0; i < nbRounds; i++) {
        if (2 * i === players.length - 1) {
            winners.push(players[2 * i]);
            break;
        }
        const p1 = players[2 * i];
        const p2 = players[2 * i + 1];
        const overlay  = nextGameOverlay(p1, p2);
        await new Promise(resolve => setTimeout(resolve, 3000));
        overlay.remove();
        const winner = await gameInit(3, 'white', 'white', [p1, p2], true);
        winners.push(winner);
    }
    return winners;
}

export const launchTournament = async (players : string[]) => {
    let nbPhase = Math.ceil(Math.log2(players.length));
    let winners = players;
    initCanva();
    for (let i = 0; i < nbPhase; i++) {
        const overlay = nextPhaseOverlay(winners, i + 1);
        await new Promise(resolve => setTimeout(resolve, 3000));
        overlay.remove();
        winners = await launchPhase(winners);
    }
    const overlay = winnerOverlay(winners[0]);
    const returnButton = document.getElementById('return-button');
    returnButton?.addEventListener('click', () => {
        overlay.remove();
        game();
    });
}