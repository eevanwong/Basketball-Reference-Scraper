const puppeteer = require("puppeteer");
const fs = require("fs");

Scraping();

function write(array, path) {
  fs.writeFileSync(path, JSON.stringify(array));
}

function read(path) {
  const fileContent = fs.readFileSync(path);
  const array = JSON.parse(fileContent);
  return array;
}

async function Scraping() {
  console.log("Opening browser...");
  const browser = await puppeteer.launch({ headless: false });

  console.log("Opening page...");
  const page = await browser.newPage();

  console.log("Going to nba website...");
  await page.goto("https://www.nba.com/players", {
    waitUntil: "domcontentloaded",
  });

  //   let numTabs = await page.$eval(
  //     //needs to check how many tabs to determine how many times it should run
  //     ".Pagination_content__30uR3 > div:nth-child(4)",
  //     (txt) => {
  //       //console.log(txt);
  //       return parseInt(txt.innerHTML.substring(11, txt.length)); //for some reason the string returns "of <!--->{numpgs}"
  //     }
  //   );

  await page.waitForSelector("#onetrust-accept-btn-handler"); //wait for the cookies button

  await page.click("#onetrust-accept-btn-handler"); //click cookies button

  await page.select('[title="Page Number Selection Drown Down List"]', "-1"); //selecting all to view all links

  const firstNames = await page.$$eval(".t6 .mr-1", (names) => {
    return names.map((name) => name.textContent);
  });

  const lastNames = await page.$$eval("div.flex > p:nth-child(2)", (names) => {
    return names.map((name) => name.textContent);
  });

  console.log(firstNames);
  console.log(lastNames);

  write(firstNames, "/my/path/test.txt");
}

/* // Getting first name and last name of first member 
  let firstName = await page.$eval(
    //Getting the first name
    ".players-list > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1) > div:nth-child(2) > p:nth-child(1)",
    (txt) => txt.textContent
  );

  let lastName = await page.$eval(
    ".players-list > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1) > div:nth-child(2) > p:nth-child(2)",
    (txt) => txt.textContent
  );

  console.log(firstName + " " + lastName);
*/

/*  GET ALL FIRST NAMES + LAST NAMES ON THE FIRST PAGE
  let firstNames = await page.$$eval(".t6 .mr-1", (names) => {
    return names.map((name) => name.textContent);
  });

  let lastNames = await page.$$eval("div.flex > p:nth-child(2)", (names) => {
    return names.map((name) => name.textContent);
  });
*/
