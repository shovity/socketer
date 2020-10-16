'use strict'


const util = {}

util.createCirleCall = (timeout=200) => {
    const instance = {
        block: false,
        handle: null,
    }

    instance.execute = (handle, ...args) => {
        instance.handle = handle

        if (!instance.block) {
            instance.handle(...args)
            instance.handle = null
            instance.block = true

            setTimeout(() => {
                instance.block = false
                if (instance.handle) {
                   instance.execute(instance.handle, ...args)
                }
            }, timeout)
        }
    }

    return instance
}

module.exports = util