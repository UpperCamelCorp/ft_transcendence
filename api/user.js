const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs/promises')

const userRoute = (fastify, options) => {
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
                }                
            } else {
                console.log('no file');
            }
            const {username, email, password, confirm} = data.fields;
            const sqlFields = [];
            const sqlParam = [];
            if (username.value) {
                sqlFields.push('username = ?');
                sqlParam.push(username.value);
            }
            if (email.value) {
                sqlFields.push('email = ?');
                sqlParam.push(email.value);
            }
            if (password.value) {
                const hash = await bcrypt.hash(password.value, 10);
                sqlFields.push('hash = ?');
                sqlParam.push(hash);
            }
            if (finalFile) {
                sqlFields.push('picture = ?');
                sqlParam.push(finalFile);
            }
            sqlParam.push(req.user.id);
            console.log(username.value + ' ' + email.value + ' ' + password.value + ' ' + confirm.value);
            if (sqlFields.length === 0)
                return rep.code(200).send({message: "Sucess"});
            try {
                await fastify.db.run(`UPDATE users SET ${sqlFields.join(', ')} WHERE id = ?`, sqlParam);
            } catch(e) {
                console.error(e);
                return rep.code(500).send({message: "Error try again later"});
            }
            console.log(username.value + ' ' + email.value + ' ' + password.value + ' ' + confirm.value);
            return rep.code(200).send({message: "Sucess"});
        }
    })
}

module.exports = userRoute;