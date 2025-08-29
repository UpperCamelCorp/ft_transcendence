export const setupSidebar = () => {
    const menu = document.getElementById('slideMenu');
    const buttonMenu = document.getElementById('closeMenu');
    const openMenu = document.getElementById('openMenu');

    const toggleMenu = () =>{
        // sidebar
        menu?.classList.toggle('w-0');
        menu?.classList.toggle('md:w-22')
        menu?.classList.toggle('w-full');
        menu?.classList.toggle('md:w-54');
        //close sidebar
        buttonMenu?.classList.toggle('opacity-0');
        //logo and text
        const textBar = menu?.querySelectorAll('#text-ref');
        const logoBar = menu?.querySelectorAll('#logo-ref');
        textBar?.forEach(text =>{
            text.classList.toggle('opacity-100');
        })
        logoBar?.forEach(logo =>{
            logo.classList.toggle('w-6');
            logo.classList.toggle('h-6');
            logo.classList.toggle('w-9');
            logo.classList.toggle('h-9');
            logo.classList.toggle('translate-x-3')
        })
    }
    if (menu)
    {
        menu.addEventListener('pointerover', toggleMenu);
        menu.addEventListener('pointerout', toggleMenu);
        // menu.addEventListener('click', toggleMenu);
    }
    if (openMenu)
    {
        openMenu.addEventListener('click', toggleMenu);
    }
}