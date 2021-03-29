const puppeteer = require("puppeteer");
const fs = require("fs");

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

  let team = {};

  for (let i = 0; i < TLINKS.length; i++) {
    //get links for past 12 years for each team
    console.log("Going to" + TLINKS[i]);
    await page.goto(BASE + TLINKS[i]);
    let YLINKS = await page.$$eval("[data-stat='season'] a[href]", (links) => {
      return links.map((a) => a.getAttribute("href"));
    });
    YLINKS = YLINKS.slice(0, 12);
    console.log(YLINKS);

    for (let j = 0; j < YLINKS.length; j++) {
      console.log("Going to " + BASE + YLINKS[j]);
      await page.goto(BASE + YLINKS[j]);

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
        YLINKS[j]
          .substring(7, YLINKS[j].length)
          .replace("/", "-")
          .replace(".html", "")
      ] = allPlayers; //substring will include index 7

      //if they were traded with each other, then they are considered to play on the same team
    }
  }
  console.log(team);
  fs.writeFile("data.json", JSON.stringify(team), (err) => {
    //writing entire team json to json file
    if (err) {
      console.log("err writing team to json" + "\n");
      console.log(err);
    }
  });
  await browser.close();

  //make an object based off name + teams theyve been on

  //https://www.basketball-reference.com/players/a/achiupr01.html
}
