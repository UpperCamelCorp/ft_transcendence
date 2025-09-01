import Router from './router.js';
import { setupSidebar } from './sidebar.js';
import { handleFormSubmit } from './handleSubmit.js';
import { render } from './render.js';
import { loginPage, loginResponse } from './loginPage.js';
import { signupPage, signupResponse } from './signupPage.js';
import { WelcomePage } from './welcomePage.js';

export const router = new Router;

document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();

    router.setupLinkHandlers();

    router.add("/login", () => { 
        render(loginPage());
        const loginForm = document.getElementById('loginForm');
        loginForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/login', loginResponse));
    });

    router.add('/signup', () => {
        render(signupPage());
        const signupForm = document.getElementById('signupForm');
        signupForm?.addEventListener('submit', (e) => handleFormSubmit(e, '/api/signup', signupResponse));
    });

    router.add('/', () => {
        render(WelcomePage());
        const userStored = localStorage.getItem('user');
        if (userStored) {
            try {
                const user = JSON.parse(userStored);
                const welcomeP = document.getElementById("user-welcome");
                if (welcomeP)
                {
                    welcomeP.textContent = `Welcome ` + user.username + "!"
                }
            } catch (e) {
                console.error("USER PARSING : ", e);
                localStorage.removeItem('user');
            }
        }
    });

    router.loadcurrent();
})