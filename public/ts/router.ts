import { setupSidebar } from "./sidebar.js";
import { setupHeader } from "./header.js";
import { notFound } from "./404page.js";

export default class Router {
    private routes: Map<string, () => void>;
    private cleanUp: Map<string, ()=> void | null>;

    constructor() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
        this.routes = new Map();
        this.cleanUp = new Map();
    }

    private setNamePage(name : string) : void {
        if (window.innerWidth >= 768) {
            const nameSpan = document.getElementById('page-name') as HTMLSpanElement;
            if (name) 
                nameSpan.textContent = name;
            else
                nameSpan.textContent = '';
        }
        else {
            const titlePage = document.getElementById('title-page') as HTMLAnchorElement;
            if (name)
                titlePage.textContent = name;
            else
                titlePage.textContent = 'Transcendence';
        }
    }

    private handleRoute() : void {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
        setupSidebar();
        setupHeader();
        if (handler){
            this.setNamePage(path.slice(1).toUpperCase());
            handler();
        } else {
            this.setNamePage('');
            notFound();
            console.log(`No route for ${path}`);
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