const { connectDb } = require('../db')

async function routes(fastify) {
  fastify.get('/managers', {
    schema: {
      description: 'List property managers or accountants',
      tags: ['managers'],
      querystring: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['property_manager', 'accountant'],
            description: 'Type of list to return'
          }
        },
        required: ['type']
      },
      response: {
        200: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ManagerSchema'
          }
        }
      }
    }
  }, async (request) => {
    const db = await connectDb()
    const { type } = request.query
    if (!['property_manager', 'accountant'].includes(type)) {
      throw new Error('Invalid type')
    }
    const table = type === 'property_manager'
      ? db.property_managers
      : db.accountants
    return await table.find({})
  })
}

module.exports = routes