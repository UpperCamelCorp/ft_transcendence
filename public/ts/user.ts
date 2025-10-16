import { render } from "./render.js";
import { router } from "./index.js";

const userPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full">
        <div class="flex flex-col-reverse md:flex-row justify-center items-center mb-8">
            <img id="user-picture" src="../images/default-pp.png" alt="user picture" class="w-16 h-16 rounded-full md:mr-4">
            <h1 id="user-title" class="text-4xl text-white font-bold">Your Stats</h1>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 w-full">
            <!-- Stat 1 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">Win Rate</span>
                <span id="win-rate" class="text-5xl font-bold text-white mb-2">90%</span>
                <span class="text-sm text-slate-400">Last 30 days</span>
            </div>
            <!-- Stat 2 -->
            <div class="flex flex-col items-center bg-[#1a1a2e] rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
                <span class="text-2xl font-semibold text-cyan-300 mb-2">Games Played</span>
                <span class="text-5xl font-bold text-white mb-2">135</span>
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

export const user = () => {

}