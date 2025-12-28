import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import readline from 'node:readline';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

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
    // note, it will not scrape if its headless AND the agent is not set - will explain later:
    const browser = await puppeteer.launch({headless: false});

    try {
        // need to setup file name to make it consistent when you run from any working directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const absolutePath = path.join(__dirname, `./data/${name}.json`);
        // console.log(absolutePath);

        const start = Date.now();
        const result = await scraper(browser); // a big dictionary
        const end = Date.now();
        console.log(`Time Taken to execute = ${(end - start) / 1000} seconds`);
        
        // Write result to custom file name (flag is necessary to not fail if the file doesnt exist)
        await fs.writeFile(absolutePath, JSON.stringify(result, null), { flag: 'w' });
    }
    catch (error) {
        console.error(error);
        throw error;
    } finally {
        console.log(`Successfully wrote results to ./data/${name}.json`);
        await browser.close();
    }
}

await main();


