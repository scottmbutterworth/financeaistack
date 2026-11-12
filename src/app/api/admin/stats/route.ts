import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const [signups, pageviewsByDay, topPages, clicks] = await Promise.all([
      sql<{ total: number; last_30_days: number }[]>`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days
        FROM signups
      `,
      sql<{ day: string; count: number }[]>`
        SELECT created_at::date::text AS day, COUNT(*)::int AS count
        FROM pageviews
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1
      `,
      sql<{ path: string; count: number }[]>`
        SELECT path, COUNT(*)::int AS count
        FROM pageviews
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY path
        ORDER BY count DESC
        LIMIT 20
      `,
      sql<{ sponsor_slug: string; count: number }[]>`
        SELECT sponsor_slug, COUNT(*)::int AS count
        FROM sponsor_clicks
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY sponsor_slug
        ORDER BY count DESC
      `,
    ]);
    return Response.json({
      signups: signups[0] ?? { total: 0, last_30_days: 0 },
      pageviewsByDay,
      topPages,
      clicks,
    });
  } catch (error) {
    await logError(error, "GET /api/admin/stats");
    return Response.json({ error: "Could not read stats." }, { status: 500 });
  }
}
