import { setupSidebar } from "./sidebar.js";
import { setupHeader } from "./header.js";
import { notFound } from "./404page.js";
import { t } from "./i18n.js"; // added import

export default class Router {
    private routes: Map<string, () => void>;
    private dynamic: Map<string, (params: string) => void>;
    private cleanUp: Map<string, ()=> void | null>;

    constructor() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
        this.routes = new Map();
        this.cleanUp = new Map();
        this.dynamic = new Map();
    }

    private setNamePage(path : string) : void {
        // map route -> i18n key
        const map: Record<string, string> = {
            '/': 'header.title',
            '/welcome': 'router.welcome',
            '/login': 'login.title',
            '/signup': 'signup.title',
            '/game': 'sidebar.game',
            '/edit': 'edit.title',
            '/friends': 'sidebar.friends'
        };

        const key = map[path] ?? '';

        if (window.innerWidth >= 768) {
            const nameSpan = document.getElementById('page-name') as HTMLSpanElement;
            if (key && nameSpan)
                nameSpan.textContent = t(key);
            else if (nameSpan)
                nameSpan.textContent = '';
        }
        else {
            const titlePage = document.getElementById('title-page') as HTMLAnchorElement;
            if (key && titlePage)
                titlePage.textContent = t(key);
            else if (titlePage)
                titlePage.textContent = t('header.title');
        }
    }

    private handleDynamic(path: string): boolean {
        const matchPath = path.match(/\/[^\/]+/g);
        if (!matchPath)
            return false;
        const keyPath = matchPath[0];
        console.log('keypath = ', keyPath);
        const handler = this.dynamic.get(keyPath);
        if (handler) {
            if (matchPath[1]) {
                handler(matchPath[1].substring(1));
                return true;
            }
            else
                return false;
        }
        else
            return false;
    }

    private handleRoute() : void {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
        setupSidebar();
        setupHeader();
        if (handler){
            this.setNamePage(path);
            handler();
        } else {
            if (!this.handleDynamic(path)) {
                this.setNamePage('');
                notFound();
                console.log(`No route for ${path}`);
            }
        }
    }

    public setupLinkHandlers(): void {
        document.addEventListener('click', (e) => {
            const link = (e.target as HTMLElement).closest('[data-link]');
            if (link instanceof HTMLAnchorElement) {
                e.preventDefault();
                const path = link.getAttribute('href') || '/';
                this.navigate(path);
            }
        });
    }

    public add(path : string, handler : () => void) : void {
        this.routes.set(path, handler);
    }

    public addDynamic(path: string, handler: (params : string) => void) : void {
        this.dynamic.set(path, handler);
    }

    public addCleanUp(path: string, cleanUp: () => void | null) {
        this.cleanUp.set(path, cleanUp);
    }

    public navigate(path : string) : void {
        const cleanUp = this.cleanUp.get(window.location.pathname);
        if (cleanUp)
            cleanUp();
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    public loadcurrent() : void {
        this.handleRoute();
    }
}