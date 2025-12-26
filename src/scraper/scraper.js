import { worker } from './worker.js'

export const BASE_URL = "https://www.basketball-reference.com";
// I have all results be in 1 in-memory blob
const res = Object.create(null);

// for each worker, they have to continuously fetch additional jobs
// there will be a global counter which will be passed
// a job in this context is a new page to visit - there will be 2 types of links:
// 1 will be of a team - the job here is to get the team urls, then add those jobs to the list 
// 1 will be of a team's season - job is to get the player names, then mergeResult 
let idx = 0;
const jobs = [];

// merge results from a worker's job of parsing a season of a team
function mergeResult(job_url, result) {
  const key = job_url
    .substring(43, job_url.length)
    .replace("/", "-")
    .replace(".html", "")
  res[key] = result
}

// get next job
// reminder: no race conditions since everything is single threaded, there is no scenario in which 2 workers will grab one at the same time
function getNextJob() {
  if (idx < jobs.length) {
    return jobs[idx++]
  }
  return null
}

// Scraping function will setup X worker that individually open and scrape a page of players that have played on a franchise
export default async function scraper(browser) {
  const numWorkers = 5;

  // grab team urls from the page
  let page = await browser.newPage();
  let teamUrls = await getTeamUrls(page)
  jobs.push(...teamUrls);
  // await page.close(); // with a small number of pages - we don't need to clean that up until the end when we close the browser

  const pages = await Promise.all(
    Array.from({ length: numWorkers }, () => browser.newPage())
  );

  // we pass all the parameters instead of making it global to avoid coupling and to make this explicit
  await Promise.all(
    pages.map((page, i) =>
      worker(
        i,
        page,
        jobs,
        getNextJob,
        mergeResult,
      )
    )
  );

  await browser.close();

  return res;
}

// in the teams page, we find all NBA teams and their URLs
async function getTeamUrls(page) {
  await page.goto(BASE_URL + "/teams");

  // in $eval, we run these operations IN the browser -> any global variables here will not be defined here
  const teamUrls = await page.$$eval(
    "#div_teams_active [data-stat='franch_name'] a[href]",
    (links) => links.map((a) => `${a.getAttribute("href")}`)
  );
  console.log(teamUrls);
  return teamUrls;
};

// within each NBA team, we find their past seasons, we need to grab all of their urls
export async function getTeamYearUrls(link, page) {
  await page.goto(link);
  let yearUrls = await page.$$eval(
    'th[data-stat="season"] a[href]',
    (links) => {
      return links.map((a) => `${a.getAttribute("href")}`);
    }
  );
  
  return yearUrls.slice(0, 39); //cut it off at past 40 seasons
}

// in the team pages we need to take both the current roster and the per game stats board since the current roster does not account for trades
// we extrapolate players who have been on the team from the per game stats as, if they've played on the team before in the current season, they've played before
// we compare the current roster with the players on the stat sheet and combine them
export async function getSeasonRoster(link, page) {
  await page.goto(link);
  await page.waitForSelector('#roster [data-stat="player"]');
  let currentRoster = await page.$$eval(
    "#roster [data-stat='player'] a[href]",
    (links) => {
      return links.map((a) => {
        return a.textContent;
      });
    }
  );

  // this lets us know who has played on the team in the past
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

  return currentRoster.concat(tradedAway);
}

