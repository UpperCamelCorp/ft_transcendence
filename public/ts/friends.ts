import { router } from "./index.js"
import { render } from "./render.js";
import { t } from "./i18n.js";

interface Friend {
    user_id: number;
    friend_id: string | number;
    friendPicture?: string;
    friendName: string;
    status: number;
}

interface FriendsList {
    friends: Friend[];
    pending: Friend[];
}

const friendsPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full max-h-screen">
        <div class="flex w-full justify-between items-center max-w-5xl mb-12 pb-8 border-b border-slate-700">
            <div class="flex items-center gap-4">
                <img src="/svg/friends-icon.svg" alt="friends-icon" class="w-14 h-14 drop-shadow-lg">
                <span id="user-title" class="text-4xl font-bold bg-gradient-to-r from-slate-200 to-indigo-300 bg-clip-text text-transparent">User's Friends</span>
            </div>
            <button id="invite-button" class="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105">${t('friends.invite')}</button>
        </div>
        <div id="friends-div" class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        </div>
    </div>`;

const getFriends = async () => {
    const token = localStorage.getItem('authToken');
    if (!token)
        router.navigate('/login');
    try {
        const rep = await fetch('/api/friends', {
            method : 'GET',
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        });
        if (!rep.ok)
            router.navigate('/login');
        const friendsList = await rep.json();
        return friendsList;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const renderFriends = (friendsList : FriendsList, mainDiv: HTMLDivElement, button: HTMLButtonElement) => {
    mainDiv.innerHTML = '';
    button.innerText = t('friends.invite');
    if (!friendsList.friends.length) {
        mainDiv.innerHTML = `
            <span class="text-2xl text-slate-300">${t('friends.noFriends')}</span>
        `;
    }
    friendsList.friends.forEach((friend: Friend) => {
        if (friend.status === 1) {
            mainDiv.innerHTML += `
            <a href="/user/${friend.friend_id}" data-link class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
                <img src="${friend.friendPicture ? friend.friendPicture : '/images/default-pp.png'}" alt="profile-picture" class="h-12 w-12 rounded-full m-2">
                <span class="text-2xl text-slate-300">${friend.friendName} ${t('friends.pending')}</span>
            </a>`
        }
        else if (friend.status === 2) {
            mainDiv.innerHTML += `
            <a href="/user/${friend.friend_id}" data-link class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
                <img src="${friend.friendPicture ? friend.friendPicture : '/images/default-pp.png'}" alt="profile-picture" class="h-12 w-12 rounded-full m-2">
                <span class="text-2xl text-slate-300">${friend.friendName}</span>
            </a>`;
        }
    });
};

const renderPending = (friendsList: FriendsList, mainDiv: HTMLDivElement, button: HTMLButtonElement) => {
    mainDiv.innerHTML = '';
    if (!friendsList.pending.length) {
        mainDiv.innerHTML = `
            <span class="text-2xl text-slate-300">No Invitation Yet</span>
        `;
    }
    button.innerText = 'Friends'
    friendsList.pending.forEach((friend: Friend) => {
        mainDiv.innerHTML += `
        <a href="/user/${friend.user_id}" data-link class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
            <img src="${friend.friendPicture ? friend.friendPicture : '/images/default-pp.png'}" alt="profile-picture" class="h-12 w-12 rounded-full m-2">
            <span class="text-2xl text-slate-300">${friend.friendName}</span>
            <p class="text-slate-400 italic"></p>
        </a>`
    });
};

export const friends = async () => {
    render(friendsPage());
    const friendsList = await getFriends();
    const mainDiv = document.getElementById('friends-div') as HTMLDivElement;
    const inviteButton = document.getElementById('invite-button') as HTMLButtonElement;
    const userTitle = document.getElementById('user-title') as HTMLSpanElement;
    const user = JSON.parse(localStorage.getItem('user') || '');

    userTitle.textContent = `${user.username}'s Friends`;
    let isInvite = false;
    renderFriends(friendsList, mainDiv, inviteButton);
    inviteButton?.addEventListener('click', () => {
        if (isInvite){
            renderFriends(friendsList, mainDiv, inviteButton);
            isInvite = false;
        }
        else {
            renderPending(friendsList, mainDiv, inviteButton);
            isInvite = true;
        }
    })
}