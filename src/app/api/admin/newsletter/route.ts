import { logError } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/http";
import { createDraftBroadcast } from "@/lib/newsletter";

export async function POST(request: Request) {
  if (!requireAdmin(request)) return unauthorized();
  try {
    const result = await createDraftBroadcast();
    if (!result.ok) return Response.json({ error: result.error }, { status: 503 });
    return Response.json({ ok: true, id: result.id, sent: false });
  } catch (error) {
    await logError(error, "POST /api/admin/newsletter");
    return Response.json({ error: "Could not create the draft broadcast." }, { status: 500 });
  }
}
