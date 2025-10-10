import {router} from './index.js'
import { render } from './render.js';
import { invalidError, clearError } from './errorUtils.js';
import { handleFormSubmit } from './handleSubmit.js';

const signupPage = () => `
    <div class="flex flex-col w-96 max-w-md bg-gradient-to-br from-[#18003C] to-[#142033] rounded-3xl shadow-2xl backdrop-blur-lg border border-[#334155] text-white p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">Welcome</h2>
            <p class="text-[#94A3B8] text-sm">Sign up an account</p>
        </div>
        <form id="signupForm" class="space-y-6">
            <div class="space-y-2">
                <div>
                    <label for="username" class="block text-sm font-medium text-[#E2E8F0]">Username</label>
                    <p id="username-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input 
                    type="text" 
                    id="username"
                    name="username"
                    placeholder="Enter your Username" 
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>            
            <div class="space-y-2">
                <div>
                    <label for="email" class="block text-sm font-medium text-[#E2E8F0]">Email</label>
                    <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input 
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
                    type="password" 
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
             <div class="space-y-2">
                <div>
                    <label for="confirm-password" class="block text-sm font-medium text-[#E2E8F0]">Confirm Your Password</label>
                    <p id="confirm-password-error" class="text-red-700 italic text-xs hidden"></p>
                </div>
                <input 
                    type="password" 
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                Sign Up
            </button>
        </form>
        <div class="text-center mt-6">
            <p class="text-[#94A3B8] text-sm">
                You already have an account? 
                <a href="/login" data-link class="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">Sign in</a>
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
            invalidError(passwordInput, passwordError, 'Password must contain at least 8 characters');
        else if (result.message === 'Invalid email')
            invalidError(emailInput, emailError, "Exemple: john@exemple.com");
        else if (result.message === 'Password does not match')
            invalidError(confirmPasswordInput, confirmPasswordError, result.message);
        else if (result.message === 'No Username')
            invalidError(usernameInput, usernameError, "Username required");
    }
}

export const signup = () => {
    render(signupPage());
    const signupForm = document.getElementById('signupForm');
    signupForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/signup', signupResponse));
    
}