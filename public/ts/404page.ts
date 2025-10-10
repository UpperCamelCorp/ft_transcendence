import { render } from "./render.js";

const page404 = () => `
    <div class="max-w-xs w-full flex flex-col items-center bg-gradient-to-br from-[#18003C] to-[#142033] rounded-2xl shadow-lg border border-[#243241] p-8">
        <div class="m-2 p-4 ring ring-cyan-300 rounded-4xl">
            <h1 class="text-4xl text-white font-bold">404</h1>
        </div>
        <div class="m-2 p-4 flex flex-col items-center justify-center rounded-3xl border-2 border-gray-700">
            <span class="m-4 text-2xl text-slate-300">Are you lost ?</span>
            <p class="m-4 text-slate-300 italic">This page does not exist</p>
            <a href="/game" data-link class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg shadow">Go play</a>
        </div>
    </div>`;

export const notFound = () => {
    render(page404());
}