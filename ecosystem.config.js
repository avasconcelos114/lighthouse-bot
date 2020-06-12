const path = require('path');

module.exports = {
    apps: [{
        name: 'lighthouse-bot',
        script: 'src/index.js',
        instances: 1,
        autorestart: true,
        watch: process.env.NODE_ENV !== 'production' ? path.resolve(__dirname) : false,
        node_args: ['--experimental-worker'],
        max_memory_restart: '1G',
        env: {
            PORT: 3001,
            MATTERMOST_SERVER: 'http://127.0.0.1:8065',
            TOKEN: '1234',
            MONGO_USERNAME: 'root',
            MONGO_PASSWORD: 'test_passwd',
            MONGO_SERVER: '127.0.0.1:27017',
            CHATBOT_SERVER: 'http://127.0.0.1:3001',
            TZ: 'Asia/Seoul'
        }
    }]
};
