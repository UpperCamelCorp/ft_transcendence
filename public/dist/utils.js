export const render = (html) => {
    const main = document.getElementById('main');
    if (main) {
        main.innerHTML = html;
    }
};
