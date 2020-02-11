const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');

const {replaceStrings} = require('lighthouse/lighthouse-core/report/report-generator');
const htmlReportAssets = require('lighthouse/lighthouse-core/report/html/html-report-assets.js');

const {logger} = require('./common');

async function runLighthouseAudit(url, options) {
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage'
            ]
        });

        // Run authentication script (as injected javascript)
        if (options.auth_script) {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: 'networkidle0',
            });
            await page.waitForSelector(options.wait_selector, {visible: true});
            await page.evaluate(options.auth_script);
            await page.waitForNavigation();
        }

        // Lighthouse will open URL. Puppeteer observes `targetchanged` and sets up network conditions.
        // Possible race condition.
        let opts = {
            port: (new URL(browser.wsEndpoint())).port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: [],
            emulatedFormFactor: 'desktop',
        };

        if (options.performance === 'True') opts.onlyCategories.push('performance');
        if (options.accessibility === 'True') opts.onlyCategories.push('accessibility');
        if (options['best-practices'] === 'True') opts.onlyCategories.push('best-practices');
        if (options.pwa === 'True') opts.onlyCategories.push('pwa');
        if (options.seo === 'True') opts.onlyCategories.push('seo');
        
        // as throttling is enabled by default, disable it if explicitly unchecked
        if (options.throttling === 'False') opts.throttlingMethod = 'provided';

        const {lhr} = await lighthouse(url, opts);
        
        await browser.close();
        return lhr;
    } catch(error) {
        logger.error(error.toString());
    }
}

function generateHtmlReport(lhr) {
    const REPORT_TEMPLATE = fs.readFileSync(__dirname + '/../static/reportTemplate.html', 'utf8');
    const REPORT_CSS = fs.readFileSync(__dirname + '/../static/reportStyles.css', 'utf8');
    const sanitizedJson = JSON.stringify(lhr)
      .replace(/</g, '\\u003c') // replaces opening script tags
      .replace(/\u2028/g, '\\u2028') // replaces line separators ()
      .replace(/\u2029/g, '\\u2029'); // replaces paragraph separators
    const sanitizedJavascript = htmlReportAssets.REPORT_JAVASCRIPT.replace(/<\//g, '\\u003c/');

    return replaceStrings(REPORT_TEMPLATE, [
      {search: '%%LIGHTHOUSE_JSON%%', replacement: sanitizedJson},
      {search: '%%LIGHTHOUSE_JAVASCRIPT%%', replacement: sanitizedJavascript},
      {search: '/*%%LIGHTHOUSE_CSS%%*/', replacement: REPORT_CSS},
      {search: '%%LIGHTHOUSE_TEMPLATES%%', replacement: htmlReportAssets.REPORT_TEMPLATES},
    ]);
}

module.exports = {
    runLighthouseAudit,
    generateHtmlReport,
};
