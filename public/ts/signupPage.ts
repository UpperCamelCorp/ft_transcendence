import {router} from './index.js'
import { render } from './render.js';
import { invalidError, clearError } from './errorUtils.js';
import { handleFormSubmit } from './handleSubmit.js';
import { t } from './i18n.js';

const signupPage = () => `
    <div class="flex flex-col w-96 max-w-md bg-gradient-to-br from-[#18003C] to-[#142033] rounded-3xl shadow-2xl backdrop-blur-lg border border-[#334155] text-white p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">${t('signup.title')}</h2>
            <p class="text-[#94A3B8] text-sm">${t('signup.subtitle')}</p>
        </div>
        <form id="signupForm" class="space-y-6">
            <div class="space-y-2">
                <div>
                    <label for="username" class="block text-sm font-medium text-[#E2E8F0]">${t('signup.usernameLabel')}</label>
                    <p id="username-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    type="text"
                    id="username"
                    name="username"
                    data-i18n-placeholder="signup.usernamePlaceholder"
                    placeholder="${t('signup.usernamePlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="space-y-2">
                <div>
                    <label for="email" class="block text-sm font-medium text-[#E2E8F0]">${t('signup.emailLabel')}</label>
                    <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    type="email"
                    id="email"
                    name="email"
                    data-i18n-placeholder="signup.emailPlaceholder"
                    placeholder="${t('signup.emailPlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="space-y-2">
                <div>
                    <label for="password" class="block text-sm font-medium text-[#E2E8F0]">${t('signup.passwordLabel')}</label>
                    <p id="password-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    type="password"
                    id="password"
                    name="password"
                    data-i18n-placeholder="signup.passwordPlaceholder"
                    placeholder="${t('signup.passwordPlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
             <div class="space-y-2">
                <div>
                    <label for="confirm-password" class="block text-sm font-medium text-[#E2E8F0]">${t('signup.confirmPasswordLabel')}</label>
                    <p id="confirm-password-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    data-i18n-placeholder="signup.confirmPasswordPlaceholder"
                    placeholder="${t('signup.confirmPasswordPlaceholder')}"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                ${t('signup.signUp')}
            </button>
        </form>
        <div class="text-center mt-6">
            <p class="text-[#94A3B8] text-sm">
                ${t('signup.haveAccount')}
                <a href="/login" data-link class="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">${t('signup.signInLink')}</a>
            </p>
        </div>
    </div>
`;

const signupResponse = (rep : Response, result : any) => {
    console.log(rep.status);
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
    const usernameError = document.getElementById('username-error') as HTMLParagraphElement;
    const emailError = document.getElementById('email-error') as HTMLParagraphElement;
    const passwordError = document.getElementById('password-error') as HTMLParagraphElement;
    const confirmPasswordError = document.getElementById('confirm-password-error') as HTMLParagraphElement;
    if (rep.ok)
    {
        clearError(emailInput, emailError);
        clearError(passwordInput, passwordError);
        clearError(confirmPasswordInput, confirmPasswordError);
        clearError(usernameInput, usernameError);
        router.navigate('/login');
    }
    if (rep.status === 400)
    {
        if (result.message === 'Invalid password')
            invalidError(passwordInput, passwordError, t('signup.errInvalidPassword'));
        else if (result.message === 'Invalid email')
            invalidError(emailInput, emailError, t('signup.errInvalidEmail'));
        else if (result.message === 'Password does not match')
            invalidError(confirmPasswordInput, confirmPasswordError, t('errors.passwordMismatch'));
        else if (result.message === 'No Username')
            invalidError(usernameInput, usernameError, "Username required");
        else if (result.message === 'Invalid username')
            invalidError(usernameInput, usernameError, "Username must be < 10 and contain only letters and numbers");
    }
}

export const signup = () => {
    render(signupPage());
    const signupForm = document.getElementById('signupForm');
    signupForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/signup', signupResponse));

}