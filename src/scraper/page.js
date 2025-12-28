// setting longer navigation timeout for our page navigation methods (in our case, page.goto method)
// set default timeout for almost all actions within a page (not navigation related?) 
// user agent - characteristic string that lets servers and network peers identify the application, operating system, vendor, and/or version of the requesting user agent
// https://developer.mozilla.org/en-US/docs/Glossary/User_agent
// This may be due to the site detecting that the request for the site is from a headless user agent and blocked.
// This is the default user agent from puppeteer (note HeadlessChrome):
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/90.0.4427.0 Safari/537.36  
export default function setPageSpecs(page) {
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(90000);

  // removed headless and it seems to be working
  page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36');
}
