import { router } from './index.js';
export const signupPage = () => `
    <div class="flex flex-col w-96 max-w-md bg-[#1E293B] rounded-3xl shadow-2xl backdrop-blur-lg border border-[#334155] text-white p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">Welcome</h2>
            <p class="text-[#94A3B8] text-sm">Sign up an account</p>
        </div>
        <form id="signupForm" class="space-y-6">
            <div class="space-y-2">
                <label for="username" class="block text-sm font-medium text-[#E2E8F0]">Username</label>
                <input 
                    type="text" 
                    id="username"
                    name="username"
                    placeholder="Enter your Username" 
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>            
            <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-[#E2E8F0]">Email</label>
                <input 
                    type="email" 
                    id="email"
                    name="email"
                    placeholder="Enter your email" 
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-[#E2E8F0]">Password</label>
                <input 
                    type="password" 
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    class="w-full px-4 py-3 bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                >
            </div>
             <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-[#E2E8F0]">Confirm Password</label>
                <input 
                    type="password" 
                    id="password"
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
export const signupResponse = (rep, result) => {
    console.log(rep.status);
    if (rep.ok)
        router.navigate('/login');
};
