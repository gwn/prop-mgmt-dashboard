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
        required: [
            'number', 'type', 'floor', 'entrance', 'size', 'co_ownership_share',
            'construction_year', 'rooms',
        ],
        properties: {
            id: {type: 'integer'},
            number: {type: 'string', minLength: 1},
            type: {
                type: 'string',
                enum: ['apartment', 'office', 'garden', 'parking'],
            },
            floor: {type: 'string', minLength: 1},
            entrance: {type: 'string', minLength: 1},
            size: {type: 'number', minimum: 1},
            co_ownership_share: {type: 'number', minimum: 1},
            construction_year: {type: 'integer', minimum: 1000},
            rooms: {type: 'integer', default: 0},
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
            name: {type: 'string', minLength: 3},
            street: {type: 'string', minLength: 3},
            house_number: {type: 'string', minLength: 1},
            construction_year: {type: 'integer', minimum: 1000},
            description: {type: 'string'},
            units: {type: 'array', items: UnitSchema, default: []},
        },
    },


    PropertySchema = {
        type: 'object',
        required: [
            'name', 'unique_number', 'management_type', 'total_mea',
            'property_manager', 'accountant', 'buildings',
        ],
        properties: {
            id: {type: 'integer'},
            name: {type: 'string', minLength: 3},
            unique_number: {type: 'string', minLength: 3},
            management_type: {type: 'string', enum: ['weg', 'mv']},
            total_mea: {type: 'number'},
            property_manager: ManagerSchema,
            accountant: ManagerSchema,
            buildings: {type: 'array', items: BuildingSchema},
            declaration_file: {
                type: 'string',
                contentEncoding: 'base64',
                contentMediaType: 'application/pdf',
            },
        },
    }


// for backend
if (typeof module !== 'undefined' && module.exports)
    module.exports = {ManagerSchema, PropertySchema, BuildingSchema, UnitSchema}

// for frontend
export {ManagerSchema, PropertySchema, BuildingSchema, UnitSchema}
