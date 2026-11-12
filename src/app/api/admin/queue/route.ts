import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const submissions = await sql`
      SELECT id, kind, name, website_url, summary, categories, submitter_email, notes, status, created_at, entry_slug
      FROM submissions
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;
    return Response.json({ submissions });
  } catch (error) {
    await logError(error, "GET /api/admin/queue");
    return Response.json({ error: "Could not read the queue." }, { status: 500 });
  }
}
