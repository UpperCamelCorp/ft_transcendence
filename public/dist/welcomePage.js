export const WelcomePage = () => `
        <section class="w-full px-6 py-12 max-w-4xl text-center">
            <div class="bg-gradient-to-br from-[#0B1220] to-[#142033] rounded-2xl shadow-lg border border-[#243241] p-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to Transcendence</h1>
                <p id="user-welcome" class="text-lg text-slate-300 mb-6">
                    You will have to <a href="/login" data-link class="underline hover:text-blue-400">login</a> to be able to play
                </p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="/login" data-link class="inline-block bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg shadow">
                        Start
                    </a>
                    <a href="#about" data-link class="inline-block border border-[#334155] hover:border-[#475569] text-slate-200 px-6 py-3 rounded-lg">
                        More...
                    </a>
                </div>
                <div id="features" class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div class="p-4 bg-transparent rounded-lg">
                        <h3 class="text-white font-semibold">Online Game</h3>
                        <p class="text-sm text-slate-400 mt-1">Fast matches and tounament</p>
                    </div>
                    <div class="p-4 bg-transparent rounded-lg">
                        <h3 class="text-white font-semibold">Friends and Community</h3>
                        <p class="text-sm text-slate-400 mt-1">Make friends, add them and play private matches</p>
                    </div>
                    <div class="p-4 bg-transparent rounded-lg">
                        <h3 class="text-white font-semibold">Ranking</h3>
                        <p class="text-sm text-slate-400 mt-1">Follow your and your firends progressions .</p>
                    </div>
                </div>
            </div>
        </section>
        `;
