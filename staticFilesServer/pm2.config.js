const path = require('path')
module.exports = {
    apps: [
        {
            name: 'web-spider-static-server',
            script: path.resolve(__dirname, './server.js'),
            instances: 2,
            exec_mode: 'cluster',
            watch: true,
            error_file: './logs/app-err.log',
            out_file: './logs/app-out.log',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
}
