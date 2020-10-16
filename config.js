const config = {}

config.redis  = {
    host: 'redis',
    port: 6379,
}

config.client = {
    'development.DjgSIh1LTf3l7qO6uY7Ds7HtfN8dv6n': {
        'name': 'Develop server',
        'namespace': 'dev',
    },
    'staging.SIh1LTfDjg3l7qOfN8dv6n6uY7Ds7Ht': {
        'name': 'Staging server',
        'namespace': 'sta',
    },
    'production.Xz39XH8KW8i04VSDGZwwjo4BFN98h4U': {
        'name': 'Production server',
        'namespace': 'pro',
    },
}

module.exports =  config