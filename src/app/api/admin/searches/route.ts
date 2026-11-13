import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const searches = await sql`
      SELECT query, COUNT(*)::int AS count, MAX(created_at) AS last_seen
      FROM zero_result_searches
      GROUP BY query
      ORDER BY count DESC, last_seen DESC
      LIMIT 100
    `;
    return Response.json({ searches });
  } catch (error) {
    await logError(error, "GET /api/admin/searches");
    return Response.json({ error: "Could not read searches." }, { status: 500 });
  }
}
