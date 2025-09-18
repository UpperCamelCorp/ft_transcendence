export default class Router {
    constructor() {
        window.addEventListener('popstate', this.handleRoute.bind(this));
        this.routes = new Map();
        this.cleanUp = new Map();
    }
    handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes.get(path);
        if (handler) {
            handler();
        }
        else {
            console.log(`No route for ${path}`);
        }
    }
    setupLinkHandlers() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link instanceof HTMLAnchorElement) {
                e.preventDefault();
                const path = link.getAttribute('href') || '/';
                this.navigate(path);
            }
        });
    }
    add(path, handler) {
        this.routes.set(path, handler);
    }
    addCleanUp(path, cleanUp) {
        this.cleanUp.set(path, cleanUp);
    }
    navigate(path) {
        const cleanUp = this.cleanUp.get(window.location.pathname);
        if (cleanUp)
            cleanUp();
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
    loadcurrent() {
        this.handleRoute();
    }
}
