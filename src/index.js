const express = require('express');
const path = require('path');
const utils = require('./utils');
const constants = require('./constants');
const routes = require('./routes');

const PORT = utils.common.checkEnvVar(constants.PORT);

const publicDirPath = path.join(__dirname, "./static");


const app = express();
app.use(express.json());
app.use(express.static(publicDirPath));

// TODO: On server startup, load all stored schedules and queue them to be run
// utils.schedule.scheduleJob({_id: 'abcde', schedule: '*/1 * * * *'}, function() {
//     console.log('RUNNING SCHEDULED JOB');
// });

app.use('/', routes);

app.listen(PORT, () => utils.common.logger.debug(`bot listening on port ${PORT}!`));
