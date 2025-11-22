import { router } from "./index.js";
import { t, initI18n, setLocale, getLocale } from "./i18n.js";

let headerListener : boolean = false;

const wireLangButtons = (menu: HTMLDivElement) => {
    const newLangContainer = menu.querySelector('#lang-select') as HTMLDivElement | null;
    if (!newLangContainer) return;
    const buttons = Array.from(newLangContainer.querySelectorAll<HTMLButtonElement>('button[data-locale]'));
    const applyActive = () => {
        const cur = getLocale();
        buttons.forEach(b => {
            if (b.dataset.locale === cur) {
                b.classList.add('ring-2','ring-cyan-400','opacity-100');
            } else {
                b.classList.remove('ring-2','ring-cyan-400','opacity-100');
            }
        });
    }
    applyActive();
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const locale = btn.dataset.locale;
            if (!locale) return;
            await setLocale(locale);
            router.loadcurrent();
            setupHeader();
        });
    });
}

export const setupHeader = () => {
    const profilePicture = document.getElementById('profile-picture-header') as HTMLImageElement;
    const userPicture = localStorage.getItem('picture');
    const user = localStorage.getItem('user');
    const menu = document.getElementById('profile-menu') as HTMLDivElement;
    const searchBox = document.getElementById('user-search') as HTMLInputElement;
    const searchRes = document.getElementById('search-result') as HTMLDivElement;
    const langSelect = document.getElementById('lang-select') as HTMLSelectElement;

    if (searchBox) {
        searchBox.placeholder = t('header.searchPlaceholder');
    }

    if (langSelect) {
        langSelect.value = getLocale();
        langSelect.addEventListener('change', async () => {
            await setLocale(langSelect.value);
            router.loadcurrent();
            setupHeader();
        });
    }

    const menuHandler = () => {
        menu.classList.toggle('hidden');
    }

    if (!menu.classList.contains('hidden'))
        menuHandler();

    if (!searchRes.classList.contains('hidden')) {
        searchRes.classList.toggle('hidden');
        searchRes.innerHTML = '';
        searchBox.value = '';
    }

    if (user) {
        menu.innerHTML = `
            <a href="/profile" data-link class="w-full block">
                <button class="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg mb-2 text-left">${t('header.menu.profile')}</button>
            </a>
            <a href="/friends" data-link class="w-full block">
                <button class="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg mb-2 text-left">${t('header.menu.friends')}</button>
            </a>
            <div class="mt-2 px-2 w-full">
                <label class="text-slate-300 text-sm mr-2">${t('header.lang')}</label>
                <div id="lang-select" class="flex space-x-2 mt-2">
                    <button data-locale="en" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇬🇧</button>
                    <button data-locale="fr" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇫🇷</button>
                    <button data-locale="jp" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇯🇵</button>
                </div>
            </div>
        `;
    } else {
        menu.innerHTML = `
            <a href="/login" data-link class="w-full block">
                <button class="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg mb-2 text-left">${t('header.menu.login')}</button>
            </a>
            <a href="/signup" data-link class="w-full block">
                <button class="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-4 py-2 rounded-lg mb-2 text-left">${t('header.menu.signup')}</button>
            </a>
            <div class="mt-2 px-2 w-full">
                <label class="text-slate-300 text-sm mr-2">${t('header.lang')}</label>
                <div id="lang-select" class="flex space-x-2 mt-2">
                    <button data-locale="en" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇬🇧</button>
                    <button data-locale="fr" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇫🇷</button>
                    <button data-locale="jp" class="lang-btn p-1 rounded-md text-2xl hover:scale-105 transition">🇯🇵</button>
                </div>
            </div>
        `;
    }
    wireLangButtons(menu);

    if (profilePicture) {
        if (userPicture) {
            profilePicture.src = userPicture;
        }
        else {
            profilePicture.src = '../images/default-pp.png';
        }
    }
    if (!headerListener) {
        profilePicture.addEventListener('click', menuHandler);
        searchBox.addEventListener('input', async (e) => {
            console.log('search');
            try {
                searchRes.innerHTML = '';
                if (searchBox.value.trim().length >= 3) {
                    const username = searchBox.value.trim();
                    const token = localStorage.getItem('authToken');
                    if (!token)
                        return router.navigate('/login');
                    const rep = await fetch('/api/search', {
                        method : 'POST',
                        headers : {
                            'Content-Type' : 'application/json',
                            'Authorization' : `Bearer ${token}`
                        },
                        body : JSON.stringify({username})
                    });
                    const res : [any] = await rep.json();
                    console.log(res);
                    searchRes.innerHTML = '';
                    if (searchRes.classList.contains('hidden'))
                        searchRes?.classList.toggle('hidden');
                    if (res.length) {
                        res.forEach(user => {
                            const newUser = document.createElement('a');
                            newUser.href = `/user/${user.id}`;
                            newUser.setAttribute('data-link', '');
                            newUser.className = "flex items-center justify-start";
                            newUser.innerHTML = `
                            <img src="${user.picture ? user.picture : '/images/default-pp.png'}" alt="user-picture" class="w-8 h-8 rounded-full m-2">
                            <span>${user.username}</span>`;
                            searchRes?.appendChild(newUser);
                        });
                    }
                    else {
                        const noUser = document.createElement('span');
                        noUser.textContent = t('header.search.noUser');
                        noUser.className = 'text-slate-300 font-bold italic m-4'
                        searchRes?.appendChild(noUser);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        headerListener = true;
    }
}