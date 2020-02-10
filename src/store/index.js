const mongoose = require('mongoose');
const utils = require('../utils');
const constants = require('../constants');

const schedule = require('./schedule');
const audit = require('./audit');

const mongoUsername = utils.common.checkEnvVar(constants.MONGO_USERNAME);
const mongoPassword = utils.common.checkEnvVar(constants.MONGO_PASSWORD);
const mongoServer = utils.common.checkEnvVar(constants.MONGO_SERVER);

mongoose.connect(`mongodb://${mongoUsername}:${mongoPassword}@${mongoServer}/admin`, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = {
    schedule,
    audit,
};
