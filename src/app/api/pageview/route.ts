import { getSql } from "@/lib/db";
import { isBot, memoryRateLimit, clientIp, ipHash } from "@/lib/http";

export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) return new Response(null, { status: 204 });

  const body = await request.json().catch(() => null);
  const path = body && typeof body === "object" && "path" in body ? String((body as { path: unknown }).path) : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 200 || path.includes("?")) {
    return new Response(null, { status: 204 });
  }

  const hash = ipHash(clientIp(request));
  if (!memoryRateLimit(`pv:${hash}`, 40, 60 * 1000)) return new Response(null, { status: 204 });

  try {
    const sql = await getSql();
    if (!sql) return new Response(null, { status: 204 });
    await sql`INSERT INTO pageviews (path) VALUES (${path})`;
  } catch {
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 204 });
}
