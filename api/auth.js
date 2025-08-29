const bcrypt = require('bcrypt');

const  authRoutes = async (fastify, options) => {
    console.log(fastify.db)
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
     } , (req, rep) => {
        console.log(req.body);
        const {email, password} = req.body;
        fastify.db.all('SELECT id, username, hash FROM users WHERE email = ?', [email], (e, row) => {
            if (e) {
                console.log(e);
                return rep.code(501).send({message : "error db"});
            }
            if (row.length === 0)
                return rep.code(401).send({message: "Wrong Credentials"})

            bcrypt.compare(req.body.password, row[0].hash, (e, result) => {
                if (e) {
                    console.log(e);
                    return rep.code(501).send({message: "Hash error"});
                }
                if (result === true) {
                    const token = fastify.jwt.sign({id: row[0].id, username: row[0].username});
                    rep.code(200).send({token, message : "Connected"});
                }
                else rep.code(401).send({message : "Wrong Credentials"});
            })
        });
    })

    fastify.post('/api/signup', {
        schema : {
            body : {
                type : 'object',
                properties : {
                    username : {type : 'string'},
                    email : {type: 'string'},
                    password : {type: 'string'}
                }
            }
        }
    }, (req, rep) => {
        console.log(req.body)
        const {username, email, password } = req.body;
        fastify.db.get('SELECT email FROM users WHERE email = ? OR username = ?', [email, username], async (e, row) => {
            if (e) {
                console.log(e);
                return rep.code(501).send({message: "error db"});
            }
            if (row) return rep.code(409).send({message : "User already exist"});
            else {
                const hash = await bcrypt.hash(password, 10);
                fastify.db.run('INSERT INTO users(username, email, hash) VALUES(?, ?, ?)', [username, email, hash], (e) => {
                if (e) {
                    console.log(e);
                    return rep.code(501).send({message: "error db"});
                }
                console.log(req.body.email, ' sub');
                return rep.code(200).send({message : "Registered"});
            });
            }
        });
    })
}

module.exports = authRoutes;