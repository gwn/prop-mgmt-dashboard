const
    fastify = require('fastify'),
    fastifySwagger = require('@fastify/swagger'),
    fastifySwaggerUI = require('@fastify/swagger-ui'),
    routes = require('./routes'),
    {API_PORT} = process.env,

    main = async () => {
        const app = fastify({logger: true})

        await app.register(fastifySwagger)
        await app.register(fastifySwaggerUI)

        routes.forEach(r => app.route(r))

        await app.listen({port: API_PORT})
        app.log.info('See API docs at /documentation', API_PORT)
    }


main()
