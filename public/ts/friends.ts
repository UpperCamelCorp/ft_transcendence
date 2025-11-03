import { router } from "./index.js"
import { render } from "./render.js";

const friendsPage = () => `
    <div class="bg-gradient-to-br from-gray-900 via-indigo-950 to-black p-12 rounded-2xl flex flex-col items-center max-w-3xl w-full max-h-screen">
        <div class="flex w-full justify-center items-center m-4">
            <img src="/svg/friends-icon.svg" alt="friends-icon" class="w-16 h-16 m-2">
            <span id="user-title" class="text-4xl font-bold text-white">User's Friends</span>
            <button id="invite-button" class="border border-[#334155] hover:border-[#475569] text-slate-200 px-6 py-3 m-2 rounded-lg">Invite</button>
        </div>
        <div id="friends-div" class="grid grid-cols-1 md:grid-cols-3 gap-3 justify-center items-center">
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

const renderFriends = (friendsList : any, mainDiv: HTMLDivElement, button: HTMLButtonElement) => {
    mainDiv.innerHTML = '';
    button.innerText = 'Invite';
    if (!friendsList.friends.length) {
        mainDiv.innerHTML = `
            <span class="text-2xl text-slate-300">No Friends Yet</span>
        `;
    }
    friendsList.friends.forEach(friend => {
        if (friend.status === 1) {
            mainDiv.innerHTML += `
            <a href="/user/${friend.friend_id}" class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
                <img src="${friend.friendPicture ? friend.friendPicture : '/images/default-pp.png'}" alt="profile-picture" class="h-12 w-12 rounded-full m-2">
                <span class="text-2xl text-slate-300">${friend.friendName} pending...</span>
            </a>`
        }
        else if (friend.status === 2) {
            mainDiv.innerHTML += `
            <a href="/user/${friend.friend_id}" class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
                <img src="${friend.friendPicture ? friend.friendsPicture : '/images/default-pp.png'}" alt="profile-picture" class="h-12 w-12 rounded-full m-2">
                <span class="text-2xl text-slate-300">${friend.friendName}</span>
            </a>`;
        }
    });
};

const renderPending = (friendsList: any, mainDiv: HTMLDivElement, button: HTMLButtonElement) => {
    mainDiv.innerHTML = '';
    if (!friendsList.pending.length) {
        mainDiv.innerHTML = `
            <span class="text-2xl text-slate-300">No Invitation Yet</span>
        `;
    }
    button.innerText = 'Friends'
    friendsList.pending.forEach(friend => {
        mainDiv.innerHTML += `
        <a href="/user/${friend.user_id}" class="flex items-center justify-center border-2 border-slate-700 rounded-2xl p-4">
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