const fastify = require('fastify')({ logger: true })
const multipart = require('@fastify/multipart')
const { connectDb } = require('./db')
const fs = require('fs')
const path = require('path')

// Swagger + UI
fastify.register(require('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Property Dashboard API',
      description: 'Minimal API for managing properties, buildings, units',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:3001' }
    ],
    components: {
      schemas: require('./schemas')
    },
    tags: [
      { name: 'properties', description: 'Property operations' },
      { name: 'managers', description: 'Managers & accountants' },
      { name: 'extract', description: 'PDF extraction' }
    ]
  }
})

fastify.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  exposeRoute: true
})

// Multipart
fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

// Uploads dir
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

// Routes
fastify.register(require('./routes/properties'))
fastify.register(require('./routes/managers'))

// Start
const start = async () => {
  try {
    await connectDb()
    await fastify.listen({ port: process.env.PORT || 3001 })
    console.log('Server running on http://localhost:3001')
    console.log('Swagger UI: http://localhost:3001/docs')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()