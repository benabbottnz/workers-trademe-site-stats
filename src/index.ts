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
		const { results } = await env.DB.prepare("SELECT * FROM site_stats").all<SiteStats>()

		return Response.json(results);
	},
};
