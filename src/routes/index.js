const express = require('express');
const fs = require('fs');
const router = express.Router();

const api = require('../api');
const constants = require('../constants');
const utils = require('../utils');
const store = require('../store');

const CHATBOT_SERVER = utils.common.checkEnvVar(constants.CHATBOT_SERVER);

router.get('/lighthouse', async function(req, res) {
    const req_data = req.query;
    const req_options = req_data.text.split(' ');
    const urlPattern = /^https?:\/\//;
    switch(req_options[0]) {
        case 'help':
            // TODO: Add help response with available options
            break;
        case 'schedule':
            if (req_options[1] && req_options[1] === 'list') {
                // generate schedule list and return to user (ephemeral if possible)

            } else if (req_options[1] && req_options[1] === 'remove') {
                // try to check if an 'id' was provided
                
            } else {
                // if none found, launch create schedule dialog
                const dialog = utils.response.generateAuditDialog(true);
                const payload = {
                    trigger_id: req_data.trigger_id,
                    url: `${CHATBOT_SERVER}/run_audit`,
                    dialog,
                };
                await api.openDialog(payload);
            }
            break;
        default:
            if (req_options[0] && urlPattern.test(req_options[0])) {
                // Quick audit
                await runAudit(req_options[0], req_data.user_id, req_data.channel_id);
            } else {
                // Audit dialog w/ options
                const dialog = utils.response.generateAuditDialog();
                const payload = {
                    trigger_id: req_data.trigger_id,
                    url: `${CHATBOT_SERVER}/run_audit`,
                    dialog,
                };
                await api.openDialog(payload);
            }
    }
    res.send();
});

router.post('/run_audit', async function(req, res) {
    const body = req.body;
    const {audit_url, auth_script} = body.submission;
    res.send('OK'); // Dismissing modal with a response
    await runAudit(audit_url, body.user_id, body.channel_id, auth_script);
});

router.get('/view_report/:id', async function(req, res) {
    const id = req.params.id;
    res.setHeader('Content-Type', 'text/html');
    try {
        const report = await store.audit.getAuditReport(id);
        const html = utils.lighthouse.generateHtmlReport(report);
        res.send(html);
    } catch(error) {
        utils.common.logger.error(error);
        const html = fs.readFileSync(__dirname + '/../static/404.html', 'utf8');
        res.send(html);
    }
});

async function runAudit(url, user_id, channel_id, auth_script) {
    let today = new Date();
    let time = today.toLocaleTimeString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'});
    try {
        await api.sendEphemeralPostToUser(user_id, channel_id, `Running audit report for [${url}](${url})!\nPlease wait for the audit to be completed`);
        const lhs = await utils.lighthouse.runLighthouseAudit(url, auth_script);
        const reportAttachment = utils.response.generateReportAttachment(lhs, url);
        const audit = await store.audit.createAudit(user_id, JSON.stringify(lhs));
        const payload = {
            channel_id: channel_id,
            message: `#lighthouse_audit\nPerformance auditing completed at \`${time}\`\n\nView full report [here](${CHATBOT_SERVER}/view_report/${audit._id})`,
            props: {
                attachments: [
                    reportAttachment,
                ],
            },
        };
        await api.sendPostToChannel(payload);
    } catch(error) {
        utils.common.logger.error(error);
        await api.sendEphemeralPostToUser(user_id, channel_id, `Failed to run audit, please try again or contact an administrator.`);
    }
}

module.exports = router;
