const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
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
        
        console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);
        
        await browser.close();
        return lhr;
    } catch(error) {
        logger.error(error.toString());
    }
}

module.exports = {
    runLighthouseAudit,
};
