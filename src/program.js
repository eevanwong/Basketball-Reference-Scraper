import { scraping } from './scraper/asyncScraping'
const fs = require("fs");
const readline = require('node:readline');

// entry for the scraping method
async function pupScraping() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log("Opening browser...");
    const browser = await puppeteer.launch();

    // I set the file name for testing so nothing is overwritten
    rl.question("What file would you like to write this to (a file will be created or overwritten)?", (name = "data") => {
        fs.writeFile(`./data/${name}.json`, JSON.stringify(team), async (err) => {
            //writing entire team json to json file
            try {
                const start = Date.now();
                await scraping(browser);
                const end = Date.now();
                console.log(`Time Taken to execute = ${(end - start) / 1000} seconds`);
            }
            catch (error) {
                console.error(error);
                throw error;
            } finally {
                // will clean everything up
                await browser.close();
            }
            if (err) {
                console.log(`err writing team to json: ${err}` + "\n");
            }
        });
    })
}

await pupScraping();
