import { BASE_URL, getTeamYearUrls, getSeasonRoster } from "./scraper.js";

const MAX_RETRIES = 3;
const retryCounter = new Map();
const failedJobs = [];

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
                log(seasonRoster)
                mergeResultMethod(job_url, seasonRoster);
            }
            
            // Clear retry counter on success
            if (retryCounter.has(job_url)) {
                retryCounter.delete(job_url);
            }
        } catch (err) {
            const currentRetries = retryCounter.get(job_url) || 0;
            
            if (currentRetries < MAX_RETRIES) {
                retryCounter.set(job_url, currentRetries + 1);
                log(`Error encountered with ${job_url}, retry ${currentRetries + 1}/${MAX_RETRIES}`);
                jobs.push(job_url);
            } else {
                log(`Job failed after ${MAX_RETRIES} retries: ${job_url}`);
                log(`Error details: ${err.message}`);
                failedJobs.push({ url: job_url, error: err.message });
                retryCounter.delete(job_url);
            }
        }
    }
}

export function getFailedJobs() {
    return failedJobs;
}

export function clearFailedJobs() {
    failedJobs.length = 0;
    retryCounter.clear();
}