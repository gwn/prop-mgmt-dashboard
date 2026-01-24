const {getDB} = require('../db')


module.exports = {
    url: '/properties/:id',
    method: 'delete',

    schema: {
        description: 'Delete property',
        params: {
            type: 'object',
            properties: {
                id: {type: 'integer'},
            },
        },
        response: {
            204: {type: 'null'},
        },
    },

    handler: async (req, rep) => {
        const db = await getDB()

        await db.properties.destroy({id: req.params.id})

        rep.status(204).send(null)
    },
}
