import { render } from "./render.js"
import { invalidError, clearError } from "./errorUtils.js";
import { handleMultiFormSubmit } from "./handleSubmit.js";
import { router } from "./index.js";
import { setupHeader } from "./header.js";

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
                    <p class="text-2xl text-slate-300">Edit Profile</p>
                    <div class="w-40 flex md:hidden items-center p-4">
                        <label for="picture" class="relative">
                            <img id="m-profile-picture" src="../images/default-pp.png" alt="profile-picture" class="w-24 h-24 rounded-full">
                            <img src="../svg/edit-logo.svg" alt="edit-picture" class="w-8 h-8 absolute bottom-0 left-24">
                            <input type="file" id="picture" name="picture" accept="image/*" class="hidden">
                        </label>
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <label for="username">Username</label>
                        <input type="text" name="username" id="username" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="email" class="block text-sm font-medium text-[#E2E8F0]">Email</label>
                            <p id="email-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="text" name="email" id="email" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">                        
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="password" class="block text-sm font-medium text-[#E2E8F0]">Password</label>
                            <p id="password-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="password" name="password" id="password" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">                        
                    </div>
                    <div class="flex flex-col justify-start text-[#E2E8F0]">
                        <div>
                            <label for="password-confirm" class="block text-sm font-medium text-[#E2E8F0]">Password Confirmation</label>
                            <p id="confirm-password-error" class="text-red-700 italic text-xs hidden"></p>
                        </div>
                        <input type="password" name="confirm" id="password-confirm" class="bg-[#334155] border border-[#475569] rounded-xl text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all">                        
                    </div>
                    <button type="submit" class="w-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#1E293B]">
                        Send
                    </button>
                </div>
            </div>
        </form>
    </div>`

export const edit = () => {
    render(editProfilePage());
    const editForm = document.getElementById('form-edit');
    const pictureInputDesktop = document.getElementById('input-picture') as HTMLInputElement;
    const pictureInputMobile = document.getElementById('picture') as HTMLInputElement;
    editForm?.addEventListener('submit', (e) => handleMultiFormSubmit(e, '/api/edit', editResponse));
    const handleImageChange = (input: HTMLInputElement) => {
        const userImage = input.files?.[0];
        if (userImage) {
            const imgInput = document.getElementById('profile-picture') as HTMLImageElement;
            const imgInputMobile = document.getElementById('m-profile-picture') as HTMLImageElement;
            if (imgInput)
                imgInput.src = URL.createObjectURL(userImage);
            if (imgInputMobile)
                imgInputMobile.src = URL.createObjectURL(userImage);
        }
    };
    
    pictureInputDesktop?.addEventListener('change', () => handleImageChange(pictureInputDesktop));
    pictureInputMobile?.addEventListener('change', () => handleImageChange(pictureInputMobile));
}


const editResponse = (rep: Response, res: any) => {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('password-confirm') as HTMLInputElement;
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
            invalidError(emailInput, emailError, "Example: john@example.com");
        else if (res.message === "Invalid password")
            invalidError(passwordInput, passwordError, "Password must contain at least 8 characters");
        else if (res.message === 'Password does not match')
            invalidError(confirmPasswordInput, confirmPasswordError, res.message);
    }
}