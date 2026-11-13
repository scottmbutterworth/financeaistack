import { getSql, logError } from "@/lib/db";
import { requireAdmin, slugify, unauthorized } from "@/lib/http";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const sponsors = await sql`
      SELECT id, week_start::text, sponsor_name, sponsor_slug, tagline, destination_url, active, created_at
      FROM sponsor_weeks
      ORDER BY week_start DESC
    `;
    return Response.json({ sponsors });
  } catch (error) {
    await logError(error, "GET /api/admin/sponsors");
    return Response.json({ error: "Could not read sponsors." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Send a sponsor week." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  const weekStart = typeof record.week_start === "string" ? record.week_start : "";
  const name = typeof record.sponsor_name === "string" ? record.sponsor_name.trim() : "";
  const slug = slugify(typeof record.sponsor_slug === "string" && record.sponsor_slug ? record.sponsor_slug : name);
  const tagline = typeof record.tagline === "string" ? record.tagline.trim() : "";
  const destination = typeof record.destination_url === "string" ? record.destination_url.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || name.length < 2 || !slug || !/^https?:\/\//i.test(destination)) {
    return Response.json(
      { error: "Need week_start (YYYY-MM-DD), sponsor_name, and an http(s) destination_url." },
      { status: 400 },
    );
  }

  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      INSERT INTO sponsor_weeks (week_start, sponsor_name, sponsor_slug, tagline, destination_url)
      VALUES (${weekStart}, ${name.slice(0, 160)}, ${slug}, ${tagline.slice(0, 200) || null}, ${destination})
      ON CONFLICT (week_start) DO UPDATE SET
        sponsor_name = EXCLUDED.sponsor_name,
        sponsor_slug = EXCLUDED.sponsor_slug,
        tagline = EXCLUDED.tagline,
        destination_url = EXCLUDED.destination_url,
        active = TRUE
      RETURNING id
    `;
    return Response.json({ ok: true, id: rows[0]?.id ?? null, sponsor_slug: slug });
  } catch (error) {
    await logError(error, "POST /api/admin/sponsors");
    return Response.json({ error: "Could not save that sponsor week." }, { status: 500 });
  }
}
