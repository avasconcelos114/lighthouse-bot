const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');

const {replaceStrings} = require('lighthouse/lighthouse-core/report/report-generator');
const htmlReportAssets = require('lighthouse/lighthouse-core/report/html/html-report-assets.js');

const {logger} = require('./common');

async function runLighthouseAudit(url, authScript) {
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

        browser.on('targetchanged', async target => {
            // If user has send an authentication script, inject page with it
            if (authScript) {
                const page = await target.page();
                if (page) {
                    const client = await page.target().createCDPSession();
                    await client.send('Runtime.evaluate', {
                        expression: `(${authScript.toString()})()`
                    });
                }
            }
        });

        // Lighthouse will open URL. Puppeteer observes `targetchanged` and sets up network conditions.
        // Possible race condition.
        const {lhr} = await lighthouse(url, {
            port: (new URL(browser.wsEndpoint())).port,
            output: 'json',
            logLevel: 'error',
        });
        
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
