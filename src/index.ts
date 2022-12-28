/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	DB: D1Database;
}

interface SiteStats {
	MembersOnline: number;
	ActiveMembers: number,
	ActiveListings: number;
	AverageTimeSpent: string;
	AverageVisitorsPerDay: number;
	BusiestDayOfWeek: string;
	ReportMonthAndYear: string;
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
				env.DB.prepare("INSERT INTO site_stats (created_at, members_online, active_members, active_listings) VALUES (?1, ?2, ?3, ?4)")
					.bind(Date.now() / 1000, siteStats.MembersOnline, siteStats.ActiveMembers, siteStats.ActiveListings)
					.run()
			})
	},

	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const { results } = await env.DB.prepare("SELECT * FROM site_stats").all()

		return Response.json(results);
	},
};
