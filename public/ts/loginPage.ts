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

export const login = () => {
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
            window.history.replaceState({}, document.title, '/welcome');
            router.navigate('/welcome');
            return;
        } catch (e) {
            console.error('OAuth callback error:', e);
        }
    }

    if (error) {
        console.error('OAuth error:', error);
        // Show a visible error message to the user
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
}