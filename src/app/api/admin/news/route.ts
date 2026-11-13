import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";
import { listNews } from "@/lib/news";

export async function GET(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const status = new URL(request.url).searchParams.get("status") || "pending";
  if (!["pending", "published", "rejected", "all"].includes(status)) {
    return Response.json({ error: "status must be pending, published, rejected, or all." }, { status: 400 });
  }
  const result = await listNews({ status, limit: 100 });
  if (!result.ok) return Response.json({ error: "Database unavailable." }, { status: 503 });
  return Response.json({ items: result.data, total: result.total });
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Send a news item." }, { status: 400 });
  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const url = typeof record.url === "string" ? record.url.trim() : "";
  const source = typeof record.source === "string" ? record.source.trim() : "";
  const publishedAt = typeof record.published_at === "string" ? record.published_at : "";
  const why = typeof record.why_it_matters === "string" ? record.why_it_matters.trim() : "";
  const related = slugs(record.related_slugs);
  if (title.length < 4 || source.length < 2 || why.length < 10 || !isHttp(url)) {
    return Response.json(
      { error: "Need title, source, an http(s) url, and why_it_matters." },
      { status: 400 },
    );
  }
  const published = publishedAt ? new Date(publishedAt) : null;
  if (publishedAt && (!published || Number.isNaN(published.getTime()))) {
    return Response.json({ error: "published_at must be an ISO date." }, { status: 400 });
  }
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      INSERT INTO news_items (source, title, url, published_at, summary, why_it_matters, status, related_slugs)
      VALUES (
        ${source.slice(0, 160)},
        ${title.slice(0, 300)},
        ${url.slice(0, 1000)},
        ${published ? published.toISOString() : null},
        ${null},
        ${why.slice(0, 2000)},
        'published',
        ${related}
      )
      ON CONFLICT (url) DO UPDATE SET
        title = EXCLUDED.title,
        source = EXCLUDED.source,
        published_at = EXCLUDED.published_at,
        why_it_matters = EXCLUDED.why_it_matters,
        related_slugs = EXCLUDED.related_slugs,
        status = 'published'
      RETURNING id
    `;
    return Response.json({ ok: true, id: rows[0]?.id ?? null, status: "published" });
  } catch (error) {
    await logError(error, "POST /api/admin/news");
    return Response.json({ error: "Could not save that item." }, { status: 500 });
  }
}

function isHttp(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function slugs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length < 80).slice(0, 12);
}
