const logger = {
    debug: function debug(message) {
        const timestamp = new Date().toString();
        console.log('\x1b[36m%s\x1b[0m', `${timestamp} - ${message}`);
    },
    
    error: function error(message) {
        const timestamp = new Date().toString();
        console.error('\x1b[31m%s\x1b[0m', `${timestamp} - ${message}`);
    }
};

function checkEnvVar(variable) {
    if (process.env[variable]) {
        return process.env[variable];
    }

    logger.error(`Error: the environment variable ${variable} has not been set!`);
    process.exit(1);
}

function generateTimestamp() {
    return Math.floor(new Date() / 1000);
}

function getColorForScore(score) {
    let color = '';
    if (score >= 0 && score < 0.5) {
        color = '#FF4F42';
    } else if (score >= 0.5 && score < 0.9) {
        color = '#FFA400';
    } else {
        color = '#0BCE6B';
    }
    return color;
}

module.exports = {
    logger,
    checkEnvVar,
    generateTimestamp,
    getColorForScore,
};
