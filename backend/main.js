const
    fastify = require('fastify'),
    fastifyMultipart = require('@fastify/multipart'),
    fastifyCORS = require('@fastify/cors'),
    fastifySwagger = require('@fastify/swagger'),
    fastifySwaggerUI = require('@fastify/swagger-ui'),
    routes = require('./routes'),
    {API_PORT, WEBCLI_URL} = process.env,

    docTitle = 'gwn\'s Buena Property Management API',

    main = async () => {
        const app = fastify({logger: true})

        app.register(fastifyMultipart, {attachFieldsToBody: true})

        app.register(fastifyCORS, {
            origin: WEBCLI_URL,
            methods: ['GET', 'HEAD', 'POST', 'PUT'],
        })

        await app.register(fastifySwagger, {openapi: {info: {docTitle}}})
        await app.register(fastifySwaggerUI)

        routes.forEach(r => app.route(r))

        await app.listen({port: API_PORT})
        app.log.info('See API docs at /documentation', API_PORT)
    }


main()
