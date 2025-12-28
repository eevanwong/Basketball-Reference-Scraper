import { BASE_URL, getTeamYearUrls, getSeasonRoster } from "./scraper.js";
import setPageSpecs from "./page.js";

export async function worker(
    workerId,
    page,
    jobs,
    getNextJob, // url - string
    mergeResultMethod,
) {
    // each worker will log, includes prefix to be able to track which worker is logging
    const PREFIX = `Worker ${workerId}:`
    const retryCount = {};
    const log = (...args) => console.log(PREFIX, ...args);
    setPageSpecs(page);

    while (true) {
        // a job is a url
        let jobUrl = getNextJob();
        if (jobUrl == null) {
            return;
        }
        try {
            log(`Job started: ${jobUrl}`);
            let fullUrl = BASE_URL + jobUrl;
            // if job url ends with a '/' like in '/ATL/' - we're extracting the year urls from it
            if (jobUrl.endsWith("/")) { 
                let teamYearUrls = await getTeamYearUrls(fullUrl, page);
                log(`Writing team year urls for ${jobUrl}`);
                jobs.push(...teamYearUrls);
            }

            // if job url ends with "2026.html" - its a season - we can extract the key from the url
            else if (jobUrl.endsWith(".html")) {
                let seasonRoster = await getSeasonRoster(fullUrl, page)
                // can write to the file rather to speed this up
                log(`Writing season roster from ${jobUrl}:`);
                // log(seasonRoster)
                mergeResultMethod(fullUrl, seasonRoster);
            }
        } catch (err) {
            log(`Error encountered with ${jobUrl}: ${err}`);
            // pushed job back for retry
            retryCount[jobUrl] = (retryCount[jobUrl] ?? 0) + 1;
            // ^ is a replacement for:
            // if (!retryCount[jobUrl]) {
            //     retryCount[jobUrl] = 1
            // } else {
            //     retryCount[jobUrl] += 1
            // }                                                                                                                                                 
            if (retryCount[jobUrl] <= 3) {
                jobs.push(jobUrl);
            }
        }
    }
}