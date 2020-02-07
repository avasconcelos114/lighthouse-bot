const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const request = require('request');
const util = require('util');

async function runLighthouseAudit(url, authScript) {
    const opts = {
    //chromeFlags: ['--headless'],
    logLevel: 'info',
    output: 'json'
    };

    // Launch chrome using chrome-launcher.
    const chrome = await chromeLauncher.launch(opts);
    opts.port = chrome.port;

    // Connect to it using puppeteer.connect().
    const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`);
    const {webSocketDebuggerUrl} = JSON.parse(resp.body);
    const browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl});

    if (authScript) {
        let authFunction = eval(authScript);
        authFunction();
    }

    // Run Lighthouse.
    const {lhr}  = await lighthouse(url, opts, null);
    console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);

    await browser.disconnect();
    await chrome.kill();
    return lhr;
}

module.exports = {
    runLighthouseAudit,
};
