if (
  process.env.DD_SITE &&
  process.env.DD_API_KEY) {
  const tracer = require('dd-trace').init({
    logInjection: true
  })
  exports.tracer = tracer
}

const fastify = require('fastify')({
  logger: true
})

const redirectChain = require('redirect-chain')({
  maxRedirects: 5
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/redirect-chain', {
  schema: {
        querystring: {
          type: 'object',
          properties: {
            get: {
              type: 'string',
              format: 'uri'
            },
          },
          required: ['get']
        }
    }
}, async (request, reply) => {
  const { get } = request.query

  // This library generates HEAD requests
  // https://github.com/tractr/redirect-chain/blob/master/index.js
  const finalUrl = await redirectChain.destination(get)

  return { finalUrl }
})

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
