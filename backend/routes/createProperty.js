const
    {getDB} = require('../db'),
    {PropertySchema} = require('../../schema')


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
            prop = req.body,

            db = await getDB(),

            newPropId =
                await db.withTransaction(async tx => {
                    const [pm, acc] =
                        await Promise.all([
                            tx.property_managers.save(prop.property_manager),
                            tx.accountants.save(prop.accountant),
                        ])

                    delete prop.property_manager
                    delete prop.accountant

                    prop.property_manager_id = pm.id
                    prop.accountant_id = acc.id

                    const {id} = await tx.properties.insert(prop)

                    if (prop.declaration_file)
                        await tx.declaration_files.insert({
                            property_id: id,
                            content: Buffer.from(prop.declaration_file, 'base64'),
                        })

                    await Promise.all(
                        prop.buildings.map(b => {
                            b.property_id = id

                            b.units.forEach(u => u.building_id = undefined)
                            // ^for massive deep insert

                            return tx.buildings.insert(b, {
                                deepInsert: b.units.length > 0,
                            })
                        }))

                    return id
                })

        rep.status(201).send({id: newPropId})
    },
}
