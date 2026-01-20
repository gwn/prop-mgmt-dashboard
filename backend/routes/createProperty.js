const
    {getDB} = require('../db'),
    {PropertySchema} = require('../schema')


module.exports = {
    url: '/properties',
    method: 'post',

    schema: {
        description: 'Create property',
        body: PropertySchema,
        response: {
            201: {
                type: 'object',
                properties: {id: {type: 'integer'}},
            },
        },
    },

    handler: async (req, rep) => {
        const
            db = await getDB(),

            prop = req.body,

            pm =
                await db.property_managers.insert(req.body.property_manager, {
                    onConflict: {
                        targetExpr: 'name || address',
                        action: 'ignore',
                    },
                }),

            acc =
                await db.accountants.insert(req.body.accountant, {
                    onConflict: {
                        targetExpr: 'name || address',
                        action: 'ignore',
                    },
                })

        prop.property_manager_id = pm.id
        prop.accountant_id = acc.id
        prop.declaration_file = Buffer.from(prop.declaration_file, 'base64')

        const {id} = await db.properties.insert(req.body, {deepInsert: true})

        rep.status(201).send({id})
    },
}
