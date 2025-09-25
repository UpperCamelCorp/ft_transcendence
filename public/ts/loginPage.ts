import { router } from './index.js'
import { render } from './render.js';
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
                    <p id="email-error" class="text-red-700 italic text-xs hidden">Wrong Credentials</p>
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
                    <p id="password-error" class="text-red-700 italic text-xs hidden">Wrong Credentials</p>
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
        <div class="text-center mt-6">
            <p class="text-[#94A3B8] text-sm">
                Don't have an account? 
                <a href="/signup" data-link class="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">Sign up</a>
            </p>
        </div>
    </div>`;


const loginResponse = (rep: Response, result : any) => {
    console.log(rep.status);
    if (rep.ok)
    {
        try {
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            if (result.picture) {
                localStorage.setItem('picture', result.picture);
            }
            router.navigate('/');
        } catch (e) {
            console.log(e);
        }
    }
    if (rep.status == 401)
    {
        const email_input = document.getElementById('email-input');
        const pass_input = document.getElementById('password-input');
        const email_error = document.getElementById('email-error');
        const pass_error = document.getElementById('password-error');
        if (email_input) email_input.classList.replace('border-[#475569]', 'border-[#FF0000]');
        if (pass_input) pass_input.classList.replace('border-[#475569]', 'border-[#FF0000]');
        if (email_error) email_error.classList.remove('hidden');
        if (pass_error) pass_error.classList.remove('hidden');
    }
}

export const login = () => {
    render(loginPage());
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/login', loginResponse));
}