const express = require('express');

const api = require('./api');
const utils = require('./utils');
const constants = require('./constants');
const store = require('./store');

const app = express();
app.use(express.json());

const PORT = utils.common.checkEnvVar(constants.PORT);
const CHATBOT_SERVER = utils.common.checkEnvVar(constants.CHATBOT_SERVER);

// TODO: create routes modules for API endpoints
app.get('/connection', function(req, res) {
    const connection = store.checkConnection();
    res.send({connection});
});

/************************
 * Entry API endpoint
 ***********************/
app.get('/lighthouse', async function(req, res) {
    const reqData = req.query;
    const reqOptions = reqData.text.split(' ');
    const urlPattern = /^http:/;
    switch(reqOptions[0]) {
        case 'schedule':
            // fetch schedule list
            if (reqOptions[1] && reqOptions[1] === 'list') {
                // generate schedule list and return to user (ephemeral if possible)

            } else if (reqOptions[1] && reqOptions[1] === 'remove') {
                // try to check if an 'id' was provided
                
            } else {
                // if none found, launch create schedule dialog
                const dialog = utils.response.generateAuditDialog(true);
                const payload = {
                    trigger_id: reqData.trigger_id,
                    url: `${CHATBOT_SERVER}:${PORT}/run_audit`,
                    dialog,
                };
                await api.openDialog(payload);
            }
            break;
        default:
            // try to parse for url formatted option
            if (reqOptions[1] && urlPattern.test(reqOptions[1])) {
                // if url found, perform quick audit

            } else {
                // if NO url is found, launch dialog with audit options
                const dialog = utils.response.generateAuditDialog();
                const payload = {
                    trigger_id: reqData.trigger_id,
                    url: `${CHATBOT_SERVER}:${PORT}/run_audit`,
                    dialog,
                };
                await api.openDialog(payload);
            }
    }
    res.send();
});

app.post('/run_audit', async function(req, res) {
    const data = req.body.submission;

    const response = await utils.lighthouse.runLighthouseAudit(data.url, data.authScript);
    console.log(response);
    res.send();
});

app.listen(PORT, () => utils.common.logger.debug(`bot listening on port ${PORT}!`));
