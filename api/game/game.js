const GameManager = require('./GameManager');
const client = require('prom-client');

const localActiveGauge = new client.Gauge({
    name: 'pong_local_active_games',
    help: 'Number of active local Pong games'
});
const localGamesStartedCounter = new client.Counter({
    name: 'pong_local_games_started_total',
    help: 'Total number of local Pong games started'
});

const usernameCheck = (username) => {
    const regex = new RegExp(/^[a-zA-Z0-9]+$/);
    return (regex.test(username) && username.length <= 10)
}

// @ts-check
/** @param {import('fastify').FastifyInstance} fastify */
const game = async (fastify, options) => {

    const gameManager = new GameManager(fastify.db);

    fastify.post('/api/metrics/local', async (req, rep) => {
        try {
            const { event } = req.body || {};
            if (event === 'start') {
                localGamesStartedCounter.inc();
                localActiveGauge.inc();
                return rep.code(200).send({ ok: true });
            } else if (event === 'stop') {
                localActiveGauge.dec();
                return rep.code(200).send({ ok: true });
            } else {
                return rep.code(400).send({ message: 'invalid event' });
            }
        } catch (e) {
            fastify.log.error('metrics error', e);
            return rep.code(500).send({ message: 'metrics error' });
        }
    });

    fastify.get('/game/play', {websocket : true}, (connection, req) => {
        let playerIndex;
        let gameId = -1;

        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                let token;
                if (data.type === 'join') {
                    console.log(data.roomId);
                    if (data.roomId > 9999 || data.roomId < 0) {
                        connection.send(JSON.stringify({type : 'error', error: 'Wrong RoomId'}));
                        connection.close();
                        return ;
                    }
                    try {
                        token = fastify.jwt.verify(data.token);
                        if (!usernameCheck(data.name)) {
                            connection.send(JSON.stringify({type: 'error', error: 'Invalid username'}));
                            connection.close();
                            return ;
                        }
                    } catch (e) {
                        console.log(e);
                        connection.send(JSON.stringify({type: 'error', error : 'Invalid JWT'}));
                        connection.close();
                        return ;
                    }
                    gameId = data.roomId;
                    playerIndex = gameManager.joinGame(gameId, connection, token.id, data.name, data.picture);
                    if (playerIndex === 0)
                        connection.send(JSON.stringify({type: 'wait'}));
                    else if (playerIndex === -1) {
                        connection.send(JSON.stringify({type: 'full'}));
                        connection.close();
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