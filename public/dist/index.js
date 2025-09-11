import Router from './router.js';
import { setupSidebar } from './sidebar.js';
import { login } from './loginPage.js';
import { signup } from './signupPage.js';
import { welcome } from './welcomePage.js';
import { game } from './pong/pong.js';
import { edit } from './editProfilePage.js';
export const router = new Router;
document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();
    router.setupLinkHandlers();
    router.add('/welcome', welcome);
    router.add("/login", login);
    router.add('/signup', signup);
    router.add('/game', game);
    router.add('/edit', edit);
    router.loadcurrent();
});
