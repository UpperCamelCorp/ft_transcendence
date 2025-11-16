import { router } from "./index.js";
import { render } from "./render.js";
import { userPage, historyPage, setUserPage, setHistoryPage} from "./user.js";
import { t } from "./i18n.js";


const getUser = async (token: string) => {
    try {
        const rep = await fetch('/api/user', {
            method: 'GET',
            headers : {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!rep.ok)
            return null;
        const data = await rep.json();
        return data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

const getGames = async (token: string) => {
    try {
        const rep = await fetch('/api/games', {
            method: 'GET',
            headers : {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!rep.ok)
            return null;
        const data = await rep.json();
        return data;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const profile = async () => {
    render(userPage());
    const token = localStorage.getItem('authToken');
    if (!token)
        return router.navigate('/login');
    const userData = await getUser(token);
    const gamesData = await getGames(token);
    if (!userData)
        return router.navigate('/');
    setUserPage(userData, gamesData.games, '', token);
}