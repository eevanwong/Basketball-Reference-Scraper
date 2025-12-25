// const puppeteer = require("puppeteer");
const fs = require("fs");

const BASE = "https://www.basketball-reference.com";

async function getTeamUrls(page) {
  await page.goto(BASE + "/teams");

  const teamUrls = await page.$$eval(
    "#div_teams_active [data-stat='franch_name'] a[href]",
    (links) => links.map((a) => a.getAttribute("href") + 'players.html')
  );
  console.log(teamUrls);
  return teamUrls;
};

// Scraping function will setup 5 worker threads that individually open and scrape a page of players that have played on a franchise
// the worker threads will send their results to the main thread who will individually read/write to the data file
export default async function scraping(browser) {
  const team = {};
  // const pagePool = []  - for simplicity, we will have numWorkers == numPages meaning we dont need a page pool for the numWorkers to utilize
  const numWorkers = 3;

  // grab team urls from the page
  let page = await browser.newPage();
  let teamUrls = getTeamUrls(page)
  // await page.close(); // with a small number of pages - we don't need to clean that up until the end when we close the browser

  for (let i = 0; i < numWorkers; i++) {

  }

  // We setup workers to scrape
  console.log("Going to" + url);
  await page.goto(BASE + url);

  // for each team, a worker will run and scrape the entire data set with names 
  console.log("Getting elements")
  
  // yearUrls = await page.$$eval(
  //   'th[data-stat="season"] a[href]',
  //   (links) => {
  //     return links.map((a) => a.getAttribute("href"));
  //   }
  // );
  // yearUrls = yearUrls.slice(0, 39); //past 40 seasons for benchmarks
  
  // // run each page function as an asynchronous method
  // for (const link of yearUrls) {
  //   // console.log("Going to " + BASE + link);
  //   await page.goto(BASE + link);

  //   await page.waitForSelector('#roster [data-stat="player"]');

  //   let currentRoster = await page.$$eval(
  //     "#roster [data-stat='player'] a[href]",
  //     (links) => {
  //       return links.map((a) => {
  //         return a.textContent;
  //       });
  //     }
  //   );

  //   let beforeRoster = await page.$$eval(
  //     "#per_game [data-stat='player'] a[href]",
  //     (names) => {
  //       return names.map((name) => {
  //         return name.textContent;
  //       });
  //     }
  //   );

  //   let tradedAway = beforeRoster.filter((player) => {
  //     return !currentRoster.includes(player); //filters out all players that are found in the other array (! because if its false then its removed)
  //   });

  //   // console.log("Current Roster:" + currentRoster +'\n')
  //   // console.log("Players that were on but were traded: " + tradedAway)

  //   let allPlayers = currentRoster.concat(tradedAway);
  //   // can write to the file rather to speed this up
  //   console.log(`Writing ${link}`);
  //   team[ // this can be done in parallel, multiple threads looking at different team links and scraping independently -> and EVEN that, can do further threads in which scraping by year
  //     link
  //       .substring(7, link.length)
  //       .replace("/", "-")
  //       .replace(".html", "")
  //   ] = allPlayers; //substring will include index 7
    //if they were traded with each other, then they are considered to play on the same team
}


