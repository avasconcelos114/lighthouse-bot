const logger = {
    debug: function(message) {
        const timestamp = new Date().toString();
        console.log('\x1b[36m%s\x1b[0m', `${timestamp} - ${message}`);
    },
    
    error: function(message) {
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

function getScoreElement(score, type) {
    let color = '#0BCE6B';
    let emoji = ':white_check_mark:';
    if (score >= 0 && score < 0.5) {
        color = '#FF4F42';
        emoji = ':x:';
    } else if (score >= 0.5 && score < 0.9) {
        color = '#FFA400';
        emoji = ':warning:';
    }
    return type === 'color' ? color : emoji;
}

module.exports = {
    logger,
    checkEnvVar,
    generateTimestamp,
    getScoreElement,
};
