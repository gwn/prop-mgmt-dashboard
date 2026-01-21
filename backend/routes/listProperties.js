const
    {keyBy, groupBy} = require('lodash'),
    {getDB} = require('../db'),
    {PropertySchema} = require('../schema')


module.exports = {
    url: '/properties',
    method: 'get',

    schema: {
        description: 'List all properties with nested buildings and units',

        response: {
            200: {type: 'array', items: PropertySchema},
        },
    },

    handler: async () => {
        const
            db = await getDB(),

            [props, dfiles, blds, units, pms, accs] =
                await Promise.all([
                    db.properties.find(),
                    db.declaration_files.find(),
                    db.buildings.find(),
                    db.units.find(),
                    db.property_managers.find(),
                    db.accountants.find(),
                ]),

            pmsById = keyBy(pms, p => p.id),
            accsById = keyBy(accs, a => a.id),
            dfilesByPropId = keyBy(dfiles, f => f.property_id),
            bldsByPropId = groupBy(blds, b => b.property_id),
            unitsByBldId = groupBy(units, u => u.building_id)

        props.forEach(p => {
            p.declaration_file = dfilesByPropId[p.id].content.toString('base64')

            p.property_manager = pmsById[p.property_manager_id]
            p.accountant = accsById[p.accountant_id]
            p.buildings = bldsByPropId[p.id]

            p.buildings.forEach(b => {
                b.units = unitsByBldId[b.id]
            })
        })

        return props
    },
}
