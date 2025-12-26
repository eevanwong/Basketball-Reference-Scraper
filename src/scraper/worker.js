import { getTeamYearUrls, getSeasonRoster } from "./scraper";

export async function worker(
    workerId,
    page,
    jobs,
    getNextJob, // url - string
    mergeResultMethod,
) {
    // each worker will log, includes prefix to be able to track which worker is logging
    const PREFIX = `Worker ${workerId}:`
    const log = (...args) => console.log(PREFIX, ...args);

    while (true) {
        // a job is a url
        let job_url = getNextJob();
        if (job_url == null) {
            return
        }

        log(`Job started: ${job_url}`);
    
        // if job url ends with a '/' like in '/ATL/' - we're extracting the year urls from it
        if (job_url.endsWith("/")) { 
            let teamYearUrls = await getTeamYearUrls(job_url, page);
            log(`Writing team year urls for ${job_url}`);
            jobs.push(...teamYearUrls);
        }

        // if job url ends with "2026.html" - its a season - we can extract the key from the url
        else if (job_url.endsWith(".html")) {
            let seasonRoster = await getSeasonRoster(job_url, page)
            // can write to the file rather to speed this up
            log(`Writing season roster to ${job_url}`);
            mergeResultMethod(job_url, seasonRoster);
        }
    }
}