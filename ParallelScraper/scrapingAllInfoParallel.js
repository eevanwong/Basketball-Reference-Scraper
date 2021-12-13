const puppeteer = require("puppeteer");
const fs = require("fs");
const bluebird = require("bluebird");

const BASE = "https://www.basketball-reference.com";


const getTeamLinks = async () => {
  const BASE = "https://www.basketball-reference.com";
  console.log("Opening browser...");
  const browser = await puppeteer.launch();

  console.log("Opening page...");
  const page = await browser.newPage();

  console.log("Going to bballref website");
  await page.goto(BASE + "/teams");

  return (TLINKS = await page.$$eval(
    //code grabs all active team links
    "#div_teams_active [data-stat='franch_name'] a[href]",
    (links) => {
      return links.map((a) => a.getAttribute("href"));
    }
  ));
};

const parallelScraping = async (TLINKS) => {
  const team = {};
  const browser = await puppeteer.launch();

  await bluebird.map( // leveraged bluebird, could also do p-limit or smthn, just needed to limit number of promises to avoid crashes or smthn
      TLINKS,
      async (url) => {
        url = BASE + url;
        console.log(`Going to ${url}`);
        const page = await browser.newPage();
        try {
          await page.goto(url);
          let YLINKS = await page.$$eval(
            "[data-stat='season'] a[href]",
            (links) => {
              return links.map((a) => a.getAttribute("href"));
            }
          );

          YLINKS = YLINKS.slice(0, 39); //past 40 seasons

          for (const link of YLINKS) {
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
        } catch(err) {
          console.log(err)
        } finally {
          await page.close();
        } 
      },
      { concurrency: 5 }
    );

  await browser.close();
  return team;
};

async function pupScraping() {
  const TLINKS = await getTeamLinks();

  const start = Date.now();

  const team = await parallelScraping(TLINKS);

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
