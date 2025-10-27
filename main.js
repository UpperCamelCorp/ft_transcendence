const fastify = require('fastify')({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    }
});
const path = require('path');
const { setUpDataBase } = require('./db/database');
const Logger = require('./utils/logger');

const initDb = async () => {
    const db = await setUpDataBase();
    fastify.decorate('db', db);
    Logger.info('Database initialized successfully');
}

const initJwt = () => {
    fastify.decorate("authenticate", async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (e) {
            Logger.warn('Authentication failed', {
                error: e.code,
                ip: request.ip,
                url: request.url
            });

            if (e.name === 'FastifyError' && e.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
                reply.code(401).send({error: "Missing Token"});
            } else if (e.name === 'FastifyError' && e.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
                reply.code(401).send({error: "Token Expired"});
            } else if (e.name === 'FastifyError' && e.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
                reply.code(401).send({error: "Invalid Token"});
            } else {
                reply.code(401).send({error: 'Error'});
            }
        }
    });
}

const start = async () => {
    try {
        await initDb();
        initJwt();

        // Better logging approach using Fastify hooks
        fastify.addHook('onRequest', async (request, reply) => {
            request.startTime = Date.now();

            Logger.api('Request received', {
                method: request.method,
                url: request.url,
                userAgent: request.headers['user-agent'],
                ip: request.ip,
                userId: request.user?.id
            });
        });

        fastify.addHook('onResponse', async (request, reply) => {
            const responseTime = Date.now() - request.startTime;

            Logger.api('Request completed', {
                method: request.method,
                url: request.url,
                statusCode: reply.statusCode,
                responseTime,
                userId: request.user?.id
            });
        });

        fastify.register(require('@fastify/static'), {
            root: path.join(__dirname, 'public'),
            prefix: '/'
        });

        fastify.register(require('@fastify/jwt'), {
            secret: process.env.JWTPASS
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

        fastify.setNotFoundHandler((req, rep) => {
            Logger.warn('404 - Page not found', {
                url: req.url,
                method: req.method,
                ip: req.ip
            });
            rep.sendFile('static/index.html');
        });

        await fastify.listen({port: 3000, host: '0.0.0.0'});
        Logger.info('Server started successfully', { port: 3000 });

    } catch (e) {
        Logger.error('Server startup failed', { error: e.message, stack: e.stack });
        fastify.log.error(e);
        process.exit(1);
    }
}

start();