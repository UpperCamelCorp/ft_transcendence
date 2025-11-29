import { render } from "./render.js";
import { t } from "./i18n.js";

const WelcomePage = () => `
    <section class="w-full px-6 py-12 max-w-4xl text-center">
        <div class="bg-gradient-to-br from-[#18003C] to-[#142033] rounded-2xl shadow-lg border border-[#243241] p-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight break-words">${t('welcome.title')}</h1>
            <p id="user-welcome" class="text-lg text-slate-300 mt-8 mb-10 mx-auto w-full max-w-xl text-center">
                ${t('welcome.notice').replace('{loginLink}', `<a href="/login" data-link class="underline hover:text-blue-400">${t('welcome.loginLink')}</a>`)}
            </p>
            <div id="features" class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div id="feature-game" class="p-4 bg-transparent rounded-lg flex flex-col items-center">
                    <h3 class="text-white font-semibold">${t('welcome.feature.online.title')}</h3>
                    <p class="text-sm text-slate-400 mt-1">${t('welcome.feature.online.desc')}</p>
                    <div class="mt-3 flex justify-center">
                        <a href="/game" data-link class="inline-block bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg">${t('pong.playPong')}</a>
                    </div>
                </div>
                <div id="feature-friends" class="p-4 bg-transparent rounded-lg flex flex-col items-center">
                    <h3 class="text-white font-semibold">${t('welcome.feature.friends.title')}</h3>
                    <p class="text-sm text-slate-400 mt-1">${t('welcome.feature.friends.desc')}</p>
                    <div class="mt-3 flex justify-center">
                        <a href="/friends" data-link class="inline-block bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg">${t('sidebar.friends')}</a>
                    </div>
                </div>

            </div>
        </div>
    </section>
    `;

export const welcome = () => {
    render(WelcomePage());
    const userStored = localStorage.getItem('user');
    const welcomeP = document.getElementById('user-welcome');

    if (userStored) {
        try {
            const user = JSON.parse(userStored);
            if (welcomeP) {
                welcomeP.textContent = `${t('welcome.personalGreeting')} ${user.username}!`;
            }
        } catch (e) {
            console.error("USER PARSING : ", e);
            localStorage.removeItem('user');
        }
    }
}