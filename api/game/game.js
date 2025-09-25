const GameManager = require('./GameManager');
// ...existing code...
// @ts-check
/** @param {import('fastify').FastifyInstance} fastify */
const game = async (fastify, options) => {
    
    const gameManager = new GameManager();

    fastify.get('/game/play', {websocket : true}, (connection, req) => {
        let playerIndex;
        let gameId = -1;

        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'join') {
                    if (data.roomId > 9999 || data.roomId < 0)
                        return ;
                    gameId = data.roomId;
                    playerIndex = gameManager.joinGame(gameId, connection, data.name, data.picture);
                    if (playerIndex === 0)
                        connection.send(JSON.stringify({type: 'wait'}));
                    else if (playerIndex === -1) {
                        connection.send(JSON.stringify({type: 'full'}));
                        gameId = -1;
                    }
                }
                else if (data.type === 'move') {
                    if (gameId == -1)
                        connection.send(JSON.stringify({type: 'error'}));
                    else {
                        const game = gameManager.games.get(gameId);
                        if (data.action === 'Down') {
                            if (data.dir === 'Up')
                                game.inputs[playerIndex].up = true;
                            else 
                                game.inputs[playerIndex].down = true;
                        }
                        else {
                            if (data.dir === 'Up')
                                game.inputs[playerIndex].up = false;
                            else 
                                game.inputs[playerIndex].down = false;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });

        connection.on('close', () => {
            console.log('player ', playerIndex, ' left');
            if (gameId != -1) {
                gameManager.disconnect(gameId, playerIndex);
                gameId = -1;
            }
        })
    });
}

module.exports = game;