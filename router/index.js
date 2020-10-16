'use strict'

const os = require('os')

const express = require('express')

const socketer = require('../engine/socketer')
const config = require('../config')
const io = require('../io')

const router = express.Router()
const namespace = {}

// create namespace map
Object.keys(config.client).forEach(k => {
    const name = config.client[k].namespace
    namespace[name] = socketer.create(io, name)
})

// handle hook
router.post('/api/socket/v1/emitter', (req, res, next) => {
    const { event, data, client, sid, room, uid } = req.body || {}
    const clientData = config.client[client]

    if (!clientData) {
        return res.json({ error: 'missing or invalid client' })
    }

    if (!event) {
        return res.json({ error: 'event is requried' })
    }

    const instance = namespace[clientData.namespace]

    if (!instance) {
        return res.json({ error: `namespace ${clientData.namespace} not available` })
    }

    if (sid) {
        // sending to a sid
        instance.namespace.to(sid).emit(event, data)

    } else if (room) {
        // sending to a room
        instance.namespace.in(room).emit(event, data)

    } else if (uid) {
        const userIds = Array.isArray(uid)? uid : [ uid ]
        const missUserIds = []

        userIds.forEach(userId => {
            instance.getAllClients((clients) => {
                const userClients = clients.filter(c => c.user.id === userId)

                if (userClients.length === 0) {
                    missUserIds.push(userId)
                    return
                }

                userClients.forEach(client => {
                    instance.namespace.to(client.sid).emit(event, data)
                })
            })
        })

        return res.json(missUserIds)

    } else {

        // sending to all client
        instance.namespace.emit(event, data)
    }

    return res.json({})
})

router.get('/:nsp', (req, res, next) => {
    const pstatus = {
        heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: process.cpuUsage(),
    }

    const hostname = os.hostname()

    res.render('home', {
        nsp: req.params.nsp,
        pstatus,
        hostname,
    })
})

// response 404
router.use((req, res) => {
    res.json({ error: 404 })
})

module.exports = router