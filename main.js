const fastify = require('fastify')({logger: true});
const path = require('path');
const { setUpDataBase } = require('./db/database');
const { error } = require('console');
const client = require('prom-client');

client.collectDefaultMetrics({ timeout: 5000 });

const initDb = async () => {
    const db = await setUpDataBase();
    fastify.decorate('db', db);
}

const initJwt =  () => {
    fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (e) {
        if (e.name === 'FastifyError' && e.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
            reply.code(401).send({error: "Missing Token" });
        } else if (e.name === 'FastifyError' && e.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
            reply.code(401).send({error: "Token Expired" });
        } else if (e.name === 'FastifyError' && e.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
            reply.code(401).send({error: "Invalid Token" });
        } else {
            reply.code(401).send({error: 'Error'});
        }
    }
    });
}

const initUsersStatus = () => {
    const connectedUsers = [];
    fastify.decorate('connectedUsers', connectedUsers);
}

const start = async () => {
    try {
        await initDb();
        initJwt();
        initUsersStatus();
        fastify.register(require('@fastify/static'), {
            root : path.join(__dirname, 'public'),
            prefix : '/'
        });
        fastify.register(require('@fastify/jwt'), {
            secret : process.env.JWTPASS
        });

        fastify.register(require('@fastify/cookie'), {
            secret: process.env.COOKIE_SECRET || undefined
        });

        const MAX_UPLOAD_MB = 5;
        fastify.register(require('@fastify/multipart'), {
            limits: {
                fileSize: MAX_UPLOAD_MB * 1024 * 1024
            },
        });
        fastify.register(require('@fastify/websocket'));

        // Register OAuth2 plugin
        fastify.register(require('@fastify/oauth2'), {
            name: 'googleOAuth2',
            scope: ['profile', 'email'],
            credentials: {
                client: {
                    id: process.env.GOOGLE_CLIENT_ID,
                    secret: process.env.GOOGLE_CLIENT_SECRET
                },
                auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION
            },
            startRedirectPath: '/login/google',
            callbackUri: `${process.env.BASE_URL || 'http://localhost:3000'}/login/google/callback`
        });

        fastify.register(require('./api/auth.js'));
        fastify.register(require('./api/user.js'));
        fastify.register(require('./api/game/game.js'));
        fastify.register(require('./api/friends.js'));
        fastify.setNotFoundHandler((req, rep) => {
            rep.sendFile('static/index.html')
        });
        await fastify.listen({port: 3000, host: '0.0.0.0'});
    } catch (e){
        fastify.log.error(e);
    }
}

start();

fastify.get('/metrics', async (request, reply) => {
  try {
    const metrics = await client.register.metrics();
    reply.header('Content-Type', client.register.contentType);
    return reply.send(metrics);
  } catch (e) {
    fastify.log.error('Failed to collect metrics', e);
    return reply.code(500).send('Metrics error');
  }
});