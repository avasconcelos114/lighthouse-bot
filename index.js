const express = require('express');
const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
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
                    url: `${CHATBOT_SERVER}/run_audit`,
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
                    url: `${CHATBOT_SERVER}/run_audit`,
                    dialog,
                };
                await api.openDialog(payload);
            }
    }
    res.send();
});

app.post('/run_audit', async function(req, res) {
    const body = req.body;
    const {audit_url, auth_script} = body.submission;
    // TODO: separate audit run into function to be re-utilized in scheduled runs and ad-hoc slash commands
    let today = new Date();
    let time = today.toLocaleTimeString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'});

    try {
        res.send('OK'); // Dismissing modal with a response
        await api.sendEphemeralPostToUser(body.user_id, body.channel_id, `Running audit report for [${audit_url}](${audit_url})!\nPlease wait for the audit to be completed`);
        const lhs = await utils.lighthouse.runLighthouseAudit(audit_url, auth_script);
        const reportAttachment = utils.response.generateReportAttachment(lhs, audit_url);
        const audit = await store.audit.createAudit(body.user_id, JSON.stringify(lhs));
        const payload = {
            channel_id: body.channel_id,
            message: `#lighthouse_audit\nPerformance auditing completed at \`${time}\`\n\nView full report [here](${CHATBOT_SERVER}/view_report/${audit._id})`,
            props: {
                attachments: [
                    reportAttachment,
                ],
            },
        };
        await api.sendPostToChannel(payload);
    } catch(error) {
        // Respond with ephemeral error message
        utils.common.logger.error(error);
        await api.sendEphemeralPostToUser(body.user_id, body.channel_id, `Failed to run audit, please try again or contact an administrator.`);
    }
});

app.get('/view_report/:id', async function(req, res) {
    const id = req.params.id;
    const report = await store.audit.getAuditReport(id);
    // TODO: Return 404 page if report is not found
    const html = reportGenerator.generateReportHtml(report);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

app.listen(PORT, () => utils.common.logger.debug(`bot listening on port ${PORT}!`));
