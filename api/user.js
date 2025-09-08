const bcrypt = require('bcrypt');

const userRoute = (fastify, options) => {
    fastify.post('/api/edit', async (req, rep) => {
        const data = await req.file();
        const file = data.file;
        return rep.code(200).send({message: "yes"});
    })
}

module.exports = userRoute;