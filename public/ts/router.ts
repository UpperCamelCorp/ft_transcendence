export default class Router {
    private routes: Map<string, () => void> = new Map();

    constructor() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
    }

    private handleRoute() : void {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
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

    public navigate(path : string) : void {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    public loadcurrent() : void {
        this.handleRoute();
    }
}