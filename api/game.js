// ...existing code...
// @ts-check
/** @param {import('fastify').FastifyInstance} fastify */
const game = async (fastify, options) => {

    let player = null;
    
    fastify.get('/game/play', {websocket : true}, (connection, req) => {
        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                connection.send(`hello ${data.name}`);
            } catch (e) {
                console.log(e);
            }

        })
    });
}

module.exports = game;