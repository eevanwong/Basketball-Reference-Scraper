const puppeteer = require("puppeteer");
const fs = require("fs");
// const bluebird = require("bluebird");

const BASE = "https://www.basketball-reference.com";

const withBrowser = async (fn) => {
  const browser = await puppeteer.launch();
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
};

const withPage = (browser) => async (fn) => {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
};

const getTeamLinks = async () => {
  console.log("Opening browser...");
  const browser = await puppeteer.launch();

  console.log("Opening page...");
  const page = await browser.newPage();

  console.log("Going to bballref website");
  await page.goto(BASE + "/teams");

  const TLINKS = await page.$$eval(
    //code grabs all active team links
    "#div_teams_active [data-stat='franch_name'] a[href]",
    (links) => links.map((a) => a.getAttribute("href"))
  );

  await browser.close();

  return TLINKS;
};

const nonParallelScraping = async (TLINKS) => {
  const team = {};

  await withBrowser(async (browser) => {
    for (const url of TLINKS) {
      await withPage(browser)(async (page) => {
        //get links for past 12 years for each team
        console.log("Going to" + url);
        await page.goto(BASE + url);
        let YLINKS = await page.$$eval(
          "[data-stat='season'] a[href]",
          (links) => {
            return links.map((a) => a.getAttribute("href"));
          }
        );
        YLINKS = YLINKS.slice(0, 39); //past 10 seasons for benchmarks
        //console.log(YLINKS);

        for (const link of YLINKS) {
          // console.log("Going to " + BASE + link);
          await page.goto(BASE + link);

          await page.waitForSelector('#roster [data-stat="player"]');

          let currentRoster = await page.$$eval(
            "#roster [data-stat='player'] a[href]",
            (links) => {
              return links.map((a) => {
                return a.textContent;
              });
            }
          );

          let beforeRoster = await page.$$eval(
            "#per_game [data-stat='player'] a[href]",
            (names) => {
              return names.map((name) => {
                return name.textContent;
              });
            }
          );

          let tradedAway = beforeRoster.filter((player) => {
            return !currentRoster.includes(player); //filters out all players that are found in the other array (! because if its false then its removed)
          });

          // console.log("Current Roster:" + currentRoster +'\n')
          // console.log("Players that were on but were traded: " + tradedAway)

          let allPlayers = currentRoster.concat(tradedAway);

          team[
            link
              .substring(7, link.length)
              .replace("/", "-")
              .replace(".html", "")
          ] = allPlayers; //substring will include index 7

          //if they were traded with each other, then they are considered to play on the same team
        }
      });
    }
  });

  return team;
};

async function pupScraping() {
  const TLINKS = await getTeamLinks();
  console.log(TLINKS);
  const start = Date.now();

  const team = await nonParallelScraping(TLINKS);

  const end = Date.now();

  console.log(`Time Taken to execute = ${(end - start) / 1000} seconds`);

  fs.writeFile("data1.json", JSON.stringify(team), (err) => {
    //writing entire team json to json file
    if (err) {
      console.log("err writing team to json" + "\n");
      console.log(err);
    }
  });
  // console.log(team);
}

pupScraping();
