import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const id = Number(record.id);
  const why = typeof record.why_it_matters === "string" ? record.why_it_matters.trim() : "";
  const related = Array.isArray(record.related_slugs)
    ? record.related_slugs.filter((item): item is string => typeof item === "string").slice(0, 12)
    : null;
  if (!Number.isInteger(id) || why.length < 10) {
    return Response.json({ error: "Send { id, why_it_matters }." }, { status: 400 });
  }
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      UPDATE news_items
      SET status = 'published',
          why_it_matters = ${why.slice(0, 2000)},
          related_slugs = COALESCE(${related}, related_slugs)
      WHERE id = ${id}
      RETURNING id
    `;
    if (!rows.length) return Response.json({ error: "Item not found." }, { status: 404 });
    return Response.json({ ok: true, id, status: "published" });
  } catch (error) {
    await logError(error, "POST /api/admin/news/publish");
    return Response.json({ error: "Could not publish that item." }, { status: 500 });
  }
}
