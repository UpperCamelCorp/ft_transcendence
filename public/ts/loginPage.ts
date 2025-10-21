import { router } from './index.js'
import { render } from './render.js';
import { invalidError, clearError } from './errorUtils.js';
import { setupHeader } from './header.js';
import { handleFormSubmit } from './handleSubmit.js';

const loginPage = () => `
    <div class="flex flex-col w-96 max-w-md bg-gradient-to-br from-[#18003C] to-[#142033] rounded-3xl shadow-2xl backdrop-blur-lg border border-[#334155] text-white p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">Welcome Back</h2>
            <p class="text-[#94A3B8] text-sm">Sign in to your account</p>
        </div>
        <form id="loginForm" class="space-y-6">
            <div class="space-y-2">
                <div>
                    <label for="email" class="block text-sm font-medium text-[#E2E8F0]">Email</label>
                    <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    id="email-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="space-y-2">
                <div>
                    <label for="password" class="block text-sm font-medium text-[#E2E8F0]">Password</label>
                    <p id="password-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input
                    id="password-input"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="flex items-center justify-between text-sm">
                <label class="flex items-center">
                    <input type="checkbox" class="mr-2 rounded accent-[#3B82F6]">
                    <span class="text-[#94A3B8]">Remember me</span>
                </label>
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                Sign In
            </button>
        </form>

        <div class="my-6 flex items-center">
            <div class="flex-1 border-t border-[#475569]"></div>
            <span class="px-4 text-[#94A3B8] text-sm">OR</span>
            <div class="flex-1 border-t border-[#475569]"></div>
        </div>

        <a href="/login/google" class="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#1E293B] flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
        </a>

        <div class="text-center mt-6">
            <p class="text-[#94A3B8] text-sm">
                Don't have an account?
                <a href="/signup" data-link class="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">Sign up</a>
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
        invalidError(emailInput, emailError, "Wrong Credentials");
        invalidError(passwordInput, passwordError, "Wrong Credentials");
    }
    else if (rep.status == 400)
    {
        invalidError(emailInput, emailError, "Exemple: john@exemple.com");
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
            router.navigate('/');
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
        invalidError(emailInput, emailError, "Authentication failed. Please try again.");
        invalidError(passwordInput, passwordError, "Authentication failed. Please try again.");
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const emailError = document.getElementById('email-error') as HTMLParagraphElement;

    loginForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/login', loginResponse));
    emailInput.addEventListener('invalid', () => invalidError(emailInput, emailError, "Exemple: john@exemple.com"));
}