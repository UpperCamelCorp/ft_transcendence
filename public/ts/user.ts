import { render } from "./render.js";
import { router } from "./index.js";
import { t } from "./i18n.js";

export const userPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-4 md:p-6 rounded-2xl flex flex-col items-center max-w-4xl w-full max-h-[calc(100vh-5rem)] overflow-auto">
        
        <div class="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div class="flex items-center w-full md:w-auto">
                <div class="relative mr-3">
                    <div id="status" class="absolute left-8 top-0 rounded-full bg-red-500 w-2 h-2 md:w-4 md:h-4 z-50"></div>
                    <img id="user-picture" src="/images/default-pp.png" alt="user picture" class="w-16 h-16 md:w-24 md:h-24 rounded-full">
                </div>
                <div class="flex flex-col">
                    <h1 id="user-title" class="text-xl md:text-4xl font-bold text-white mb-1 break-words">-</h1>
                    <div class="flex items-center gap-2 text-sm text-slate-400">
                        <span id="user-subtitle" class="hidden md:inline"></span>
                    </div>
                </div>
            </div>

            <div id="profile-actions" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <div class="flex gap-2 w-full sm:w-auto">
                    <button id="add-button" class="w-full sm:w-auto bg-emerald-400 text-black font-semibold px-3 py-2 rounded-lg shadow hover:brightness-105 transition text-sm">${t('user.add')}</button>
                    <a href="/edit" data-link class="w-full sm:w-auto">
                        <button id="edit-profile" class="w-full sm:w-auto bg-[#0F172A] text-white font-semibold px-3 py-2 rounded-lg border border-slate-700 text-sm">${t('header.menu.edit')}</button>
                    </a>
                </div>
                <button id="disconnect-profile" class="w-full sm:w-auto bg-red-600 text-white font-semibold px-3 py-2 rounded-lg border border-red-700 text-sm">${t('header.menu.disconnect')}</button>
            </div>
        </div>

        <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-3 shadow-lg">
                <span class="text-lg font-semibold text-cyan-300 mb-1">${t('user.winRate')}</span>
                <span id="win-rate" class="text-2xl md:text-3xl font-bold text-white mb-1">-%</span>
                <span class="text-xs text-slate-400">${t('user.last30')}</span>
            </div>
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-3 shadow-lg">
                <span class="text-lg font-semibold text-cyan-300 mb-1">${t('user.totalMatches')}</span>
                <span id="total" class="text-2xl md:text-3xl font-bold text-white mb-1">-</span>
                <span class="text-xs text-slate-400">${t('user.totalMatches')}</span>
            </div>
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-3 shadow-lg">
                <span class="text-lg font-semibold text-cyan-300 mb-1">${t('user.gamesHistory')}</span>
                <button id="history-button" class="text-sm text-slate-300 underline">${t('user.historyClick')}</button>
            </div>
        </div>

        <div id="games-wrapper" class="w-full">
            <div id="games-div" class="flex flex-col gap-3 overflow-auto pr-2 max-h-[calc(100vh-18rem)]">
                
                <!-- games injected here -->
            </div>
        </div>
    </div>`;

export const historyPage = () => `
    <div id="history-div" class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-6 rounded-2xl flex flex-col  max-w-3xl w-full max-h-[calc(100vh-5rem)] overflow-auto">
        
        <div class="relative flex items-center justify-center m-3">
            <h1 id="user-title" class="text-3xl md:text-4xl text-white font-bold break-words">-</h1>
            <button id="return-button" class="absolute top-0 right-2 border border-[#334155] hover:border-[#475569] text-slate-200 px-4 py-2 rounded-lg text-sm">${t('user.return')}</button>
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

    profileActions?.classList.remove('hidden');
    const editBtn = document.getElementById('edit-profile') as HTMLButtonElement | null;
    const disconnectBtn = document.getElementById('disconnect-profile') as HTMLButtonElement | null;

    if (isOwnProfile) {
        addButton?.classList.add('hidden');
        editBtn?.classList.remove('hidden');
        disconnectBtn?.classList.remove('hidden');
    } else {
        addButton?.classList.remove('hidden');
        editBtn?.classList.add('hidden');
        disconnectBtn?.classList.add('hidden');
    }

    title.textContent = `${user.username} ${t('user.statsSuffix')}`;

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
                router.navigate('/');
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