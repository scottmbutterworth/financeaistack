import { cronOrAdmin, unauthorized } from "@/lib/http";
import { ingestNews } from "@/lib/news";

export async function GET(request: Request) {
  if (!cronOrAdmin(request)) return unauthorized();
  try {
    const result = await ingestNews();
    return Response.json(result, { status: result.ok ? 200 : 503 });
  } catch (error) {
    const { logError } = await import("@/lib/db");
    await logError(error, "GET /api/cron/news");
    return Response.json({ error: "News ingestion failed." }, { status: 500 });
  }
}
