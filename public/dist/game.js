export const gameInit = () => {
    const canva = document.getElementById('game');
    const container = canva.parentElement;
    if (canva && container) {
        canva.width = container.clientWidth - 10;
        canva.height = canva.width * (9 / 16);
    }
    const ctx = canva?.getContext('2d');
    if (ctx) {
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5]);
        ctx.moveTo(canva.width / 2, 0);
        ctx.lineTo(canva.width / 2, canva.height);
        ctx.stroke();
    }
};
