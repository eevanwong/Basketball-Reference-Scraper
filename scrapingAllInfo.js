const puppeteer = require("puppeteer");

Scraping();

async function Scraping() {
  const BASE = "https://www.basketball-reference.com";

  console.log("Opening browser...");
  const browser = await puppeteer.launch();

  console.log("Opening page...");
  const page = await browser.newPage();

  console.log("Going to bballref website");
  await page.goto("https://www.basketball-reference.com/teams");

  const TLINKS = await page.$$eval(
    //code grabs all active team links
    "#div_teams_active [data-stat='franch_name'] a[href]",
    (links) => {
      return links.map((a) => a.getAttribute("href"));
    }
  );

  //iterate through the links

  for (let i = 0; i < TLINKS.length; i++) {
    //get links for past 12 years for each team
    console.log("Going to" + TLINKS[i]);
    await page.goto(BASE + TLINKS[i]);
    let YLINKS = await page.$$eval("[data-stat='season'] a[href]", (links) => {
      return links.map((a) => a.getAttribute("href"));
    });
    YLINKS = YLINKS.slice(0, 12);
    console.log(YLINKS);
  }

  console.log(TLINKS);
  //make an object based off name + teams theyve been on

  //https://www.basketball-reference.com/players/a/achiupr01.html
}
