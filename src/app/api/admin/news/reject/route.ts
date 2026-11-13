import { getSql, logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  const body = await request.json().catch(() => null);
  const id = body && typeof body === "object" ? Number((body as { id?: unknown }).id) : NaN;
  if (!Number.isInteger(id)) return Response.json({ error: "Send { id }." }, { status: 400 });
  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Database unavailable." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      UPDATE news_items SET status = 'rejected' WHERE id = ${id} RETURNING id
    `;
    if (!rows.length) return Response.json({ error: "Item not found." }, { status: 404 });
    return Response.json({ ok: true, id, status: "rejected" });
  } catch (error) {
    await logError(error, "POST /api/admin/news/reject");
    return Response.json({ error: "Could not reject that item." }, { status: 500 });
  }
}
