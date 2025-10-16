import Router from './router.js';
import { login } from './loginPage.js';
import { signup } from './signupPage.js';
import { welcome } from './welcomePage.js';
import { game} from './pong/pong.js';
import { cleanOnlineGame } from './pong/onlineGame.js';
import { edit } from './editProfilePage.js';
import { user } from './user.js';

export const router = new Router;

document.addEventListener('DOMContentLoaded', () => {

    router.setupLinkHandlers();

    router.add('/welcome', welcome);
    router.add("/login", login);
    router.add('/signup', signup);
    router.add('/game', game);
    router.addCleanUp('/game', cleanOnlineGame);
    router.add('/edit', edit);

    router.addDynamic('/user', user);

    router.loadcurrent();
})