'use strict'

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressListEndpoints = require('express-list-endpoints')
const config = require('./config')

const io = require('./io')
const logger = require('./engine/logger')
const router = require('./router')

// define constants
const PORT = 2404

// initial apps instance
const app = express()
const server = http.createServer(app)

// attach io to server
io.attach(server)

// set app configs
app.set('view engine', 'pug')

// apply middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(router)

// listen
server.listen(PORT, () => {
    logger.debug('server socket running at ' + PORT)
})

console.log('BOOT: config =', config)
console.log('BOOT: list apis')
expressListEndpoints(app).forEach((api) => {
    api.methods.forEach((m) => {
        console.log(`  ${m.padEnd(6)} ${api.path}`)
    })
})
