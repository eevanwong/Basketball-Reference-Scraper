// See https://aka.ms/new-console-template for more information
using System;
using System.Net.Http;
using HtmlAgilityPack;
using PuppeteerSharp;
using System.Collections.Concurrent;
using System.Linq.Expressions;

class Scraper
{
    private const string Url = "https://www.basketball-reference.com";

    private static async Task<string[]> GetTeams(HttpClient httpClient)
    {
        var htmlContent = await httpClient.GetStringAsync($"{Url}/teams");
        var htmlDocument = new HtmlDocument();
        htmlDocument.LoadHtml(htmlContent);
        // Let's say you want to scrape all the headings (h2 tags) from the page:
        var teamNodes = htmlDocument.DocumentNode.SelectNodes("//*[@id='teams_active']/tbody/tr/th/a");
        Console.WriteLine("Teams:");

        string[] teams = new string[teamNodes.Count()];
        for (int i = 0; i < teams.Length; i++)
        {
            var teamLink = teamNodes[i].GetAttributeValue("href", "");
            // Console.WriteLine(teamLink);
            teams[i] = teamLink;
        }

        return teams;
    }

    private static async Task<List<string>> GetSeasonLinks(IPage page, string teamLink)
    {
        await page.GoToAsync(teamLink, 45000);

        var team = teamLink.Substring(43, 3);
        Console.WriteLine(team);
        var seasonTags = await page.XPathAsync($"//*[@id='{team}']/tbody/tr/th/a");

        List<string> seasonLinks = new List<string>();

        foreach (var tag in seasonTags)
        {
            var contentJsHandle = await tag.GetPropertyAsync("href");
            var link = await contentJsHandle.JsonValueAsync();
            seasonLinks.Add(link.ToString());
        }

        return seasonLinks;
    }

    static async System.Threading.Tasks.Task Main(string[] args)
    {
        var httpClient = new HttpClient();
        var teams = await GetTeams(httpClient);
        httpClient.Dispose();

        var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            Timeout = 45000,
            ExecutablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        });

        var semaphore = new SemaphoreSlim(5);

        var dictionary = new ConcurrentDictionary<string, int>();

        var tasks = teams.Select(async (team, i) =>
        {
            await semaphore.WaitAsync();  // Acquire the semaphore

            try
            {
                using (var page = await browser.NewPageAsync())
                {
                    Console.WriteLine(team);
                    List<string> seasonLinks = await GetSeasonLinks(page, Url + team);
                    // write all links to a file to remove the need to write this process
                    foreach (var link in seasonLinks)
                    {
                        Console.WriteLine(link);
                    }
                }

            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                await browser.CloseAsync();
                browser.Dispose();
            }
            finally
            {
                semaphore.Release();
            }
        }).ToArray();

        await Task.WhenAll(tasks);

        await browser.CloseAsync();
        browser.Dispose();
    }
}
