export const onlineGame = () => {
    const socket = new WebSocket(`ws://${window.location.host}/game/play`);
    const user = JSON.parse(localStorage.getItem('user') || '');
    socket.onopen = () => {
        try {
            socket.send(JSON.stringify({ name: user.username }));
        }
        catch (e) {
            console.log(e);
        }
    };
    socket.onmessage = (data) => {
        console.log(data.data);
    };
};
