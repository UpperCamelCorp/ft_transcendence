import { render } from "./render.js";
import { router } from "./index.js";
import { t } from "./i18n.js";

const userPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full">
        <div class="flex flex-col-reverse md:flex-row justify-center items-center mb-8">
            <img id="user-picture" src="../images/default-pp.png" alt="user picture" class="w-16 h-16 rounded-full md:mr-4">
            <h1 id="user-title" class="text-4xl text-white font-bold">${t('user.statsTitle')}</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 w-full">
            <!-- Stat 1 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">${t('user.winRate')}</span>
                <span id="win-rate" class="text-5xl font-bold text-white mb-2">-%</span>
                <span class="text-sm text-slate-400">${t('user.last30')}</span>
            </div>
            <!-- Stat 2 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">${t('user.gamesPlayed')}</span>
                <span id="total" class="text-5xl font-bold text-white mb-2">-</span>
                <span class="text-sm text-slate-400">${t('user.totalMatches')}</span>
            </div>
            <!-- Stat 3 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">${t('user.gamesHistory')}</span>
                <button id="history-button" class="flex h-full items-center">
                    <span class="text-sm text-slate-400">${t('user.historyClick')}</span>
                </button>
            </div>
        </div>
    </div>`;

const historyPage = () => `
    <div id="history-div" class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col  max-w-3xl w-full">
        <div class="relative flex items-center justify-center m-4">
            <h1 id="user-title" class="text-4xl text-white font-bold">-</h1>
            <button id="return-button" class="absolute top-0 right-2 border border-[#334155] hover:border-[#475569] text-slate-200 px-6 py-3 rounded-lg">${t('user.return')}</button>
        </div>
    </div>`;

const getUser = async (userId: string, token: string) => {
    try {
        const rep = await fetch(`/api/user/${userId}`, {
            method : 'GET',
            headers : {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!rep.ok)
            return null;
        const data = await rep.json();
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const getGames = async (userId: string, token: string) => {
    try {
        const rep = await fetch(`/api/games/${userId}`, {
            method: "GET",
            headers : {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!rep.ok)
            return null;
        const data = await rep.json();
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const setUserPage = (user: any, games: [any], userId:string) => {
    render(userPage());
    const title = document.getElementById('user-title') as HTMLHeadingElement;
    const picture = document.getElementById('user-picture') as HTMLImageElement;
    title.textContent = `${user.username} ${t('user.statsSuffix')}`;
    picture.src = user.picture;
    if (games.length) {
        const id = parseInt(userId);
        const winRate = document.getElementById('win-rate') as HTMLSpanElement;
        const total = document.getElementById('total') as HTMLSpanElement;
        let win = 0;
        games.forEach(game => {
            if (game.winner === id)
                win++;
        });
        winRate.textContent = `${Math.round((win * 100) / games.length)}%`;
        total.textContent = `${games.length}`;
    }
    const historyButton = document.getElementById('history-button');
    historyButton?.addEventListener('click', () => setHistoryPage(user, games, userId));
}

const setHistoryPage = (user: any, games: [any], userId: string) => {
    render(historyPage());
    const mainDiv = document.getElementById('history-div') as HTMLDivElement;
    const userTitle = document.getElementById('user-title') as HTMLSpanElement;
    userTitle.textContent = `${user.username} ${t('user.historySuffix')}`;

    const returnButton = document.getElementById('return-button') as HTMLButtonElement;
    returnButton.addEventListener('click', () => setUserPage(user, games, userId));
    games.forEach(game => {
        const gameDiv = document.createElement('div');
        const userScore = game.player1_id === parseInt(userId) ? game.score[0] : game.score[4];
        const oppScore = game.player1_id != parseInt(userId) ? game.score[0] : game.score[4];
        const oppPicture = game.player1_id != parseInt(userId)? game.player1_picture: game.player2_picture;
        const oppName = game.player1_id != parseInt(userId)? game.player1_username: game.player2_username;
        gameDiv.className = 'flex items-center justify-between border-2 border-black rounded-2xl mt-2';
        gameDiv.innerHTML = `
            <div class="flex items-center">
                <img src="${user.picture ? user.picture : '/images/default-pp.png'}" alt="user-picture" class="rounded-full w-16 h-16 m-8">
                <span class="text-2xl text-slate-300">${user.username}</span>
            </div>
            <span class="text-3xl text-slate-300 m-4">${userScore} : ${oppScore}</span>
            <div class="flex items-center">
                <span class="text-2xl text-slate-300">${oppName}</span>
                <img src="${oppPicture ? oppPicture : '/images/default-pp.png'}" alt="opponent-picture" class="rounded-full w-16 h-16 m-8">
            </div>`;
        mainDiv.appendChild(gameDiv);
    });
}

export const user = async (params: string) => {
    const token = localStorage.getItem('authToken');
    if (!token)
        return router.navigate('/login');
    const userData = await getUser(params, token);
    const gamesData = await getGames(params, token);
    if (!userData)
        return router.navigate('/');
    setUserPage(userData.user, gamesData.games, params);
}