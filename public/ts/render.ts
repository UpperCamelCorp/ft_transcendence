export const render = (html: string) => {
    const main = document.getElementById('main');
    if (main){
        main.innerHTML = html;
    }
}