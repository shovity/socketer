'use strict'

const redis = require('redis')

const config = require('./config')
const logger = require('./engine/logger')

const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
})

client.on('error', (err) => {
    logger.error('connect redis error: ' + err)
})

module.exports = client