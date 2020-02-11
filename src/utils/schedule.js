const schedule = require('node-schedule');

function scheduleJob(s, job) {
    schedule.scheduleJob(s._id, s.schedule, function() {
        job();
    });
}

module.exports = {
    scheduleJob,
};
