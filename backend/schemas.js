const ManagerSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    address: { type: 'string' },
    notes: { type: 'string' }
  }
}

const AccountantSchema = ManagerSchema

const UnitSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    number: { type: 'string' },
    type: {
      type: 'string',
      enum: ['Apartment', 'Office', 'Garden', 'Parking']
    },
    floor: { type: 'string' },
    entrance: { type: 'string' },
    size: { type: 'number' },
    co_ownership_share: { type: 'number' },
    construction_year: { type: 'integer' },
    rooms: { type: 'integer' },
    description: { type: 'string' }
  }
}

const BuildingSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    street: { type: 'string' },
    house_number: { type: 'string' },
    construction_year: { type: 'integer' },
    description: { type: 'string' },
    units: {
      type: 'array',
      items: UnitSchema
    }
  }
}

const PropertySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    unique_number: { type: 'string' },
    management_type: {
      type: 'string',
      enum: ['WEG', 'MV']
    },
    total_mea: { type: 'number' },
    declaration_file_path: { type: 'string' },
    property_manager: ManagerSchema,
    accountant: AccountantSchema,
    buildings: {
      type: 'array',
      items: BuildingSchema
    }
  }
}

const PropertyInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    unique_number: { type: 'string' },
    management_type: {
      type: 'string',
      enum: ['WEG', 'MV']
    },
    total_mea: { type: 'number' },
    property_manager: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' }
      }
    },
    accountant: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        notes: { type: 'string' }
      }
    },
    buildings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          street: { type: 'string' },
          house_number: { type: 'string' },
          construction_year: { type: 'integer' },
          description: { type: 'string' },
          units: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                number: { type: 'string' },
                type: { enum: ['Apartment', 'Office', 'Garden', 'Parking'] },
                floor: { type: 'string' },
                entrance: { type: 'string' },
                size: { type: 'number' },
                co_ownership_share: { type: 'number' },
                construction_year: { type: 'integer' },
                rooms: { type: 'integer' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    }
  },
  required: ['name', 'management_type']
}

const ExtractResponseSchema = PropertyInputSchema // same shape as input for extract

module.exports = {
  ManagerSchema,
  AccountantSchema,
  UnitSchema,
  BuildingSchema,
  PropertySchema,
  PropertyInputSchema,
  ExtractResponseSchema
}
