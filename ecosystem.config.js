const path = require('path');

module.exports = {
    apps: [{
        name: 'lighthouse-bot',
        script: 'index.js',
        instances: 1,
        autorestart: true,
        watch: process.env.NODE_ENV !== 'production' ? path.resolve(__dirname) : false,
        max_memory_restart: '1G'
    }]
};
