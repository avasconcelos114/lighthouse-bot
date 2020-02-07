const {logger} = require('./common');

function generateAuditDialog(isSchedule) {
    logger.debug('Attempting to build an audit dialog');
    let title = 'Run Lighthouse Audit';
    let elements = [];
    let schedule;

    const url = {
        display_name: 'URL',
        name: 'audit_url',
        type: 'text',
        subtype: 'url',
        help_text: 'The URL of the page for Lighthouse to run an audit for',
        placeholder: 'http://127.0.0.1',
        optional: false,
    };

    const authScript = {
        display_name: 'Authentication Script',
        name: 'auth_script',
        type: 'textarea',
        help_text: 'If you need to test a page that requires an authenticated user, insert a code snippet that will authenticate puppeteer into your app before testing',
        optional: true,
    };

    const throttle = {
        display_name: 'Throttling',
        name: 'throttling',
        type: 'select',
        default: 'enabled',
        optional: false,
        options: [
           {
             text: 'Enabled',
             value: 'enabled',
           },
           {
             text: 'Disabled',
             value: 'disabled',
           },
         ]
    };

    if (isSchedule) {
        title = 'Register Audit Schedule';
        schedule = {
            display_name: 'Schedule',
            name: 'schedule',
            type: 'text',
            default: '* * * * *',
            help_text: 'Input the frequency of scheduled audits using the Cron time format'
        };
    }

    elements.push(url);
    elements.push(throttle);
    elements.push(schedule);
    elements.push(authScript);

    return {
        callback_id: 'auditcreate',
        title: title,
        elements: elements,
        notify_on_cancel: false,
    };
}

module.exports = {
    generateAuditDialog,
};
