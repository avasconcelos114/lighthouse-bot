const {logger, getColorForScore, getEmojiForScore} = require('./common');

function generateAuditDialog(isSchedule) {
    logger.debug('Attempting to build an audit dialog');
    let title = 'Run Lighthouse Audit';
    let elements = [];

    const url = {
        display_name: 'URL',
        name: 'audit_url',
        type: 'text',
        subtype: 'url',
        help_text: 'The URL of the page for Lighthouse to run an audit for',
        placeholder: 'http://127.0.0.1',
        optional: false,
    };
    elements.push(url);

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
    elements.push(throttle);

    if (isSchedule) {
        title = 'Register Audit Schedule';
        const schedule = {
            display_name: 'Schedule',
            name: 'schedule',
            type: 'text',
            default: '* * * * *',
            help_text: 'Input the frequency of scheduled audits using the Cron time format'
        };
        elements.push(schedule);
    }

    const authScript = {
        display_name: 'Authentication Script',
        name: 'auth_script',
        type: 'textarea',
        help_text: 'If you need to test a page that requires an authenticated user, insert a code snippet that will authenticate puppeteer into your app before testing',
        optional: true,
    };
    elements.push(authScript);

    return {
        callback_id: 'auditcreate',
        title: title,
        elements: elements,
        notify_on_cancel: false,
    };
}

function generateReportAttachment(report, url) {
    let fields = [];
    let totalScore = 0;
    let categoryCount = 0;
    const categories = report.categories;

    // Add scores per category
    for(const key in categories) {
        const category = categories[key];
        totalScore += category.score;
        categoryCount++;

        fields.push({
            short: true,
            title: category.title,
            value: `## \`${Math.floor(category.score * 100)}\``
        });
    }

    const avgScore = totalScore / categoryCount;
    const color = getColorForScore(avgScore);

    // Add division
    fields.push({
        short: false,
        title: '',
        value: `---`
    });

    // Audits
    // TODO: Find way to let user select which audits will be available on the in-channel report
    const audits = report.audits;
    const timeToInteractive = generateAuditField(audits['interactive']);
    const firstContentfulPaint = generateAuditField(audits['first-contentful-paint']);
    const firstMeaningfulPaint = generateAuditField(audits['first-meaningful-paint']);
    const speedIndex = generateAuditField(audits['speed-index']);
    const firstCpuIdle = generateAuditField(audits['first-cpu-idle']);
    const maxPotentialFid = generateAuditField(audits['max-potential-fid']);

    fields.push(timeToInteractive);
    fields.push(firstContentfulPaint);
    fields.push(firstMeaningfulPaint);
    fields.push(speedIndex);
    fields.push(firstCpuIdle);
    fields.push(maxPotentialFid);

    return {
        text: `#### Lighthouse Audit for [${url}](${url})\n##### Average Score: \`${Math.floor(avgScore * 100)}\``,
        color,
        fields
    };
}

function generateAuditField(audit) {
    const emoji = getEmojiForScore(audit.score);

    return {
        short: true,
        title: audit.title,
        value: `### ${emoji} \`${audit.displayValue}\``
    };
}

module.exports = {
    generateAuditDialog,
    generateReportAttachment,
};
