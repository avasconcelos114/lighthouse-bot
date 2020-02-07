const mongoose = require('mongoose');
const utils = require('../utils');
const constants = require('../constants');

const mongoUsername = utils.checkEnvVar(constants.MONGO_USERNAME);
const mongoPassword = utils.checkEnvVar(constants.MONGO_PASSWORD);
const mongoServer = utils.checkEnvVar(constants.MONGO_SERVER);

mongoose.connect(`mongodb://${mongoUsername}:${mongoPassword}@${mongoServer}/admin`, {useNewUrlParser: true});

// Setting up Schedule schema
const schema = new mongoose.Schema({
    createdDate: Number, // unix timestamp
    creator: String, // username of person who registered a given schedule
    schedule: String, // cron formatted string for schedule to be initiated
});

const ScheduleModel = mongoose.model('Schedule', schema);

function checkConnection() {
    return mongoose.connection.readyState;
}

async function createSchedule(payload) {
    const newSchedule = new ScheduleModel({
        createdDate: utils.generateTimestamp(),
        creator: payload.creator,
        schedule: payload.schedule,
    });

    const data = await newSchedule.save();
    return data;
}

async function getScheduleList() {

}

async function deleteScheduleWithId() {

}

module.exports = {
    checkConnection,
    createSchedule,
    getScheduleList,
    deleteScheduleWithId,
}