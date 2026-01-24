module.exports = (
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

        if (declaration_file)
            await tx.declaration_files.save({
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
