const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs/promises');
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

const userRoute = (fastify, options) => {

    const dbGet = promisify(fastify.db.get.bind(fastify.db));

    fastify.post('/api/edit', {
        onRequest: [fastify.authenticate]
    }, async (req, rep) => {
        if (req.user) {
            const data = await req.file();
            let finalFile = null;
            console.log('id= ', req.user.id);
            if (data.file && data.filename) {
                try {
                    const ext = data.filename.split('.').pop();
                    const filename = `pp_${req.user.username}_${Date.now()}.${ext}`;
                    const filePath = path.join(__dirname, '../public/uploads/', filename);
                    console.log('path = ', filePath);
                    await fs.writeFile(filePath, await data.toBuffer());
                    finalFile = `/uploads/${filename}`;
                    console.log('final file = ', finalFile);
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
                sqlFields.push('username = ?');
                sqlParam.push(username.value);
            }
            if (email.value) {
                if (!emailCheck(email.value))
                    return rep.code(400).send({message : "Invalid email"});
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
    })
}

module.exports = userRoute;