import { render } from "./render.js"
import { invalidError, clearError } from "./errorUtils.js";
import { handleMultiFormSubmit } from "./handleSubmit.js";
import { router } from "./index.js";
import { setupHeader } from "./header.js";
import { t } from './i18n.js';

const editProfilePage= () => `
    <div class="max-w-4xl bg-gradient-to-br from-[#18003C] to-[#142033] rounded-2xl p-8">
        <form id="form-edit">
            <div class="w-full flex items-center justify-center text-white md:visible">
                <div class="w-40 hidden md:flex items-center p-4 pr-8">
                    <label for="input-picture" class="relative">
                        <img id="profile-picture" src="../images/default-pp.png" alt="profile-picture" class="w-24 h-24 rounded-full">
                        <img src="../svg/edit-logo.svg" alt="edit-picture" class="w-8 h-8 absolute bottom-0 -right-4">
                        <input id="input-picture" type="file" name="picture" accept="image/*" class="hidden">
                    </label>
                </div>
                <div class="flex flex-col items-center space-y-4 p-4">
                    <p class="text-2xl text-slate-300">${t('edit.title')}</p>
                    <div class="w-40 flex md:hidden items-center p-4">
                        <label for="picture" class="relative">
                            <img id="m-profile-picture" src="../images/default-pp.png" alt="profile-picture" class="w-24 h-24 rounded-full">
                            <img src="../svg/edit-logo.svg" alt="edit-picture" class="w-8 h-8 absolute bottom-0 left-24">
                            <input type="file" id="picture" name="picture" accept="image/*" class="hidden">
                        </label>
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="username">${t('edit.usernameLabel')}</label>
                            <p id="username-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="text" name="username" id="username" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="email" class="block text-sm font-medium text-[#E2E8F0]">${t('edit.emailLabel')}</label>
                            <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="text" name="email" id="email" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="password" class="block text-sm font-medium text-[#E2E8F0]">${t('edit.passwordLabel')}</label>
                            <p id="password-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="password" name="password" id="password" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="password-confirm" class="block text-sm font-medium text-[#E2E8F0]">${t('edit.passwordConfirmLabel')}</label>
                            <p id="confirm-password-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="password" name="confirm" id="password-confirm" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                        ${t('edit.send')}
                    </button>
                </div>
            </div>
        </form>

        <!-- 2FA UI -->
        <div class="mt-6 p-4 border rounded-2xl border-[#243241] bg-gradient-to-br from-[#0F172A] to-[#142033]">
            <h3 class="text-white text-lg font-semibold mb-2">${t('edit.twofa.title')}</h3>
            <p id="twofa-info" class="text-slate-300 text-sm mb-3">${t('edit.twofa.info')}</p>
            <div id="twofa-actions" class="flex gap-3">
                <button id="twofa-setup-btn" class="px-4 py-2 rounded bg-cyan-600 text-white">${t('edit.enable2fa') ?? 'Enable 2FA'}</button>
                <button id="twofa-disable-btn" class="px-4 py-2 rounded bg-red-600 text-white">${t('edit.disable2fa') ?? 'Disable 2FA'}</button>
            </div>
        </div>
    </div>`;

const initPicture = (classic: HTMLImageElement, mobile: HTMLImageElement) => {
    const picture = localStorage.getItem('picture');
    if (picture) {
        classic.src = picture;
        mobile.src = picture;
    }
}


export const edit = () => {
    render(editProfilePage());
    const editForm = document.getElementById('form-edit');
    const pictureInputDesktop = document.getElementById('input-picture') as HTMLInputElement;
    const pictureInputMobile = document.getElementById('picture') as HTMLInputElement;
    const imgInput = document.getElementById('profile-picture') as HTMLImageElement;
    const imgInputMobile = document.getElementById('m-profile-picture') as HTMLImageElement;

    initPicture(imgInput, imgInputMobile);
    editForm?.addEventListener('submit', (e) => handleMultiFormSubmit(e, '/api/edit', editResponse));
    const handleImageChange = (input: HTMLInputElement) => {
        const userImage = input.files?.[0];
        if (userImage) {
            if (imgInput)
                imgInput.src = URL.createObjectURL(userImage);
            if (imgInputMobile)
                imgInputMobile.src = URL.createObjectURL(userImage);
        }
    };

    pictureInputDesktop?.addEventListener('change', () => handleImageChange(pictureInputDesktop));
    pictureInputMobile?.addEventListener('change', () => handleImageChange(pictureInputMobile));

    // 2FA handlers
    const twofaSetupBtn = document.getElementById('twofa-setup-btn') as HTMLButtonElement | null;
    const twofaDisableBtn = document.getElementById('twofa-disable-btn') as HTMLButtonElement | null;

    const getAuthToken = () => localStorage.getItem('authToken');

    const show2faSetupModal = (qr: string, secret: string) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="max-w-lg w-full p-6 rounded-xl border border-slate-700 bg-gradient-to-br from-[#071026]/80 to-[#0b1724]/70 backdrop-blur-sm text-slate-200">
                <h3 class="text-white text-2xl mb-4">${t('edit.twofa.enableTitle')}</h3>
                <p class="text-slate-300 mb-4">${t('edit.twofa.setupInfo')}</p>

                <div class="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <div class="flex-shrink-0">
                        <div class="bg-white rounded p-2">
                            <img src="${qr}" alt="qr" class="w-36 h-36 object-contain">
                        </div>
                    </div>
                    <div class="flex-1 w-full">
                        <p class="text-sm text-slate-300 mb-2">${t('edit.twofa.secretLabel')}</p>
                        <code id="twofa-secret" class="block w-full p-2 bg-slate-800 text-sm font-mono rounded break-all select-all text-slate-100">${secret}</code>
                    </div>
                </div>

                <input id="twofa-verify-code" placeholder="${t('edit.twofa.placeholder')}" class="p-2 rounded w-full mb-4 bg-[#07172a] border border-slate-700 text-white" />
                <div class="flex justify-end gap-2">
                    <button id="twofa-cancel" class="px-4 py-2 rounded bg-gray-600 text-white">${t('edit.twofa.cancel')}</button>
                    <button id="twofa-confirm" class="px-4 py-2 rounded bg-cyan-600 text-white">${t('edit.twofa.confirm')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const cancel = overlay.querySelector('#twofa-cancel') as HTMLButtonElement;
        const confirm = overlay.querySelector('#twofa-confirm') as HTMLButtonElement;
        cancel.addEventListener('click', () => overlay.remove());
        confirm.addEventListener('click', async () => {
            const codeInput = overlay.querySelector('#twofa-verify-code') as HTMLInputElement;
            const code = codeInput.value.trim();
            if (!code) {
                alert('Enter the code from your authenticator app');
                return;
            }
            try {
                const token = getAuthToken();
                console.log('[2FA] enable - token from localStorage:', token);
                const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const resp = await fetch('/api/2fa/enable', {
                    method: 'POST',
                    headers,
                    credentials: 'same-origin',
                    body: JSON.stringify({ secret, token: code })
                });
                const text = await resp.text();
                let res: any = {};
                try { res = JSON.parse(text); } catch { res.message = text || ''; }
                if (resp.ok) {
                    alert('2FA enabled');
                    overlay.remove();
                } else if (resp.status === 401) {
                    alert('Session expired or missing token. Please login again.');
                    router.navigate('/login');
                } else {
                    console.error('2FA enable failed:', resp.status, res);
                    alert(res.message || `Failed to enable 2FA (status ${resp.status})`);
                }
            } catch (e) {
                console.error(e);
                alert('Error enabling 2FA');
            }
        });
    }

    const show2faDisableModal = () => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="max-w-md w-full p-6 rounded-xl border border-slate-700 bg-gradient-to-br from-[#071026]/80 to-[#0b1724]/70 backdrop-blur-sm text-slate-200">
                <h3 class="text-white text-2xl mb-4">${t('edit.twofa.disableTitle')}</h3>
                <p class="text-slate-300 mb-4">${t('edit.twofa.disableInfo')}</p>
                <input id="twofa-disable-code" placeholder="${t('edit.twofa.placeholder')}" class="p-2 rounded w-full mb-4 bg-[#07172a] border border-slate-700 text-white placeholder-[#94A3B8]" />
                <div class="flex justify-end gap-2">
                    <button id="twofa-disable-cancel" class="px-4 py-2 rounded bg-gray-600 text-white">${t('edit.twofa.cancel')}</button>
                    <button id="twofa-disable-confirm" class="px-4 py-2 rounded bg-red-600 text-white">${t('edit.twofa.disableConfirm')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const cancel = overlay.querySelector('#twofa-disable-cancel') as HTMLButtonElement;
        const confirm = overlay.querySelector('#twofa-disable-confirm') as HTMLButtonElement;
        cancel.addEventListener('click', () => overlay.remove());
        confirm.addEventListener('click', async () => {
            const codeInput = overlay.querySelector('#twofa-disable-code') as HTMLInputElement;
            const code = codeInput.value.trim();
            if (!code) {
                alert('Enter the code from your authenticator app');
                return;
            }
            try {
                const token = getAuthToken();
                console.log('[2FA] disable - token from localStorage:', token);
                const headers: Record<string,string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const resp = await fetch('/api/2fa/disable', {
                    method: 'POST',
                    headers,
                    credentials: 'same-origin',
                    body: JSON.stringify({ token: code })
                });
                const text = await resp.text();
                let res: any = {};
                try { res = JSON.parse(text); } catch { res.message = text || ''; }
                if (resp.ok) {
                    alert('2FA disabled');
                    overlay.remove();
                } else if (resp.status === 401) {
                    alert('Session expired. Please login again.');
                    router.navigate('/login');
                } else {
                    console.error('2FA disable failed:', resp.status, res);
                    alert(res.message || `Failed to disable 2FA (status ${resp.status})`);
                }
            } catch (e) {
                console.error(e);
                alert('Error disabling 2FA');
            }
        });
    }

    twofaSetupBtn?.addEventListener('click', async () => {
        try {
            const token = getAuthToken();
            console.log('[2FA] setup - token from localStorage:', token);
            const headers: Record<string,string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const resp = await fetch('/api/2fa/setup', {
                method: 'GET',
                headers,
                credentials: 'same-origin'
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                alert(err.message || 'Failed to start 2FA setup');
                return;
            }
            const data = await resp.json();
            show2faSetupModal(data.qr, data.secret);
        } catch (e) {
            console.error(e);
            alert('Error fetching 2FA setup');
        }
    });

    twofaDisableBtn?.addEventListener('click', () => show2faDisableModal());

}


const editResponse = (rep: Response, res: any) => {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('password-confirm') as HTMLInputElement;
    const usernameError = document.getElementById('username-error') as HTMLParagraphElement;
    const emailError = document.getElementById('email-error') as HTMLParagraphElement;
    const passwordError = document.getElementById('password-error') as HTMLParagraphElement;
    const confirmPasswordError = document.getElementById('confirm-password-error') as HTMLParagraphElement;
    console.log(rep.status);
    if (rep.ok) {
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);
        clearError(confirmPasswordInput, confirmPasswordError);
        try {
            localStorage.setItem('authToken', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            if (res.picture) {
                localStorage.setItem('picture', res.picture);
            }
            setupHeader();
            router.navigate('/');
        } catch (e) {
            console.log(e);
        }
    }
    else if (rep.status === 401)
        router.navigate('/login');
    else if (rep.status === 400)
    {
        if (res.message === 'Invalid email')
            invalidError(emailInput, emailError, t('edit.errInvalidEmail'));
        else if (res.message === "Invalid password")
            invalidError(passwordInput, passwordError, t('edit.errInvalidPassword'));
        else if (res.message === 'Password does not match')
            invalidError(confirmPasswordInput, confirmPasswordError, t('errors.passwordMismatch'));
        else if (res.message === 'Email already exists')
            invalidError(emailInput, emailError, res.message);
        else if (res.message.includes('Username'))
            invalidError(usernameInput, usernameError, res.message);
        else if (res.message.includes('Invalid file type') || res.message.includes('File too large')) {
            alert(res.message);
            const pictureInputDesktop = document.getElementById('input-picture') as HTMLInputElement;
            const pictureInputMobile = document.getElementById('picture') as HTMLInputElement;
            if (pictureInputDesktop) pictureInputDesktop.value = '';
            if (pictureInputMobile) pictureInputMobile.value = '';
        }
    }
}