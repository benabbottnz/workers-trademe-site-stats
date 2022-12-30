export interface Env {
  DB: D1Database;
}

interface SiteStats {
  MembersOnline: number;
  ActiveMembers: number;
  ActiveListings: number;
  /** @deprecated https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics **/
  AverageTimeSpent: string;
  /** @deprecated https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics **/
  AverageVisitorsPerDay: number;
  /** @deprecated https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics **/
  BusiestDayOfWeek: string;
  /** @deprecated https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics **/
  ReportMonthAndYear: string;
  /** @deprecated https://developer.trademe.co.nz/api-reference/catalogue-methods/retrieve-site-statistics **/
  ReportSource: string;
}

interface SiteStatsRow {
  created_at: number;
  members_online: number;
  active_members: number;
  active_listings: number;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    await fetch('https://api.trademe.co.nz/v1/SiteStats.json')
      .then(value => value.json<SiteStats>())
      .then(siteStats => {
        const unixTimestamp = Math.floor(controller.scheduledTime / 1000);

        env.DB.prepare("INSERT INTO site_stats (created_at, members_online, active_members, active_listings) VALUES (?1, ?2, ?3, ?4)")
          .bind(unixTimestamp, siteStats.MembersOnline, siteStats.ActiveMembers, siteStats.ActiveListings)
          .run()
      })
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const {pathname} = new URL(request.url)

    let query = "";

    switch (pathname) {
      case '/api/all':
        query = "SELECT * FROM site_stats ORDER BY created_at DESC LIMIT 50000";
        break;

      case '/api/hourly':
        query = "SELECT strftime('%s', strftime('%Y-%m-%d %H:00:00', datetime(created_at, 'unixepoch'))) as created_at, ROUND(AVG(active_listings)) as active_listings, ROUND(AVG(members_online)) as members_online, ROUND(AVG(active_members)) as active_members FROM site_stats GROUP BY strftime('%s', strftime('%Y-%m-%d %H:00:00', datetime(created_at, 'unixepoch')))";
        break;

      case '/api/daily':
        query = "SELECT strftime('%s', strftime('%Y-%m-%d', datetime(created_at, 'unixepoch'))) as created_at, ROUND(AVG(active_listings)) as active_listings, ROUND(AVG(members_online)) as members_online, ROUND(AVG(active_members)) as active_members FROM site_stats GROUP BY strftime('%s', strftime('%Y-%m-%d', datetime(created_at, 'unixepoch')))";
        break;

      default:
        return new Response('<ul><li><a href="/api/all"><code>/api/all</code></a></li> <li><a href="/api/hourly"><code>/api/hourly</code></a></li> <li><a href="/api/daily"><code>/api/daily</code></a></li>', {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
          status: 404,
        })
    }

    const {results} = await env.DB.prepare(query).all<SiteStatsRow>()

    return Response.json(results);
  },
};
