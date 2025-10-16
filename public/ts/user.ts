import { render } from "./render.js";
import { router } from "./index.js";

const userPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full">
        <div class="flex flex-col-reverse md:flex-row justify-center items-center mb-8">
            <img id="user-picture" src="../images/default-pp.png" alt="user picture" class="w-16 h-16 rounded-full md:mr-4">
            <h1 id="user-title" class="text-4xl text-white font-bold">- Stats</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 w-full">
            <!-- Stat 1 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">Win Rate</span>
                <span id="win-rate" class="text-5xl font-bold text-white mb-2">-%</span>
                <span class="text-sm text-slate-400">Last 30 days</span>
            </div>
            <!-- Stat 2 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">Games Played</span>
                <span id="total" class="text-5xl font-bold text-white mb-2">-</span>
                <span class="text-sm text-slate-400">Total matches</span>
            </div>
            <!-- Stat 3 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">Games History</span>
                <a id="history-link" href="#" data-link class="flex h-full items-center">
                    <span class="text-sm text-slate-400">Click here to see</span>
                </a>
            </div>
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
    const title = document.getElementById('user-title') as HTMLHeadingElement;
    title.textContent = `${user.username}'s Stats`;
    if (games) {
        const id = parseInt(userId);
        const winRate = document.getElementById('win-rate') as HTMLSpanElement;
        const total = document.getElementById('total') as HTMLSpanElement;
        let win = 0;
        games.forEach(game => {
            if (game.winner === id)
                win++;
        });
        winRate.textContent = `${(win * 100) / games.length}%`;
        total.textContent = `${games.length}`;
    }
}

export const user = async (params: string) => {
    const token = localStorage.getItem('authToken');
    if (!token)
        return router.navigate('/login');
    const userData = await getUser(params, token);
    const gamesData = await getGames(params, token);
    if (!userData)
        return router.navigate('/');
    render(userPage());
    setUserPage(userData, gamesData, params);
}