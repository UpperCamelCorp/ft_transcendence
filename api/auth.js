const bcrypt = require('bcrypt');
const { promisify } = require('util');

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

const  authRoutes = async (fastify, options) => {

    const dbGet = promisify(fastify.db.get.bind(fastify.db));
    const dbAll = promisify(fastify.db.all.bind(fastify.db));
    const dbRun = promisify(fastify.db.run.bind(fastify.db));

    fastify.post('/api/login',{
        schema: {
            body: {
                type : 'object',
                properties : {
                    email : {type: 'string'},
                    password: {type: 'string'}
                }
            }
        }
     } , async (req, rep) => {
        try {
            console.log(req.body);
            const {email, password} = req.body;
            
            if (!emailCheck(email))
                return rep.code(400).send({message: "Invalid email"});

            const rows = await dbAll('SELECT id, username, hash, picture FROM users WHERE email = ?', [email]);

            if (rows.length === 0) {
                return rep.code(401).send({ message: "Wrong Credentials" });
            }
            const user = rows[0];

            const isPasswordValid = await bcrypt.compare(password, user.hash);
            if (!isPasswordValid) {
                return rep.code(401).send({ message: "Wrong Credentials" });
            }

            const jwtToken = fastify.jwt.sign({ id: user.id, username: user.username });
            return rep.code(200).send({
                token: jwtToken,
                user: { username: user.username, email: email},
                picture: user.picture,
                message: "Connected"});
        } catch (e) {
            fastify.log.error(e);
            return rep.code(500).send({ message: "Internal server error" });
        }
    });

    fastify.post('/api/signup', {
        schema : {
            body : {
                type : 'object',
                properties : {
                    username : {type : 'string'},
                    email : {type: 'string'},
                    password : {type: 'string'},
                    confirmPassword: {type: 'string'}
                }
            }
        }
    }, async (req, rep) => {
        console.log(req.body)
        try {
            const {username, email, password, confirmPassword} = req.body;
            if (!username)
                return rep.code(400).send({message: "No Username"});
            if (!emailCheck(email))
                return rep.code(400).send({message: "Invalid email"});
            if (!passwordCheck(password))
                return rep.code(400).send({message : "Invalid password"});
            if (password != confirmPassword)
                return rep.code(400).send({message : "Password does not match"});
            const existingUser = await dbGet('SELECT email FROM users WHERE email = ? OR username = ?', [email, username]);
                if (existingUser) {
                    return rep.code(409).send({ message: "User already exists" });
                }
                const hash = await bcrypt.hash(password, 12); // Increased salt rounds
                await dbRun('INSERT INTO users(username, email, hash) VALUES(?, ?, ?)', [username, email, hash]);

                fastify.log.info(`New user registered: ${email}`);
                return rep.code(201).send({ message: "User registered successfully" });

        } catch (e) {
            fastify.log.error(e);
            return rep.code(500).send({ message: "Internal server error" });
        }
    })
}

module.exports = authRoutes;