const GameManager = require('./GameManager');
// ...existing code...
// @ts-check
/** @param {import('fastify').FastifyInstance} fastify */
const game = async (fastify, options) => {
    
    const gameManager = new GameManager();

    fastify.get('/game/play', {websocket : true}, (connection, req) => {
        let playerIndex;
        let GameId;

        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log(data);
                if (data.type === 'join') {
                    GameId = data.roomId;
                    playerIndex = gameManager.joinGame(GameId, connection, data.name);
                    console.log(playerIndex);
                    if (playerIndex === 0)
                        connection.send(JSON.stringify({type: 'wait'}));
                    else if (playerIndex === -1)
                        connection.send(JSON.stringify({type: 'full'}));
                }
                else if (data.type === 'move') {
                    if (!GameId)
                        connection.send(JSON.stringify({type: 'error'}))
                    else {
                        const game = gameManager.game.get(GameId);
                        if (data.action === 'Down') {
                            if (data.dir === 'Up')
                                game.inputs[playerIndex].up = true;
                            else 
                                game.inputs[playerIndex].down = true;
                            // console.log('player id = ', playerIndex ,'upPressed = ', playerinput[playerIndex].up, ' downPressed = ', playerinput[playerIndex].down);
                        }
                        else {
                            if (data.dir === 'Up')
                                game.inputs[playerIndex].up = false;
                            else 
                                game.inputs[playerIndex].down = false;
                            // console.log('upPressed = ', playerinput[playerIndex].up, ' downPressed = ', playerinput[playerIndex].down);
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }

        })
    });
}

module.exports = game;