const {getScoreElement} = require('./common');

function generateAuditDialog(is_schedule) {
    let title = 'Run Lighthouse Audit';
    let callback_id = 'auditcreate';
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

    if (is_schedule) {
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

    // Option dropdowns
    const throttling = generateCheckbox('Throttling', 'throttling');
    elements.push(throttling);

    const category_performance = generateCheckbox('Performance', 'performance');
    elements.push(category_performance);

    const category_accessibility = generateCheckbox('Accessibility', 'accessibility');
    elements.push(category_accessibility);

    const category_best_practices = generateCheckbox('Best Practices', 'best-practices');
    elements.push(category_best_practices);

    const category_pwa = generateCheckbox('PWA', 'pwa');
    elements.push(category_pwa);

    const category_seo = generateCheckbox('SEO', 'seo');
    elements.push(category_seo);

    // Authentication script
    const auth_script = {
        display_name: 'Authentication Script',
        name: 'auth_script',
        type: 'textarea',
        help_text: 'If you need to test a page that requires an authenticated user, insert a code snippet that will authenticate puppeteer into your app before testing',
        optional: true,
    };
    elements.push(auth_script);

    const await_selector = {
        display_name: 'Await Selector',
        name: 'await_selector',
        type: 'text',
        help_text: 'Please input a selector for an element in the authentication page (required when using an Authentication Script)',
        placeholder: '#loginId',
        optional: true,
    };
    elements.push(await_selector);

    return {
        callback_id,
        title,
        elements,
        notify_on_cancel: false,
    };
}

function generateReportAttachment(report, url) {
    let fields = [];
    let total_score = 0;
    let category_count = 0;
    const categories = report.categories;

    // Add scores per category
    for(const key in categories) {
        const category = categories[key];
        if (category && category.score) {
            total_score += category.score;
            category_count++;
            fields.push({
                short: true,
                title: category.title,
                value: `## \`${Math.floor(category.score * 100)}\``
            });
        }
    }

    const avg_score = total_score / category_count;
    const color = getScoreElement(avg_score, 'color');

    // Add division
    fields.push({
        short: false,
        title: '',
        value: `---`
    });

    // Audits
    const audits = report.audits;
    const tti = generateAuditField(audits['interactive']);
    const fcp = generateAuditField(audits['first-contentful-paint']);
    const fmp = generateAuditField(audits['first-meaningful-paint']);
    const si = generateAuditField(audits['speed-index']);
    const fci = generateAuditField(audits['first-cpu-idle']);
    const mpfid = generateAuditField(audits['max-potential-fid']);

    fields.push(tti);
    fields.push(fcp);
    fields.push(fmp);
    fields.push(si);
    fields.push(fci);
    fields.push(mpfid);

    return {
        text: `#### Lighthouse Audit for [${url}](${url})\n#### Average Score: \`${Math.floor(avg_score * 100)}\``,
        color,
        fields
    };
}

function generateCheckbox(display_name, name) {
    return {
        display_name: `Enable ${display_name}`,
        name,
        type: 'bool',
        default: 'True',
        optional: true,
    };
}

function generateAuditField(audit) {
    const emoji = getScoreElement(audit.score, 'emoji');

    return {
        short: true,
        title: audit.title,
        value: `### ${emoji} \`${audit.displayValue}\``
    };
}

function generateBulletCheckbox(key, value) {
    let text = '';
    if (value === 'True') {
        text += '- [x] ';
    } else {
        text += '- [ ] ';
    }
    text += key;
    return text;
}

function generateScheduleInfo(schedule) {
    let fields = [];

    fields.push({
        short: false,
        title: '',
        value: '---',
    });

    fields.push({
        short: false,
        title: 'Configurations:',
        value: '',
    });

    const throttling = generateBulletCheckbox('Throttling', schedule.throttling);
    fields.push({
        short: true,
        title: '',
        value: throttling
    });

    const performance = generateBulletCheckbox('Performance', schedule.performance);
    fields.push({
        short: true,
        title: '',
        value: performance
    });

    const accessibility = generateBulletCheckbox('Accessibility', schedule.accessibility);
    fields.push({
        short: true,
        title: '',
        value: accessibility
    });

    const best_practices = generateBulletCheckbox('Best Practices', schedule['best-practices']);
    fields.push({
        short: true,
        title: '',
        value: best_practices
    });

    const pwa = generateBulletCheckbox('PWA', schedule.pwa);
    fields.push({
        short: true,
        title: '',
        value: pwa
    });

    const seo = generateBulletCheckbox('SEO', schedule.seo);
    fields.push({
        short: true,
        title: '',
        value: seo
    });
    
    if (schedule.auth_script) {
        fields.push({
            short: false,
            title: '',
            value: '---',
        });

        fields.push({
            short: false,
            title: 'Authentication Script',
            value: `\`\`\`javascript\n${schedule.auth_script}\n\`\`\``
        });

        fields.push({
            short: false,
            title: 'Await Selector',
            value: `\`${schedule.await_selector}\``
        });
    }

    return {
        attachments: [
            {
                title: schedule.audit_url,
                text: `**Job Schedule:** \`${schedule.schedule}\``,
                fields
            }
        ]
    };
}

module.exports = {
    generateAuditDialog,
    generateReportAttachment,
    generateScheduleInfo,
};
