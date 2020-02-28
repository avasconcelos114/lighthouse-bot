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
    const url_pattern = /^https?:\/\//;
    switch(req_options[0]) {
        case 'help':
            res.send({
                text: '**Lighthouse Audit Bot - Slash Command Help**\n\n'
                + '* `/lighthouse` - Launch dialog to run ad-hoc audits with full control over options\n'
                + '* `/lighthouse {url}` - Run a quick audit with default settings on a website\n'
                + '* `/lighthouse jobs` - Launch dialog to create an audit job with full control over options\n'
                + '* `/lighthouse jobs ls` - Show full list of schedules created\n'
                + '* `/lighthouse jobs info {id}` - Show configuration of a given job\n'
                + '* `/lighthouse jobs rm {id}` - Removes a scheduled audit job (You may input several IDs in the same command)\n'
                + '* `/lighthouse stats {url} - Returns a link to the audit trends dashboard of a given URL (**MUST** have performed at least 2 audits on the URL beforehand)'
            });
            return;
        case 'stats':
            const url = req_options[1];
            if (!url) {
                res.send({
                    text: 'Please input the URL that you\'d like to view stats of with `/lighthouse stats {url}`'
                });
                return;
            }

            // check if more than 2 audits have run in the past
            const audits = await store.audit.getAuditReportsByUrl(url);
            if (audits.length < 2) {
                res.send({
                    text: `Please ensure you have run at least 2 audit runs on the URL ${url}`
                });
                return;
            }

            res.send({
                text: `[Click here](${CHATBOT_SERVER}/view_stats?url=${url}) to view all auditing statistics for ${url}`
            });
            break;
        case 'jobs':
            switch (req_options[1]) {
                case 'ls':
                    // generate schedule list and return to user
                    const list = await store.schedule.getScheduleList();
                    let text = 'No scheduled jobs found';
                    if (list.length > 0) {
                        text = '| id | Creator | Channel | Team | URL | Schedule |\n| :--: | :--: | :--: | :--: | :--: | :--: | \n';
                        for(let schedule of list) {
                            text += `| ${schedule._id} | @${schedule.username} | ${schedule.channel_display_name} | ${schedule.team_display_name} | ${schedule.audit_url} | ${schedule.schedule} |\n`;
                        }
                    }
                    res.send({text});
                    break;
                case 'rm':
                    // remove a scheduled job if a valid ID is provided
                    if (!req_options[2]) {
                        res.send({
                            text: 'Please input the ID of the schedule you\'d like to remove as `/lighthouse remove {id}`\nYou may retrieve this value by running the `/lighthouse jobs ls` command'
                        });
                        return;
                    }

                    let id_idx = 2;
                    let deleted_items = [];
                    while(req_options[id_idx]) {
                        try {
                            await store.schedule.deleteScheduleWithId(req_options[id_idx]);
                            utils.schedule.removeJob(req_options[id_idx]);
                            utils.common.logger.info(`removed scheduled job with id=${req_options[id_idx]}`);
                            deleted_items.push({isDeleted: true, text: `Deleted: ${req_options[id_idx]}`});
                        } catch(error) {
                            utils.common.logger.error(error);
                            deleted_items.push({isDeleted: false, text: `Error: Failed to remove scheduled job with ID \`${req_options[id_idx]}\`.\nPlease make sure the ID you selected is valid with the \`/lighthouse jobs ls\` command.`});
                        }
                        id_idx++;
                    }

                    let response = 'Scheduled jobs deletion:';
                    for (item of deleted_items) {
                        response += `* ${item.text}\n`;
                    }

                    res.send({
                        text: response
                    });
                    break;

                case 'info':
                    const id = req_options[2];
                    if (!id) {
                        res.send({
                            text: 'Please input the ID of the schedule you\'d like to view details of as `/lighthouse info {id}`\nYou may retrieve this value by running the `/lighthouse jobs ls` command'
                        });
                        return;
                    }

                    try {
                        const schedule = await store.schedule.getSchedule(id);
                        const response = utils.response.generateScheduleInfo(schedule);
                        utils.common.logger.info(`retrieved information on schedule with id="${schedule._id}" for user_id=${req_data.user_id}`);
                        res.send(response);
                    } catch(error) {
                        utils.common.logger.error(error);
                        res.send({text: `Failed to fetch information for job with ID \`${id}\`.\nPlease make sure the ID you selected is valid with the \`/lighthouse jobs ls\` command.`});
                    }
                    break;
                default:
                    // if none found, launch create schedule dialog
                    utils.common.logger.info(`launching job scheduling dialog for user_id=${req_data.user_id}`);
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
            if (req_options[0] && url_pattern.test(req_options[0])) {
                // Run quick audit if value URL is found in command
                const opts = {
                    performance: true,
                    accessibility: true,
                    'best-practices': true,
                    pwa: true,
                    seo: true,
                    throttling: false,
                };  
                await runAudit(req_options[0], req_data.user_id, req_data.channel_id, opts);
            } else {
                // Launch audit dialog w/ options
                utils.common.logger.info(`launching audit dialog for user_id=${req_data.user_id}`);
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
    const {user_id, channel_id, team_id, submission} = req.body;
    
    const {username} = await api.getUser(user_id);
    const channel = await api.getChannel(channel_id);
    const team = await api.getTeam(team_id);
    try {
        const schedule = await store.schedule.createSchedule({
            user_id,
            channel_id,
            username,
            channel_display_name: channel.display_name,
            team_display_name: team.display_name,
            ...submission,
        });
    
        utils.schedule.scheduleJob(schedule, async function() {
            const options = {
                throttling: schedule.throttling,
                performance: schedule.performance,
                accessibility: schedule.accessibility,
                'best-practices': schedule['best-practices'],
                pwa: schedule.pwa,
                seo: schedule.seo,
                auth_script: schedule.auth_script,
                await_selector: schedule.await_selector,
            };
            await runAudit(schedule.audit_url, schedule.user_id, schedule.channel_id, options);
        });

        let text = 'Successfully scheduled a new job!\n\n| id | Creator | Channel | Team | URL | Schedule |\n| :--: | :--: | :--: | :--: | :--: | :--: | \n';
        text += `| ${schedule._id} | @${schedule.username} | ${schedule.channel_display_name} | ${schedule.team_display_name} | ${schedule.audit_url} | ${schedule.schedule} |\n`;
        await api.sendEphemeralPostToUser(user_id, channel_id, text);
    } catch(error) {
        utils.common.logger.error(error);
        await api.sendEphemeralPostToUser(user_id, channel_id, 'Failed to schedule a job, please try again or contact an administrator for support.');
    }

    res.send();
});

/********************************
* Audit Run
*********************************/
router.post('/run_audit', async function(req, res) {
    const body = req.body;
    const {audit_url} = body.submission;

    const validation_error = validateOptions(body.submission);
    if (validation_error) {
        utils.common.logger.error(validation_error);
        res.send({error: validation_error});
        return;
    } else {
        res.send(); // make sure dialog gets dismissed
    }

    await runAudit(audit_url, body.user_id, body.channel_id, body.submission);
});

// Using as middleware in order to add schedules from app root
// TODO: investigate more adequate pattern to make runAudit re-usable with current project structure
router.post('/init_audit', async function(req, res) {
    const {audit_url, user_id, channel_id, options} = req.body;
    res.send();
    await runAudit(audit_url, user_id, channel_id, options);
});

async function runAudit(url, user_id, channel_id, options) {
    let time = utils.common.generateCurrentTime();

    try {
        utils.common.logger.debug(`Running audit report for url=${url}`);
        await api.sendEphemeralPostToUser(user_id, channel_id, `Running audit report for [${url}](${url})!\nPlease wait for the audit to be completed`);
        const lhs = await utils.lighthouse.runLighthouseAudit(url, options);
        const report = utils.response.generateReportAttachment(lhs, url);
        const audit = await store.audit.createAudit(user_id, JSON.stringify(lhs), url);
        const payload = {
            channel_id: channel_id,
            message: `#lighthouse_audit\nPerformance auditing completed at \`${time}\`\n\nView full report [here](${CHATBOT_SERVER}/view_report/${audit._id})`,
            props: {
                attachments: [
                    report,
                ],
            },
        };
        await api.sendPostToChannel(payload);
    } catch(error) {
        utils.common.logger.error('Failed to run audit');
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
        return 'Please make sure you have at least one category enabled';
    }

    if (options.auth_script && !options.await_selector) {
        return 'Please input an await selector when using an Authentication Script';
    }
    return null;
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

router.get('/view_stats', async function(req, res) {
    const {url} = req.query;
    res.setHeader('Content-Type', 'text/html');
    try {
        if (!url) {
            throw new Error('No URL parameter found when trying to render stats');
        }

        const data = {
            url,
            performance: [],
            accessibility: [],
            'best-practices': [],
            pwa: [],
            seo: [],
        };
        const audits = await store.audit.getAuditReportsByUrl(url);
        for (let audit of audits) {
            const report = JSON.parse(audit.report);
            const date = new Date(audit.created_date * 1000).toLocaleTimeString([], {year: 'numeric', month: '2-digit', day: '2-digit'});
            
            // Add null checks
            if (report.categories.performance) {
                data.performance.push({time: date, value: report.categories.performance.score * 100});
            }
            if (report.categories.accessibility) {
                data.accessibility.push({time: date, value: report.categories.accessibility.score * 100});
            }
            if (report.categories['best-practices']) {
                data['best-practices'].push({time: date, value: report.categories['best-practices'].score * 100});
            }
            if (report.categories.pwa) {
                data.pwa.push({time: date, value: report.categories.pwa.score * 100});
            }
            if (report.categories.seo) {
                data.seo.push({time: date, value: report.categories.seo.score * 100});
            }
        }

        const html = utils.lighthouse.generateHtmlStats(data);
        res.send(html);
    } catch(error) {
        utils.common.logger.error(error);
        const html = fs.readFileSync(__dirname + '/../static/404.html', 'utf8');
        res.send(html);
    }
});

module.exports = router;
