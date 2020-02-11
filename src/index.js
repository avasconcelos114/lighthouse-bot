const express = require('express');
const path = require('path');
const utils = require('./utils');
const constants = require('./constants');
const store = require('./store');
const routes = require('./routes');
const PORT = utils.common.checkEnvVar(constants.PORT);

const publicDirPath = path.join(__dirname, "./static");

const app = express();
require('run-middleware')(app);
app.use(express.json());
app.use(express.static(publicDirPath));
    
app.use('/', routes);
    
app.listen(PORT, async function() {
    // On server startup, load all stored schedules and queue them to be run
    const list = await store.schedule.getScheduleList();
    for (let schedule of list) {
        utils.schedule.scheduleJob(schedule, async function() {
            const options = {
                throttling: schedule.throttling,
                performance: schedule.performance,
                accessibility: schedule.accessibility,
                pwa: schedule.throttling,
                seo: schedule.throttling,
            };

            app.runMiddleware('/init_audit', {
                method: 'POST',
                body: {
                    url: schedule.audit_url,
                    user_id: schedule.user_id,
                    channel_id: schedule.channel_id,
                    options
                }
            });
        });
    }
    utils.common.logger.debug(`bot listening on port ${PORT}!`);
});
