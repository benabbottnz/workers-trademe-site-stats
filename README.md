# TradeMe SiteStats API with Cloudflare Workers

TradeMe provides access to a public API endpoint that shows interesting data on a minute-by-minute basis, but only at the time of the query and no way to query historical data.
The code in this repo uses Cloudflare Workers to constantly ping the API and then store the data in a database.
It also provides its own API endpoints to grant access to all the data it has collected over time.

https://worker-trademe-site-stats.benabbottnz.workers.dev/

## TradeMe API

TradeMe has an API endpoint called `SiteStats` that returns the following data on a minute-by-minute basis:

* MembersOnline
* ActiveMembers
* ActiveListings

https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics

## Cloudflare D1

Cloudflare has a serverless SQLite database called D1 which I'll use to store the SiteStats API response every minute via a cron job.

https://developers.cloudflare.com/d1/

## Cloudflare Workers

Using Cloudflare Workers, I can query the SiteStats API every minute via a cron job and store the response into D1.

https://workers.cloudflare.com/

Additionally, I can expose my own API endpoints to return the data from D1 as JSON.

https://worker-trademe-site-stats.benabbottnz.workers.dev/api/all

These API endpoints group the timestamps into hours or days, and averages them out.

https://worker-trademe-site-stats.benabbottnz.workers.dev/api/hourly

https://worker-trademe-site-stats.benabbottnz.workers.dev/api/daily
