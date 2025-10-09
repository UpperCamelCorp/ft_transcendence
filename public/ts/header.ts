import { router } from "./index";

let pictureListener : boolean = false;

export const setupHeader = () => {
    const profilePicture = document.getElementById('profile-picture-header') as HTMLImageElement;
    const userPicture = localStorage.getItem('picture');
    const user = localStorage.getItem('user');
    const menu = document.getElementById('profile-menu') as HTMLDivElement;
    const menuHandler = () => {
        console.log('click');
        menu.classList.toggle('hidden');
    }
    if (user) {
        menu.innerHTML = `
            <a href="/edit" data-link>
                <button class="bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold px-6 py-3 rounded-lg m-2">edit</button>
            </a>
        `;
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
    }
    if (!pictureListener) {
        profilePicture.addEventListener('click', menuHandler);
        pictureListener = true;
    }
}