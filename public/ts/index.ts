import Router from './router.js';
import { setupSidebar } from './sidebar.js';
import { handleFormSubmit } from './handleSubmit.js';
import { render } from './render.js';
import { loginPage, loginResponse } from './loginPage.js';
import { signupPage, signupResponse } from './signupPage.js';

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

    router.loadcurrent();
})