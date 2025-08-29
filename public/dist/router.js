export default class Router {
    constructor() {
        this.routes = new Map();
        window.addEventListener('popstate', this.handleRoute.bind(this));
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
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
    loadcurrent() {
        this.handleRoute();
    }
}
