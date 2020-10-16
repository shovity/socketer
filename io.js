'use strict'

const socketio = require('socket.io')
const redis = require('socket.io-redis')

const config = require('./config')

const io = socketio({
    pingTimeout: 24040,
    origins: '*:*',
    transports: ['websocket'],
})

const adapter = redis({
    host: config.redis.host,
    port: config.redis.port,
})

io.adapter(adapter)

module.exports = io