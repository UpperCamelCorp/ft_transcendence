import { router } from './index.js'
import { render } from './render.js';
import { invalidError, clearError } from './errorUtils.js';
import { setupHeader } from './header.js';
import { handleFormSubmit } from './handleSubmit.js';
import { t } from './i18n.js';

const loginPage = () => `
    <div class="flex flex-col w-96 max-w-md bg-gradient-to-br from-[#18003C] to-[#142033] rounded-3xl shadow-2xl backdrop-blur-lg border border-[#334155] text-white p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">${t('login.title')}</h2>
            <p class="text-[#94A3B8] text-sm">${t('login.subtitle')}</p>
        </div>
        <form id="loginForm" class="space-y-6">
            <div class="space-y-2">
                <div>
                    <label for="email" class="block text-sm font-medium text-[#E2E8F0]">${t('login.emailLabel')}</label>
                    <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    id="email-input"
                    type="email"
                    id="email"
                    name="email"
                    data-i18n-placeholder="login.emailPlaceholder"
                    placeholder="${t('login.emailPlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="space-y-2">
                <div>
                    <label for="password" class="block text-sm font-medium text-[#E2E8F0]">${t('login.passwordLabel')}</label>
                    <p id="password-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    id="password-input"
                    type="password"
                    id="password"
                    name="password"
                    data-i18n-placeholder="login.passwordPlaceholder"
                    placeholder="${t('login.passwordPlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="flex items-center justify-between text-sm">
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 rounded accent-[#3B82F6]">
                    <span class="text-[#94A3B8]">${t('login.remember')}</span>
                </label>
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                ${t('login.signIn')}
            </button>
        </form>

        <div class="my-6 flex items-center">
            <div class="flex-1 border-t border-[#475569]"></div>
            <span class="px-4 text-[#94A3B8] text-sm">${t('login.or')}</span>
            <div class="flex-1 border-t border-[#475569]"></div>
        </div>

        <a href="/login/google" class="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#1E293B] flex items-center justify-center">
            <!-- svg -->
            ${t('login.continueWithGoogle')}
        </a>

        <div class="text-center mt-6">
            <p class="text-[#94A3B8] text-sm">
                ${t('login.noAccount')}
                <a href="/signup" data-link class="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">${t('login.signUpLink')}</a>
            </p>
        </div>
    </div>`;

const loginResponse = (rep: Response, result : any) => {
    console.log(rep.status);
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    const emailError = document.getElementById('email-error') as HTMLParagraphElement;
    const passwordError = document.getElementById('password-error') as HTMLParagraphElement;
    if (rep.ok)
    {
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);
        try {
            if (result.twofa) {
                show2faPrompt(result.tempToken);
                return;
            }
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            if (result.picture) {
                localStorage.setItem('picture', result.picture);
            }
            setupHeader();
            router.navigate('/');
        } catch (e) {
            console.log(e);
        }
    }
    else if (rep.status == 401)
    {
        invalidError(emailInput, emailError, t('login.errWrongCredentials'));
        invalidError(passwordInput, passwordError, t('login.errWrongCredentials'));
    }
    else if (rep.status == 400)
    {
        invalidError(emailInput, emailError, t('login.errInvalidEmail'));
    }
}

export const login = async () => {
    render(loginPage());

    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    const picture = urlParams.get('picture');
    const error = urlParams.get('error');

    if (token && user) {
        try {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', decodeURIComponent(user));
            if (picture) {
                localStorage.setItem('picture', decodeURIComponent(picture));
            }
            setupHeader();
            window.history.replaceState({}, document.title, '/');
            setTimeout(() => {
                router.navigate('/');
            }, 100);
            return;
        } catch (e) {
            console.error('OAuth callback error:', e);
        }
    }

    if (error) {
        console.error('OAuth error:', error);
        const emailInput = document.getElementById('email-input') as HTMLInputElement;
        const passwordInput = document.getElementById('password-input') as HTMLInputElement;
        const emailError = document.getElementById('email-error') as HTMLParagraphElement;
        const passwordError = document.getElementById('password-error') as HTMLParagraphElement;
        invalidError(emailInput, emailError, t('login.errOAuthFail'));
        invalidError(passwordInput, passwordError, t('login.errOAuthFail'));
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const emailError = document.getElementById('email-error') as HTMLParagraphElement;

    loginForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/login', loginResponse));
    emailInput.addEventListener('invalid', () => invalidError(emailInput, emailError, t('login.errInvalidEmail')));

    if (!token && !error) {
        try {
            const resp = await fetch('/api/session', { method: 'GET', credentials: 'same-origin' });
             if (resp.ok) {
                 const data = await resp.json();
                 localStorage.setItem('authToken', data.token);
                 localStorage.setItem('user', JSON.stringify(data.user));
                 if (data.user.picture) localStorage.setItem('picture', data.user.picture);
                 setupHeader();
                 window.history.replaceState({}, document.title, '/');
                 setTimeout(() => router.navigate('/'), 100);
                 return;
             }
        } catch (e) {
            console.error('session fetch failed', e);
        }
    }
}

export const show2faPrompt = (tempToken: string) => {
    const prev = document.getElementById('twofa-overlay');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'twofa-overlay';
    overlay.className = 'fixed inset-0 flex items-center justify-center z-[99999]';
    overlay.innerHTML = `
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative w-full max-w-sm p-6 rounded-xl bg-[#0b1220] text-white border border-slate-700">
             <h3 class="text-xl font-semibold mb-2">${t('login.twofa.title')}</h3>
             <p class="text-sm text-slate-600 mb-4">${t('login.twofa.info')}</p>
             <input id="twofa-code" inputmode="numeric" pattern="[0-9]*" class="p-2 rounded w-full mb-4 bg-[#07172a] text-white placeholder-[#cbd5e1] border border-slate-700" placeholder="${t('login.twofa.placeholder')}" />
             <div class="flex justify-end gap-2">
                 <button id="twofa-cancel" class="px-4 py-2 rounded bg-gray-200 text-black">${t('login.twofa.cancel')}</button>
                 <button id="twofa-submit" class="px-4 py-2 rounded bg-cyan-600 text-white">${t('login.twofa.verify')}</button>
             </div>
             <p id="twofa-error" class="text-sm text-red-600 mt-3 hidden"></p>
         </div>
     `;
    document.body.appendChild(overlay);

    const codeInput = document.getElementById('twofa-code') as HTMLInputElement | null;
    codeInput?.focus();

    const submit = document.getElementById('twofa-submit') as HTMLButtonElement | null;
    const cancel = document.getElementById('twofa-cancel') as HTMLButtonElement | null;
    const errorP = document.getElementById('twofa-error') as HTMLParagraphElement | null;

    submit?.addEventListener('click', async () => {
        const code = (document.getElementById('twofa-code') as HTMLInputElement).value.trim();
        if (!code) {
            if (errorP) { errorP.textContent = t('login.twofa.errNoCode'); errorP.classList.remove('hidden'); }
            return;
        }
        try {
            const resp = await fetch('/api/2fa/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, token: code }),
                credentials: 'same-origin'
            });
            const text = await resp.text();
            let res: any = {};
            try { res = JSON.parse(text); } catch { res.message = text || ''; }
            if (resp.ok) {
                localStorage.setItem('authToken', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                if (res.picture) localStorage.setItem('picture', res.picture);
                overlay.remove();
                location.href = '/';
            } else {
                if (errorP) { errorP.textContent = res.message || t('login.twofa.errInvalid'); errorP.classList.remove('hidden'); }
                console.warn('[2FA] verify failed', resp.status, res);
            }
        } catch (e) {
            console.error('[2FA] verify error', e);
            if (errorP) { errorP.textContent = t('login.twofa.errNetwork'); errorP.classList.remove('hidden'); }
        }
    });

    cancel?.addEventListener('click', () => overlay.remove());
}