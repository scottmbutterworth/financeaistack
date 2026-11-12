import { createHash, timingSafeEqual } from "node:crypto";

const hits = new Map<string, number[]>();

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function ipHash(ip: string) {
  return createHash("sha256").update(`${ip}|financeaistack`).digest("hex").slice(0, 32);
}

export function requireAdmin(request: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const got = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorised." }, { status: 401 });
}

export function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function isBot(userAgent: string | null) {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|wget|curl|headless|lighthouse|monitor|python-requests|go-http-client|semrush|ahrefs|petalbot|bingpreview|bytespider|gptbot|claudebot|amazonbot/i.test(
    userAgent,
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function honeypotTripped(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}
