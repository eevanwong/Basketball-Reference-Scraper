// See https://aka.ms/new-console-template for more information
using System;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using HtmlAgilityPack;

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
            Console.WriteLine(teamLink);
            teams[i] = teamLink;
        }

        return teams;
    }

    static async System.Threading.Tasks.Task Main(string[] args)
    {
        var httpClient = new HttpClient();

        var teams = await GetTeams(httpClient);

    }
}
