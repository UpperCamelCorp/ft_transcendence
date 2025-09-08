const fastify = require('fastify')({logger: true});
const path = require('path');
const { setUpDataBase } = require('./db/database');

const initDb = async () => {
    const db = await setUpDataBase();
    fastify.decorate('db', db);
}

const start = async () => {
    try {
        await initDb();
        fastify.register(require('@fastify/static'), {
            root : path.join(__dirname, 'public'),
            prefix : '/'
        });
        fastify.register(require('@fastify/jwt'), {
            secret : process.env.JWTPASS
        })
        fastify.register(require('@fastify/multipart'))
        console.log(process.env.JWTPASS);
        fastify.register(require('./api/auth.js'));
        fastify.register(require('./api/user.js'));
        fastify.setNotFoundHandler((req, rep) => {
            rep.sendFile('static/index.html')
        });
        await fastify.listen({port: 3000, host: '0.0.0.0'});
    } catch (e){
        fastify.log.error(e);
    }
}

start();