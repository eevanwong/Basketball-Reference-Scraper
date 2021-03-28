const puppeteer = require("puppeteer");

console.log("Opening browser...");
const browser = await puppeteer.launch();

console.log("Opening page...");
const page = await browser.newPage();

console.log("Going to bballref website");
await page.goto("https://www.basketball-reference.com/teams/");
