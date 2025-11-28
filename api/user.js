const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs/promises');
const { promisify } = require('util');
const { profile, Console } = require('console');
const { promiseHooks } = require('v8');
const { default: fastifyMultipart } = require('@fastify/multipart');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const emailCheck = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return (regex.test(email));
}

const usernameCheck = (username) => {
    const regex = new RegExp(/^[a-zA-Z0-9]+$/);
    return (regex.test(username) && username.length <= 10 && username.length >= 3)
}

const passwordCheck = (password) => {
    if (password.length < 8)
        return false;
    return true;
}

const userRoute = async (fastify, options) => {

    const dbGet = promisify(fastify.db.get.bind(fastify.db));
    const dbAll = promisify(fastify.db.all.bind(fastify.db));
    const dbRun = promisify(fastify.db.run.bind(fastify.db));
    const MAX_FILE_SIZE = 1 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    fastify.post('/api/edit', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        if (req.user) {
            const data = await req.file();
            let finalFile = null;
            if (data.file && data.filename) {
                try {
                    const ext = data.filename.split('.').pop().toLowerCase();
                    if (!ALLOWED_EXTENSIONS.includes(ext))
                        return rep.code(400).send({ message: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`});
                    const fileBuffer = await data.toBuffer();
                    if (fileBuffer.length > MAX_FILE_SIZE)
                        return rep.code(400).send({ message: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`});
                    const filename = `pp_${req.user.username}_${Date.now()}.${ext}`;
                    const filePath = path.join(__dirname, '../public/uploads/', filename);
                    await fs.writeFile(filePath, fileBuffer);
                    finalFile = `/uploads/${filename}`;
                } catch (e) {
                    console.log(e);
                    return rep.code(500).send({ message: "Error uploading file" });
                }
            } else {
                console.log('no file');
            }
            const {username, email, password, confirm} = data.fields;
            const sqlFields = [];
            const sqlParam = [];
            if (password.value != confirm.value)
                return rep.code(400).send({message : "Password does not match"});
            if (username.value) {
                if (!usernameCheck(username.value))
                    return rep.code(400).send({ message: "Inavlid Username"});
                const existingUsername = await dbGet('SELECT id FROM users WHERE username = ? AND id != ?', [username.value, req.user.id]);
                if (existingUsername)
                    return rep.code(400).send({ message: "Username already exists" });
                sqlFields.push('username = ?');
                sqlParam.push(username.value);
            }
            if (email.value) {
                if (!emailCheck(email.value))
                    return rep.code(400).send({message : "Invalid email"});
                const existingEmail = await dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email.value, req.user.id]);
                if (existingEmail)
                    return rep.code(400).send({ message: "Email already exists" });
                sqlFields.push('email = ?');
                sqlParam.push(email.value);
            }
            if (password.value) {
                if (!passwordCheck(password.value))
                    return rep.code(400).send({message : "Invalid password"});
                const hash = await bcrypt.hash(password.value, 10);
                sqlFields.push('hash = ?');
                sqlParam.push(hash);
            }
            if (finalFile) {
                sqlFields.push('picture = ?');
                sqlParam.push(finalFile);
            }
            sqlParam.push(req.user.id);
            try {
                if (sqlFields.length > 0)
                    await fastify.db.run(`UPDATE users SET ${sqlFields.join(', ')} WHERE id = ?`, sqlParam);
                const updatedUser = await dbGet('SELECT id, username, email, picture FROM users WHERE id = ?', [req.user.id]);
                const jwtToken = fastify.jwt.sign({ id: updatedUser.id, username: updatedUser.username });
                return rep.code(200).send({
                    token: jwtToken,
                    user: { username: updatedUser.username, email: updatedUser.email},
                    picture: updatedUser.picture,
                    message: "Success"});
            } catch(e) {
                console.error(e);
                return rep.code(500).send({message: "Error try again later"});
            }
        }
    });

    fastify.post('/api/search', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        let {username} = req.body;
        if (!username || username.length < 3)
            return rep.code(400).send({message : "No Username"});
        try {
            username += '%';
            const users = await dbAll('SELECT id, username, picture FROM users WHERE username LIKE ? AND id != ?', [username, req.user.id]);
            return rep.code(200).send(users);
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: "Error try again later"});
        }
    });

    fastify.get('/api/user', {
        onRequest : [fastify.authenticate]
    }, async (req, rep) => {
        const id = req.user.id;
        try {
            const user = await dbGet('SELECT username, picture FROM users WHERE id = ?', [id]);
            return rep.code(200).send({user, status : 1, friends: 2});
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: "Error try again later"});
        }
    });

    fastify.get('/api/user/:userId', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        const {userId} = req.params;
        const id = req.user.id;
        try {
            let status = false;
            const user = await dbGet('SELECT username, picture FROM users WHERE id = ?', [userId]);
            const friendRequestStatus = await dbGet('SELECT status FROM friends WHERE user_id = ? AND friend_id = ?', [userId, id]);
            const friendDemmandStatus = await dbGet('SELECT status FROM friends WHERE user_id = ? AND friend_id = ?', [id, userId]);
            if (friendRequestStatus && friendRequestStatus.status === 2) {
                status = fastify.connectedUsers.includes(parseInt(userId));
                return rep.code(200).send({user, status : status, friends: 2});
            }
            if (friendRequestStatus)
                return rep.code(200).send({user, status: status, friends: 1});
            else if (friendDemmandStatus)
                return rep.code(200).send({user, status : status, friends: 0})
            return rep.code(200).send({user, status: status, friends: null});
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: "Error try again later"});
        }
    });

    fastify.get('/api/games', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        const id = req.user.id;
        try {
            const games = await dbAll(`SELECT game.*,
                u1.username as player1_username,
                u1.picture as player1_picture,
                u2.username as player2_username,
                u2.picture as player2_picture
                FROM game
                JOIN users u1 ON game.player1_id = u1.id
                JOIN users u2 ON game.player2_id = u2.id
                WHERE player1_id = ? OR player2_id = ?`, [id, id]);

            return rep.code(200).send({games});
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: 'Error try again later'});
        }
    });

    fastify.get('/api/games/:userId', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        const {userId} = req.params;
        try {
            const games = await dbAll(`SELECT game.*,
                u1.username as player1_username,
                u1.picture as player1_picture,
                u2.username as player2_username,
                u2.picture as player2_picture
                FROM game
                JOIN users u1 ON game.player1_id = u1.id
                JOIN users u2 ON game.player2_id = u2.id
                WHERE player1_id = ? OR player2_id = ?`, [userId, userId]);

            return rep.code(200).send({games});
        } catch (e) {
            console.log(e);
            return rep.code(500).send({message: "Error try again later"});
        }
    });

    // 2FA status endpoint
    fastify.get('/api/2fa/status', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        try {
            const id = req.user.id;
            const row = await dbGet('SELECT twofa_enabled FROM users WHERE id = ?', [id]);
            return rep.code(200).send({ enabled: !!(row && row.twofa_enabled === 1) });
        } catch (e) {
            console.error(e);
            return rep.code(500).send({ message: 'Error fetching 2FA status' });
        }
    });

    // 2FA setup: return otpauth url + QR data URI (authenticated)
    fastify.get('/api/2fa/setup', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        try {
            const id = req.user.id;
            const user = await dbGet('SELECT username, twofa_enabled FROM users WHERE id = ?', [id]);
            if (!user) return rep.code(404).send({ message: 'User not found' });
            if (user.twofa_enabled) return rep.code(400).send({ message: '2FA already enabled' });
            const secret = speakeasy.generateSecret({ name: `Transcendence (${user.username})` });
            const otpAuth = secret.otpauth_url;
            const qrData = await qrcode.toDataURL(otpAuth);
            return rep.code(200).send({ secret: secret.base32, otpauth: otpAuth, qr: qrData });
        } catch (e) {
            console.error(e);
            return rep.code(500).send({ message: 'Error generating 2FA setup' });
        }
    });

    // Enable 2FA (verify TOTP then persist secret)
    fastify.post('/api/2fa/enable', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        try {
            const id = req.user.id;
            const { secret, token } = req.body || {};
            const current = await dbGet('SELECT twofa_enabled FROM users WHERE id = ?', [id]);
            if (current && current.twofa_enabled) return rep.code(400).send({ message: '2FA already enabled' });
             console.log('[2FA enable] incoming request - headers:', req.headers);
             console.log('[2FA enable] incoming body:', req.body);
             console.log('[2FA enable] server time:', new Date().toISOString());

             if (!secret || !token) {
                 console.warn('[2FA enable] missing secret or token');
                 return rep.code(400).send({ message: 'Missing params' });
             }
             const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
             if (!verified) {
                 console.warn('[2FA enable] verification failed for supplied token:', token);
                 return rep.code(400).send({ message: 'Invalid token (check server logs for expected codes and verify device time)' });
             }
             await dbRun('UPDATE users SET twofa_secret = ?, twofa_enabled = 1 WHERE id = ?', [secret, id]);
             return rep.code(200).send({ ok: true });
         } catch (e) {
             console.error(e);
             return rep.code(500).send({ message: 'Error enabling 2FA' });
         }
     });

    // Disable 2FA (verify current TOTP)
    fastify.post('/api/2fa/disable', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        try {
            const id = req.user.id;
            const { token } = req.body || {};
            if (!token) return rep.code(400).send({ message: 'Missing token' });
            const user = await dbGet('SELECT twofa_secret FROM users WHERE id = ?', [id]);
            if (!user || !user.twofa_secret) return rep.code(400).send({ message: '2FA not enabled' });
            const verified = speakeasy.totp.verify({ secret: user.twofa_secret, encoding: 'base32', token, window: 1 });
            if (!verified) return rep.code(400).send({ message: 'Invalid token' });
            await dbRun('UPDATE users SET twofa_secret = NULL, twofa_enabled = 0 WHERE id = ?', [id]);
            return rep.code(200).send({ ok: true });
        } catch (e) {
            console.error(e);
            return rep.code(500).send({ message: 'Error disabling 2FA' });
        }
    });
}

module.exports = userRoute;