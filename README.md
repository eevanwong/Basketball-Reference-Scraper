# Basketball Reference Scraper
This is the repo for the batch app of my 6 degrees of NBA project. 

Here, I parsed the past 40 seasons of each NBA team that would be insertted/seeded into the neo4j database.

## Implementation
- Upon entry, a user will enter a file name
- The program will establish X num of pages which will correspond to the number of workers tasks that will be active throughout the runtime
    - Each worker is effectively a task that node.js switches between while its blocked (eg waiting on accessing a request)
    - Each worker gets a "job", which is just the url that it needs to scrape, based on the url, it does a corresponding action (check code)
- Everything is stored in 1 in memory dictionary and at the end of scraping it writes it all to a file 

Notably, as we up the num workers (i.e number of concurrent tasks), the performance does increase each time. Will experiment and see at what point it increases. 

### A question I asked myself: Why is node.js a reasonable runtime for running multi-threaded web scraping?
Well, it's not. At least not in comparison to other languages.

Node.js, is single-threaded; however, it has a non-blocking event loop, which basically means it can efficiently handle many requests concurrently. This is most convenient for I/O or network heavy tasks (such AS web scraping).

Think about it this way. In a multi-threaded scenario, we have each thread needing to make a request and wait for the page to load and then scrape. That's wasted time.

In a single-thread async implementation, we simply create tasks/promises and have them all run at the same time. When it gets blocked (it inevitably does, needing to wait for the web page to load). It then, can load another task after, then, when that waits, we switch again, and again.

I believe, at a certain number of tasks (going to a page and scraping the players), > 1 thread will greatly improve performance. Can we have various threads that can parallelize the scraping? Absolutely! Maybe...

The more I learn about multi-threaded workarounds in Node.js, the less I want to actually learn how. It can work, its just not pretty, and I'd rather just do this in Go and have parallelism and shared buffers in 10% of the code that it would require in Node.js. 

## ToDos
- Need to account for duplicate names (can use the identifying url to use the id that basketball-reference.com uses with the player and take that as the value in the db)
- Transitioning this to TypeScript for better typing - should build in types (personal pref as a dev)