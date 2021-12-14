# Basketball Reference Scraper

This is the repo for the batch app of my 6 degrees of NBA project. 

Here, I parsed the past 40 seasons of each NBA team that would be insertted/seeded into the neo4j database.

I found that my initial implementation of this was painstakingly slow (1196.9s), as it was individually processing one of ~1200 pages. I was able to implement parallel scraping with puppeteer and bluebird, cutting down the scraping time to 374.4s, reducing the overall time by 68.7%.

This was also a good opportunity to explore promises and the differences between concurrency and parallelism with nodejs.

