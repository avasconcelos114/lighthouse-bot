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
            res.send({
                text: '**Lighthouse Audit Bot - Slash Command Help**\n\n'
                + '* `/lighthouse {url}` - Run a quick audit with default settings on a website\n'
                + '* `/lighthouse` - Launch dialog to run ad-hoc audits with full control over options\n'
                + '* `/lighthouse schedule` - Launch dialog to create an audit job with full control over options\n'
                + '* `/lighthouse schedule list` - Show full list of schedules created\n'
                + '* `/lighthouse schedule remove {id}` - Removes a scheduled audit job'
            });
            return;
        case 'schedule':
            if (req_options[1] && req_options[1] === 'list') {
                // generate schedule list and return to user (ephemeral if possible)
                const list = await store.schedule.getScheduleList();
                let text = 'No scheduled jobs found';
                if (list.length > 0) {
                    text = '| id | Creator | Schedule |\n| :--: | :--: | :--: |\n';
                    for(let schedule of list) {
                        text += `| ${schedule._id} | ${schedule.user_id} | ${schedule.schedule} |\n`;
                    }
                }
                res.send({text});
            } else if (req_options[1] && req_options[1] === 'remove') {
                // try to check if an 'id' was provided
                if (!req_options[2]) {
                    res.send({
                        text: 'Please input the ID of the schedule you\'d like to remove as `/lighthouse remove {id}`'
                    });
                    return;
                }
                try {
                    await store.schedule.deleteScheduleWithId(req_options[2]);
                    res.send({
                        text: 'Successfully deleted scheduled job!'
                    });
                } catch(error) {
                    utils.common.logger.error(error);
                    res.send({
                        text: 'Failed to remove scheduled job.\nPlease make sure the ID you selected is valid with the `/lighthouse schedule list` command.'
                    });
                }
            } else {
                // if none found, launch create schedule dialog
                const dialog = utils.response.generateAuditDialog(true);
                const payload = {
                    trigger_id: req_data.trigger_id,
                    url: `${CHATBOT_SERVER}/create_schedule`,
                    dialog,
                };
                await api.openDialog(payload);
            }
            break;
        default:
            if (req_options[0] && urlPattern.test(req_options[0])) {
                // Quick audit
                const opts = {
                    performance: '1',
                    accessibility: '1',
                    'best-practices': '1',
                    pwa: '1',
                    seo: '1',
                };
                await runAudit(req_options[0], req_data.user_id, req_data.channel_id, opts);
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

/********************************
* Schedule Creation
*********************************/
router.post('/create_schedule', async function(req, res) {
    const {user_id, channel_id, submission} = req.body;

    const new_schedule = await store.schedule.createSchedule({user_id, channel_id, ...submission});
    utils.schedule.scheduleJob(new_schedule, async function() {
        const options = {
            throttling: new_schedule.throttling,
            performance: new_schedule.performance,
            accessibility: new_schedule.accessibility,
            pwa: new_schedule.throttling,
            seo: new_schedule.throttling,
        };
        await runAudit(new_schedule.audit_url, new_schedule.user_id, new_schedule.channel_id, options);
    });
            
    res.send();
});

/********************************
* Audit Run
*********************************/
router.post('/run_audit', async function(req, res) {
    const body = req.body;
    const {audit_url} = body.submission;

    const isValid = validateOptions(body.submission);
    if (!isValid) {
        res.send({error: 'Please make sure you have at least one category enabled'});
        return;
    } else {
        res.send(); // make sure dialog gets dismissed
    }

    await runAudit(audit_url, body.user_id, body.channel_id, body.submission);
});

async function runAudit(url, user_id, channel_id, options) {
    let today = new Date();
    let time = today.toLocaleTimeString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric'});

    try {
        await api.sendEphemeralPostToUser(user_id, channel_id, `Running audit report for [${url}](${url})!\nPlease wait for the audit to be completed`);
        const lhs = await utils.lighthouse.runLighthouseAudit(url, options);
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

function validateOptions(options) {
    if (
        options.performance === '0' &&
        options.accessibility === '0' &&
        options['best-practices'] === '0' &&
        options.pwa === '0' &&
        options.seo === '0'
    ) {
        return false;
    }
    return true;
}

/********************************
* Report Viewer
*********************************/
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

module.exports = router;
