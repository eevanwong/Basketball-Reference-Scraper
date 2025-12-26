import { BASE_URL, getTeamYearUrls, getSeasonRoster } from "./scraper.js";

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
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(90000);

    while (true) {
        // a job is a url
        let job_url = getNextJob();
        if (job_url == null) {
            return;
        }
        try {
            log(`Job started: ${job_url}`);
        
            // if job url ends with a '/' like in '/ATL/' - we're extracting the year urls from it
            if (job_url.endsWith("/")) { 
                let teamYearUrls = await getTeamYearUrls(BASE_URL + job_url, page);
                log(`Writing team year urls for ${job_url}`);
                jobs.push(...teamYearUrls);
            }

            // if job url ends with "2026.html" - its a season - we can extract the key from the url
            else if (job_url.endsWith(".html")) {
                let seasonRoster = await getSeasonRoster(BASE_URL + job_url, page)
                // can write to the file rather to speed this up
                log(`Writing season roster from ${job_url}:`);
                // log(seasonRoster)
                mergeResultMethod(job_url, seasonRoster);
            }
        } catch (err) {
            log(`Error encountered with ${job_url}`);
            // pushed job back for retry
            retryCount[job_url] = (retryCount[job_url] ?? 0) + 1;
            // ^ is a replacement for:
            // if (!retryCount[job_url]) {
            //     retryCount[job_url] = 1
            // } else {
            //     retryCount[job_url] += 1
            // }                                                                                                                                                 
            if (retryCount[job_url] <= 3) {
                jobs.push(job_url);
            }
        }
    }
}