import Router from './router.js';
import { login } from './loginPage.js';
import { signup } from './signupPage.js';
import { welcome } from './welcomePage.js';
import { game, cleanGame} from './pong/pong.js';
import { edit } from './editProfilePage.js';
import { user } from './user.js';
import { friends } from './friends.js';
import { profile } from './profile.js';
import { initI18n } from './i18n.js';

export const router = new Router;

const initStatus = () => {
    const token = localStorage.getItem('authToken');
    if (!token)
        return;
    const ws = new WebSocket(`wss://${window.location.host}/status`);
    ws.onopen = () => {
        try {
            ws.send(JSON.stringify({token : token}));
        } catch (e) {
            console.log(e);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    await initI18n();
    initStatus();
    router.setupLinkHandlers();

    router.add('/', welcome);
    router.add("/login", login);
    router.add('/signup', signup);
    router.add('/game', game);
    router.addCleanUp('/game', cleanGame);
    router.add('/edit', edit);
    router.add('/friends', friends);
    router.add('/profile', profile);

    router.addDynamic('/user', user);

    router.loadcurrent();
})