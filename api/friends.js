const { default: fastify } = require("fastify");
const {promisify} = require('util');

const friendsRoute = async (fastify, options) => {
    
    const dbAll = promisify(fastify.db.all.bind(fastify.db));
    const dbGet = promisify(fastify.db.get.bind(fastify.db));
    const dbRun = promisify(fastify.db.run.bind(fastify.db));

    fastify.get('/api/friends', {
    onRequest : [fastify.authenticate]
    }, async (req, rep) => {
        const userId = req.user.id;
        try {
            const friends = await dbAll(`SELECT 
                friend_id,
                status,
                f.username as friendName,
                f.picture as friendPicture 
                FROM friends
                JOIN users f on friends.friend_id = f.id
                WHERE user_id = ?`, [userId]);
            const pending = await dbAll(`SELECT
                user_id,
                status,
                f.username as friendName,
                f.picture as friendPicture
                FROM friends
                JOIN users f on friends.user_id = f.id
                WHERE friend_id = ? AND status = 1`, [userId]);
            return rep.code(200).send({friends, pending});
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: "Error try again later"});
        }
    });

    fastify.post('/api/friends/add/:userId', {
        onRequest : [fastify.authenticate]
    }, async (req, rep) => {
        const {userId} = req.params;
        const id = req.user.id;
        try {
            const status = await dbGet('SELECT status FROM friends WHERE user_id = ? AND friend_id = ?', [userId, id]);
            const reverseStatus = await dbGet('SELECT status FROM friends WHERE user_id = ? AND friend_id = ?', [id, userId]);

            if (!status && !reverseStatus) {
                dbRun('INSERT INTO friends(user_id, friend_id, status) VALUES( ?, ?, ?)', [id, userId, 1]);
                return rep.code(201).send({message: "Invite send", status: 1});
            }
            else if (reverseStatus && reverseStatus.status === 1) {
                return rep.code(200).send({message: "Invite already sent", status: 1});
            }
            else if (status.status === 1) {
                dbRun('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?', [2, userId, id]);
                dbRun('INSERT INTO friends(user_id, friend_id, status) VALUES(? , ?, ?)', [id, userId, 2]);
                return rep.code(200).send({message: "Friend added", status: 2});
            }
            else if (status.status === 2) {
                return rep.code(200).send({message: "Already friends", status : 2});
            }
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message : "Error try again later"});
        }
    });

    fastify.get('/status', {websocket: true}, (connection, req) => {
        let id;
            connection.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    if (!data.token)
                        connection.close();
                    const token = fastify.jwt.verify(data.token);
                    id = token.id;
                    fastify.connectedUsers.push(id);
                    console.log(token.username, token.id, 'online');
                } catch (e) {
                    connection.close();
                }
            });
            connection.on('close', () => {
                try {
                    if (id) {
                        const index = fastify.connectedUsers.indexOf(id);
                        fastify.connectedUsers.splice(index, 1);
                    }
                    console.log(id, 'offline');
                } catch (e) {
                    console.log(e);
                }
            });
    });
}

module.exports = friendsRoute;