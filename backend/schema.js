const
    ManagerSchema = {
        type: 'object',
        required: ['name', 'address'],
        properties: {
            id: {type: 'integer'},
            name: {type: 'string'},
            address: {type: 'string'},
        },
    },


    UnitSchema = {
        type: 'object',
        required: ['number', 'type'],
        properties: {
            id: {type: 'integer'},
            number: {type: 'string'},
            type: {
                type: 'string',
                enum: ['Apartment', 'Office', 'Garden', 'Parking'],
            },
            floor: {type: 'string'},
            entrance: {type: 'string'},
            size: {type: 'number'},
            co_ownership_share: {type: 'number'},
            construction_year: {type: 'integer'},
            rooms: {type: 'integer'},
            description: {type: 'string'},
        },
    },


    BuildingSchema = {
        type: 'object',
        required: [
            'name', 'street', 'house_number', 'construction_year',
            'description', 'units',
        ],
        properties: {
            id: {type: 'integer'},
            name: {type: 'string'},
            street: {type: 'string'},
            house_number: {type: 'string'},
            construction_year: {type: 'integer'},
            description: {type: 'string'},
            units: {type: 'array', items: UnitSchema},
        },
    },


    PropertySchema = {
        type: 'object',
        required: [
            'name', 'unique_number', 'management_type', 'total_mea',
            'property_manager', 'accountant', 'buildings', 'declaration_file',
        ],
        properties: {
            id: {type: 'integer'},
            name: {type: 'string'},
            unique_number: {type: 'string'},
            management_type: {type: 'string', enum: ['WEG', 'MV']},
            total_mea: {type: 'number'},
            property_manager: ManagerSchema,
            accountant: ManagerSchema,
            buildings: {type: 'array', items: BuildingSchema},
            declaration_file: {
                type: 'string',
                format: 'byte',
                contentEncoding: 'base64',
                contentMediaType: 'application/pdf',
            },
        },
    }


module.exports = {
    ManagerSchema,
    PropertySchema,
}
