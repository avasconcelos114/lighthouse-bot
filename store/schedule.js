const mongoose = require('mongoose');
const utils = require('../utils');

const schema = new mongoose.Schema({
    createdDate: Number, // unix timestamp
    user_id: String, // id of person who registered a given schedule
    schedule: String, // cron formatted string for schedule to be initiated
});

const ScheduleModel = mongoose.model('Schedule', schema);

async function createSchedule(payload) {
    const newSchedule = new ScheduleModel({
        createdDate: utils.common.generateTimestamp(),
        creator: payload.userId,
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
    createSchedule,
    getScheduleList,
    deleteScheduleWithId,
};
