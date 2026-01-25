const
    {getDB} = require('../db'),
    {PropertySchema} = require('../../schema'),


    generateUpsertHandler = (insert = true) => ({
        url: insert ? '/properties' : '/properties/:id',
        method: insert ? 'post' : 'put',

        schema: {
            summary: (insert ? 'Create' : 'Update') + ' property',
            body: PropertySchema,
            response: {
                [insert ? 201 : 200]: {
                    type: 'object',
                    properties: {
                        id: {type: 'integer'},
                        property_manager_id: {type: 'integer'},
                        accountant_id: {type: 'integer'},
                    },
                },
            },
        },

        handler: async (req, rep) => {
            const db = await getDB()

            try {
                const propRec =
                    await upsertProperty(
                        db,
                        insert
                            ? req.body
                            : {id: req.params.id, ...req.body},
                    )

                rep.status(insert ? 201 : 200).send(propRec)

            } catch (e) {
                if (e.code === '23505')
                    rep.status(409).send()
                else
                    throw e
            }
        },
    }),


    upsertProperty = (
        db,
        {
            property_manager,
            accountant,
            declaration_file,
            buildings,
            ...prop
        },
    ) =>
        db.withTransaction(async tx => {
            const [pm, acc] =
                await Promise.all([
                    tx.property_managers.save(property_manager),
                    tx.accountants.save(accountant),
                ])

            prop.property_manager_id = pm.id
            prop.accountant_id = acc.id

            const propRec = await tx.properties.save(prop)

            await tx.declaration_files.destroy({
                property_id: propRec.id,
            })

            if (declaration_file)
                await tx.declaration_files.insert({
                    property_id: propRec.id,
                    content: Buffer.from(declaration_file, 'base64'),
                })

            await tx.buildings.destroy({property_id: propRec.id})

            await Promise.all(
                buildings.map(b => {
                    b.property_id = propRec.id

                    b.units.forEach(u => u.building_id = undefined)
                    // ^for massive deep insert

                    return tx.buildings.insert(b, {
                        deepInsert: b.units.length > 0,
                    })
                }))

            return propRec
        })


module.exports = {
    ...generateUpsertHandler(true),
    generateUpsertHandler,
}
