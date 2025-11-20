import { render } from "./render.js";
import { router } from "./index.js";
import { t } from "./i18n.js";

export const userPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full">
        <div class="flex flex-col-reverse md:flex-col justify-center items-center mb-8">
            <div class="flex justify-center items-center">
                <div class="relative mr-4">
                    <div id="status" class="absolute left-14 top-1 rounded-full bg-[#FF0000] w-4 h-4 z-50"></div>
                    <img id="user-picture" src="/images/default-pp.png" alt="user picture" class="w-16 h-16 rounded-full m-2 md:mr-4">
                </div>
                <div class="flex flex-col md:flex-row items-center">
                    <h1 id="user-title" class="text-4xl text-white font-bold text-center mb-2 md:mb-0 md:mr-4">${t('user.statsTitle')}</h1>
                    <div class="flex items-center">
                        <button id="add-button" class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold p-3 md:mr-4 rounded-lg shadow">${t('user.add')}</button>
                        <div id="profile-actions" class="flex items-center">
                            <a href="/edit" data-link class="ml-2">
                                <button id="edit-profile" class="bg-[#0F172A] hover:bg-[#111827] text-white font-semibold p-3 rounded-lg border border-slate-700">${t('header.menu.edit')}</button>
                            </a>
                            <button id="disconnect-profile" class="ml-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold p-3 rounded-lg border border-red-700">${t('header.menu.disconnect')}</button>
                        </div>
                    </div>
                </div>
            </div>
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

export const historyPage = () => `
    <div id="history-div" class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col  max-w-3xl w-full max-h-full">
        <div class="relative flex items-center justify-center m-4">
            <h1 id="user-title" class="text-4xl text-white font-bold">-</h1>
            <button id="return-button" class="absolute top-0 right-2 border border-[#334155] hover:border-[#475569] text-slate-200 px-6 py-3 rounded-lg">${t('user.return')}</button>
        </div>
        <div id="games-div" class="overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800">
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

const addUser = async (userId: string, token: string) => {
    try {
        const rep = await fetch(`/api/friends/add/${userId}`, {
            method: "POST",
            headers : {
                "Authorization": `Bearer ${token}`,
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

export const setUserPage = (userData: any, games: [any], userId:string, token: string) => {
    render(userPage());
    const user = userData.user;
    const title = document.getElementById('user-title') as HTMLHeadingElement;
    const picture = document.getElementById('user-picture') as HTMLImageElement;
    const statusDiv = document.getElementById('status') as HTMLDivElement;
    const addButton = document.getElementById('add-button') as HTMLButtonElement;

    const profileActions = document.getElementById('profile-actions') as HTMLDivElement | null;

    const isOwnProfile = !userId || userId === '';

    if (isOwnProfile) {
        profileActions?.classList.remove('hidden');
        addButton?.classList.add('hidden');
    } else {
        profileActions?.classList.add('hidden');
        addButton?.classList.remove('hidden');
    }

    title.textContent = `${user.username} ${t('user.statsSuffix')}`;
    console.log(userData);

    if (userData.friends === 2) {
		if (userData.status)
            statusDiv.classList.replace('bg-[#FF0000]', 'bg-[#00FF00]');
        statusDiv.classList.remove('hidden');
        addButton?.classList.add('hidden');
    } else {
        statusDiv.classList.add('hidden');
        if (!isOwnProfile) {
            addButton?.classList.remove('hidden');
            if (userData.friends === null) {
                addButton.textContent = t('user.add');
            } else if (userData.friends === 0) {
                addButton.textContent = t('friends.waiting');
            } else if (userData.friends === 1) {
                addButton.textContent = t('friends.accept');
            }
        }
    }
    picture.src = user.picture ? user.picture : '/images/default-pp.png';
    const disconnectBtn = document.getElementById('disconnect-profile') as HTMLButtonElement | null;
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('authToken');
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
                    credentials: 'same-origin'
                });
            } catch (e) {
                console.warn('logout request failed', e);
            } finally {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('picture');
                router.navigate('/welcome');
                setTimeout(() => location.reload(), 50);
            }
        });
    }
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
    historyButton?.addEventListener('click', () => setHistoryPage(userData, games, userId, token));
    if (userData.friends != 2)
        addButton?.addEventListener('click', async () => {
            const data = await addUser(userId, token);
            console.log(`status == ${data.status}`)
            if (data.status === 1)
                addButton.textContent = t('friends.waiting');
            else if (data.status === 2)
                addButton.classList.add('hidden');
        });
}

export const setHistoryPage = (userData: any, games: [any], userId: string, token: string) => {
    render(historyPage());
    const user = userData.user;
    const mainDiv = document.getElementById('games-div') as HTMLDivElement;
    const userTitle = document.getElementById('user-title') as HTMLSpanElement;
    userTitle.textContent = `${user.username} ${t('user.historySuffix')}`;

    const returnButton = document.getElementById('return-button') as HTMLButtonElement;
    returnButton.addEventListener('click', () => setUserPage(userData, games, userId, token));
    games.forEach(game => {
        const gameDiv = document.createElement('div');
        const userScore = game.player1_id === parseInt(userId) ? game.score[0] : game.score[4];
        const oppScore = game.player1_id != parseInt(userId) ? game.score[0] : game.score[4];
        const oppPicture = game.player1_id != parseInt(userId)? game.player1_picture: game.player2_picture;
        const oppName = game.player1_id != parseInt(userId)? game.player1_username: game.player2_username;
        gameDiv.className = 'flex flex-col items-center justify-between border-2 border-black rounded-2xl mt-2';
        gameDiv.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="flex items-center">
                    <img src="${user.picture ? user.picture : '/images/default-pp.png'}" alt="user-picture" class="rounded-full w-16 h-16 m-8">
                    <span class="text-2xl text-slate-300">${user.username}</span>
                </div>
                <span class="text-3xl text-slate-300 m-4">${userScore} : ${oppScore}</span>
                <div class="flex items-center">
                    <span class="text-2xl text-slate-300">${oppName}</span>
                    <img src="${oppPicture ? oppPicture : '/images/default-pp.png'}" alt="opponent-picture" class="rounded-full w-16 h-16 m-8">
                </div>
            </div>
            <span class="text-slate-400 italic">${game.time}</span>`;
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
    setUserPage(userData, gamesData.games, params, token);
}