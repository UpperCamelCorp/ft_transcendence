import { render } from "./render.js";

const page404 = () => `
    <div class="bg-slate-900/90 rounded-3xl shadow-2xl border border-indigo-700 p-10 flex flex-col items-center">
        <span class="text-8xl mb-4">🪐</span>
        <h1 class="text-6xl font-extrabold text-white tracking-widest mb-2 drop-shadow-lg">404</h1>
        <span class="text-xl text-slate-200 font-semibold mb-2">Lost in the Cosmos?</span>
        <p class="text-base text-slate-100 italic text-center mb-6">
            Oops! This page drifted out of orbit.<br>
            Let’s guide you back to the game universe.
        </p>
        <a href="/game" data-link class="inline-block bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:brightness-110 transition">
            Back to Game 🚀
        </a>
    </div>`;

export const notFound = () => {
    render(page404());
}