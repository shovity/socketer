'use strict'

const logger = require('./logger')
const redis = require('../redis')
const util = require('../util')

const socketer = {}
const caller = util.createCirleCall(900)

/**
 * create socket namespace as a instance
 */
socketer.create = (io, name) => {
    const instance = {}
    const namespace = io.of(name)
    const clientKey = `clients:${name}`

    const setClient = (sid, user, done) => {
        redis.hset(clientKey, sid, JSON.stringify({  sid, user }), done)
    }

    const getAllClients = (done) => {
        redis.hgetall(clientKey, (error, data) => {
            if (error) {
                logger.error('get all client error: ' + error)
                return done([])
            }

            if (!data) {
                return done([])
            }

            return done(Object.keys(data).map(key => JSON.parse(data[key])))
        })
    }

    const removeClient = (sid, done) => {
        redis.hdel(clientKey, sid, done)
    }

    const removeAllClients = (done) => {
        redis.del(clientKey, done)
    }

    const broadcastClientsChanged = () => {
        caller.execute(() => {
           getAllClients((clients) => {
                namespace.in('user_monitoring').emit('clients_changed', clients)
           })
        })
    }


    removeAllClients()

    instance.namespace = namespace
    instance.getAllClients = getAllClients

    namespace.on('connection', socket => {
        setClient(socket.id, {})
    
        // login and broadcast clients changed
        socket.on('login', (data, done=() => undefined) => {
            setClient(socket.id, data)
            done()
            broadcastClientsChanged()
        })

        // request join a room
        socket.on('join_room', room => {
            if (!room) {
                return
            }

            const rooms = room.split(',').map(r => r.trim())

            rooms.forEach(r => {
                socket.join(r)

                if (r === 'user_monitoring') {
                    getAllClients((clients) => {
                        socket.emit('clients_changed', clients)
                    })
                }
            })
        })
        
        // request leave a room
        socket.on('leave_room', room => {
            const rooms = room.split(',').map(r => r.trim())

            rooms.forEach(r => {
                socket.leave(r)
            })
        })
    
        // remove and broadcast clients changed
        socket.on('disconnect', () => {
            removeClient(socket.id)
            broadcastClientsChanged()
        })
    })

    return instance
}

module.exports = socketer