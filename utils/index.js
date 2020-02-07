function checkEnvVar(variable) {
    if (process.env[variable]) {
        return process.env[variable];
    }

    logger().error(`Error: the environment variable ${variable} has not been set!`)
    process.exit(1);
}

function logger() {
    function debug(message) {
        const timestamp = new Date().toString()
        console.log('\x1b[36m%s\x1b[0m', `${timestamp} - ${message}`)
    }
    
    function error(message) {
        const timestamp = new Date().toString()
        console.error('\x1b[31m%s\x1b[0m', `${timestamp} - ${message}`)
    }

    return {
        debug,
        error,
    }
}

function generateTimestamp() {
    return Math.floor(new Date() / 1000)
}

module.exports = {
    checkEnvVar,
    generateTimestamp,
    logger,
}
