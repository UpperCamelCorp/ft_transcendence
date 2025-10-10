import { setupSidebar } from "./sidebar.js";
import { setupHeader } from "./header.js";

export default class Router {
    private routes: Map<string, () => void>;
    private cleanUp: Map<string, ()=> void | null>;

    constructor() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
        this.routes = new Map();
        this.cleanUp = new Map();
    }

    private handleRoute() : void {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
        setupSidebar();
        setupHeader();
        if (handler){
            handler();
        } else {
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