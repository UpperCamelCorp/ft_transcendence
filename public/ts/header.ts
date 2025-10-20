import { router } from "./index.js";

let headerListener : boolean = false;

export const setupHeader = () => {
    const profilePicture = document.getElementById('profile-picture-header') as HTMLImageElement;
    const userPicture = localStorage.getItem('picture');
    const user = localStorage.getItem('user');
    const menu = document.getElementById('profile-menu') as HTMLDivElement;
    const searchBox = document.getElementById('user-search') as HTMLInputElement;
    const searchRes = document.getElementById('search-result') as HTMLDivElement;
    
    const menuHandler = () => {
        menu.classList.toggle('hidden');
    }

    if (!menu.classList.contains('hidden'))
        menuHandler();

    if (!searchRes.classList.contains('hidden')) {
        searchRes.classList.toggle('hidden');
        searchBox.value = '';
    }
    if (user) {
        menu.innerHTML = `
            <a href="/edit" data-link>
                <button class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg m-2">Edit</button>
            </a>
            <button id="disconnect" class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg m-2">Disconnect</button>
        `;
        const disconnectButton = document.getElementById('disconnect');
        disconnectButton?.addEventListener('click', () => {localStorage.clear(); setupHeader()});
    }
    else {
        menu.innerHTML = `
            <a href="/login" data-link>
                <button class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg m-2">Login</button>
            </a>
            <a href="/signup" data-link>
                <button class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg m-2">SignUp</button>
            </a>
        `;
    }
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
        searchBox.addEventListener('keydown', async (e) => {
            console.log('search');
            try {
                if (e.key === 'Enter') {
                    e.preventDefault();
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
                    const res = await rep.json();
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
                        noUser.textContent = 'No User Found';
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