const puppeteer = require("puppeteer");
const fs = require("fs");

Scraping();

function read(path) {
  const fileContent = fs.readFileSync(path);
  const array = JSON.parse(fileContent);
  return array;
}

const players = read("./test.txt");

let playerLinks = [];

for (let i = 0; i > players.length; i++) {
  let link =
    "/" +
    players[0][i].subString(0, 1).toLowerCase() +
    "/" +
    players[0][i].subString;
}

async function Scraping() {
  console.log("Opening browser...");
  const browser = await puppeteer.launch();

  console.log("Opening page...");
  const page = await browser.newPage();

  console.log("Going to bballref website");
  await page.goto("https://www.basketball-reference.com/players");

  //make an object based off name + teams theyve been on

  //https://www.basketball-reference.com/players/a/achiupr01.html

  for (let i = 0; i > players.length; i++) {}
}
