const
    {getDB} = require('../db'),
    {ManagerSchema} = require('../../schema')


module.exports = {
    url: '/managers',
    method: 'get',

    schema: {
        description: 'List property managers or accountants',
        query: {
            type: 'object',
            required: ['type'],
            properties: {
                type: {
                    type: 'string',
                    enum: ['property_manager', 'accountant'],
                },
            },
        },
        response: {
            200: {type: 'array', items: ManagerSchema},
        },
    },

    handler: async req => {
        const db = await getDB()

        return await db[req.query.type + 's'].find()
    },
}
