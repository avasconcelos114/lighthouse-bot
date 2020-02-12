const mongoose = require('mongoose');
const utils = require('../utils');

const schema = new mongoose.Schema({
    created_date: Number, // unix timestamp
    user_id: String, // id of person who registered a given schedule
    username: String,
    channel_id: String, // The channel in which to post schedule audit reports at
    channel_display_name: String,
    team_id: String,
    team_display_name: String,

    // Audit options
    schedule: String,
    audit_url: String,
    auth_script: String,
    wait_selector: String,
    performance: String,
    accessibility: String,
    'best-practices': String,
    seo: String,
    pwa: String,
    throttling: String,
});

const ScheduleModel = mongoose.model('Schedule', schema);

async function createSchedule(payload) {
    const new_schedule = new ScheduleModel({
        created_date: utils.common.generateTimestamp(),
        user_id: payload.user_id,
        username: payload.username,
        channel_id: payload.channel_id,
        channel_display_name: payload.channel_display_name,
        team_id: payload.team_id,
        team_display_name: payload.team_display_name,
        schedule: payload.schedule,
        audit_url: payload.audit_url,
        auth_script: payload.auth_script,
        wait_selector: payload.wait_selector,
        performance: payload.performance,
        accessibility: payload.accessibility,
        'best-practices': payload['best-practices'],
        seo: payload.seo,
        pwa: payload.pwa,
        throttling: payload.throttling,
    });

    const data = await new_schedule.save();
    return data;
}

async function getScheduleList() {
    const list = await ScheduleModel.find();
    return list;
}

async function deleteScheduleWithId(id) {
    const data = await ScheduleModel.findByIdAndDelete(id);
    return data;
}

module.exports = {
    createSchedule,
    getScheduleList,
    deleteScheduleWithId,
};
