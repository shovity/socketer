'use strict'

const LEVELS = [
    'debug',
    'info',
    'warning',
    'error',
]

const config = {}
config.logLevel = 'debug'

const logger = {

    get debug() {
        if (LEVELS.indexOf(config.logLevel.toLowerCase()) <= LEVELS.indexOf('debug')) {
            return console.log.bind(global.console, 'DEBUG:')
        }
        
        return () => undefined
    },

    get info() {
        if (LEVELS.indexOf(config.logLevel.toLowerCase()) <= LEVELS.indexOf('info')) {
            return console.log.bind(global.console, 'INFO:')
        }
        
        return () => undefined
    },

    get warning() {
        if (LEVELS.indexOf(config.logLevel.toLowerCase()) <= LEVELS.indexOf('warning')) {
            return console.warn.bind(global.console, 'WARNING:')
        }
        
        return () => undefined
    },

    get error() {
        if (LEVELS.indexOf(config.logLevel.toLowerCase()) <= LEVELS.indexOf('error')) {
            return console.log.bind(global.error, 'ERROR:')
        }
        
        return () => undefined
    },
}

module.exports = logger
