import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'node:readline';

import scraper from './scraper/scraper.js';

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const name = await new Promise((resolve) => {
        rl.question("What file would you like to write this to (a file will be created or overwritten)? ", (answer) => {
            resolve(answer || "data");
        });
    });
    rl.close();

    console.log("Opening browser...");
    const browser = await puppeteer.launch({headless: false});

    try {
        const start = Date.now();
        const result = await scraper(browser);
        const end = Date.now();
        console.log(`Time Taken to execute = ${(end - start) / 1000} seconds`);
        
        // Write result to custom file name
        await fs.writeFile(`./data/${name}.json`, JSON.stringify(result, null, (err) => { console.log(err) }));
        console.log(`Successfully wrote results to ./data/${name}.json`);
    }
    catch (error) {
        console.error(error);
        throw error;
    } finally {
        await browser.close();
    }
}

await main();


