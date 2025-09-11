const fastify = require('fastify')({logger: true});
const path = require('path');
const { setUpDataBase } = require('./db/database');
const { error } = require('console');

const initDb = async () => {
    const db = await setUpDataBase();
    fastify.decorate('db', db);
}

const initJwt =  () => {
    fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
    });
}

const start = async () => {
    try {
        await initDb();
        initJwt();
        fastify.register(require('@fastify/static'), {
            root : path.join(__dirname, 'public'),
            prefix : '/'
        });
        fastify.register(require('@fastify/jwt'), {
            secret : process.env.JWTPASS
        });
        fastify.setErrorHandler((e, req, rep) => {
            if (error.name === 'FastifyError' && error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
                rep.status(401).send({ error: "Missing Token" });
            } else if (error.name === 'FastifyError' && error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
                rep.status(401).send({ error: "Token Expired" });
            } else if (error.name === 'FastifyError' && error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
                rep.status(401).send({ error: "Invalid Token" });
            } else {
                rep.send(error);
            }
        });
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