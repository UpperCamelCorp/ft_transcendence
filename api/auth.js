const bcrypt = require('bcrypt');
const { promisify } = require('util');
const Logger = require('../utils/logger');

const emailCheck = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    console.log('result of check = ', regex.test(email));
    return (regex.test(email));
}

const passwordCheck = (password) => {
    if (password.length < 8)
        return false;
    return true;
}

const authRoutes = async (fastify, options) => {
    const dbGet = promisify(fastify.db.get.bind(fastify.db));
    const dbAll = promisify(fastify.db.all.bind(fastify.db));
    const dbRun = promisify(fastify.db.run.bind(fastify.db));

    fastify.post('/api/login', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    email: {type: 'string'},
                    password: {type: 'string'}
                }
            }
        }
    }, async (req, rep) => {
        try {
            const {email, password} = req.body;

            Logger.auth('Login attempt', {
                email: email,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });

            if (!emailCheck(email)) {
                Logger.auth('Login failed - invalid email format', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(400).send({message: "Invalid email"});
            }

            const rows = await dbAll('SELECT id, username, hash, picture FROM users WHERE email = ?', [email]);

            if (rows.length === 0) {
                Logger.auth('Login failed - user not found', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(401).send({message: "Wrong Credentials"});
            }

            const user = rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.hash);

            if (!isPasswordValid) {
                Logger.auth('Login failed - invalid password', {
                    userId: user.id,
                    username: user.username,
                    ip: req.ip
                });
                return rep.code(401).send({message: "Wrong Credentials"});
            }

            const jwtToken = fastify.jwt.sign({id: user.id, username: user.username});

            Logger.auth('Login successful', {
                userId: user.id,
                username: user.username,
                ip: req.ip
            });

            return rep.code(200).send({
                token: jwtToken,
                user: {username: user.username, email: email},
                picture: user.picture,
                message: "Connected"
            });

        } catch (e) {
            Logger.error('Login error', {
                error: e.message,
                stack: e.stack,
                ip: req.ip
            });
            return rep.code(500).send({message: "Internal server error"});
        }
    });

    fastify.post('/api/signup', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    username: {type: 'string'},
                    email: {type: 'string'},
                    password: {type: 'string'},
                    confirmPassword: {type: 'string'}
                }
            }
        }
    }, async (req, rep) => {
        try {
            const {username, email, password, confirmPassword} = req.body;

            Logger.auth('Signup attempt', {
                email: email,
                username: username,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });

            if (!username) {
                Logger.auth('Signup failed - no username', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(400).send({message: "No Username"});
            }

            if (!emailCheck(email)) {
                Logger.auth('Signup failed - invalid email', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(400).send({message: "Invalid email"});
            }

            if (!passwordCheck(password)) {
                Logger.auth('Signup failed - invalid password', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(400).send({message: "Invalid password"});
            }

            if (password != confirmPassword) {
                Logger.auth('Signup failed - password mismatch', {
                    email: email,
                    ip: req.ip
                });
                return rep.code(400).send({message: "Password does not match"});
            }

            const existingUser = await dbGet('SELECT email FROM users WHERE email = ? OR username = ?', [email, username]);
            if (existingUser) {
                Logger.auth('Signup failed - user already exists', {
                    email: email,
                    username: username,
                    ip: req.ip
                });
                return rep.code(409).send({message: "User already exists"});
            }

            const hash = await bcrypt.hash(password, 12);
            await dbRun('INSERT INTO users(username, email, hash) VALUES(?, ?, ?)', [username, email, hash]);

            Logger.auth('Signup successful', {
                email: email,
                username: username,
                ip: req.ip
            });

            return rep.code(201).send({message: "User registered successfully"});

        } catch (e) {
            Logger.error('Signup error', {
                error: e.message,
                stack: e.stack,
                ip: req.ip
            });
            return rep.code(500).send({message: "Internal server error"});
        }
    });

    // Google OAuth callback
    fastify.get('/login/google/callback', async (request, reply) => {
        try {
            Logger.auth('Google OAuth callback initiated', {
                ip: request.ip,
                userAgent: request.headers['user-agent']
            });

            const result = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: 'Bearer ' + result.token.access_token
                }
            });

            if (!userInfoResponse.ok) {
                Logger.error('Failed to fetch Google user info', {
                    status: userInfoResponse.status,
                    ip: request.ip
                });
                return reply.code(500).send({message: "Failed to fetch user info"});
            }

            const googleUser = await userInfoResponse.json();

            // Check if user exists
            let user = await dbGet('SELECT id, username, email, picture FROM users WHERE email = ?', [googleUser.email]);

            if (!user) {
                // Create new user
                const username = googleUser.name || googleUser.email.split('@')[0];
                await dbRun('INSERT INTO users(username, email, hash, picture) VALUES(?, ?, ?, ?)',
                    [username, googleUser.email, 'OAUTH_GOOGLE', googleUser.picture]);
                user = await dbGet('SELECT id, username, email, picture FROM users WHERE email = ?', [googleUser.email]);

                Logger.auth('New Google user created', {
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    ip: request.ip
                });
            } else {
                Logger.auth('Existing Google user logged in', {
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    ip: request.ip
                });
            }

            const jwtToken = fastify.jwt.sign({id: user.id, username: user.username});

            // Redirect to the login route so frontend login handler processes the token
            reply.redirect(`/login?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
                username: user.username,
                email: user.email
            }))}&picture=${encodeURIComponent(user.picture || googleUser.picture)}`);
        } catch (err) {
            Logger.error('Google OAuth callback error', {
                error: err.message,
                stack: err.stack,
                ip: request.ip
            });
            reply.redirect('/?error=oauth_failed');
        }
    });
}

module.exports = authRoutes;