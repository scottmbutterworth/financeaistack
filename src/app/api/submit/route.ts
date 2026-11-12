import { CATEGORIES } from "@/lib/categories";
import { getSql, logError } from "@/lib/db";
import { clientIp, honeypotTripped, ipHash, memoryRateLimit } from "@/lib/http";
import { recentSubmissionCount } from "@/lib/queries";
import { emailRejection, normaliseEmail } from "@/lib/spam";

const allowed = new Set<string>(CATEGORIES.map((category) => category.slug));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "That submission was empty." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (honeypotTripped(record.leave_blank)) {
    return Response.json({ ok: true, message: "Thanks. It's in the review queue." });
  }

  const kind = record.kind === "workflow" ? "workflow" : record.kind === "tool" ? "tool" : "";
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const summary = typeof record.summary === "string" ? record.summary.trim() : "";
  const website = typeof record.website_url === "string" ? record.website_url.trim() : "";
  const notes = typeof record.notes === "string" ? record.notes.trim() : "";
  const emailRaw = typeof record.submitter_email === "string" ? record.submitter_email.trim() : "";
  const categories = Array.isArray(record.categories)
    ? record.categories.filter((item): item is string => typeof item === "string" && allowed.has(item))
    : [];

  if (!kind || name.length < 2 || summary.length < 12) {
    return Response.json({ error: "Add a name and a sentence on what it does." }, { status: 400 });
  }
  if (website && !/^https?:\/\//i.test(website)) {
    return Response.json({ error: "The website needs to start with https://." }, { status: 400 });
  }
  if (emailRaw && emailRejection(emailRaw)) {
    return Response.json({ error: emailRejection(emailRaw) }, { status: 400 });
  }

  const hash = ipHash(clientIp(request));
  const recent = await recentSubmissionCount(hash, 60).catch(() => null);
  const limited = recent === null ? !memoryRateLimit(`submit:${hash}`, 5, 60 * 60 * 1000) : recent >= 5;
  if (limited) return Response.json({ error: "Too many submissions from this network. Try again later." }, { status: 429 });

  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "Submissions are offline. Try again shortly." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      INSERT INTO submissions (kind, name, website_url, summary, categories, submitter_email, notes, ip_hash)
      VALUES (
        ${kind},
        ${name.slice(0, 160)},
        ${website || null},
        ${summary.slice(0, 1000)},
        ${categories},
        ${emailRaw ? normaliseEmail(emailRaw) : null},
        ${notes.slice(0, 4000) || null},
        ${hash}
      )
      RETURNING id
    `;
    return Response.json({ ok: true, id: rows[0]?.id ?? null, message: "Thanks. It's in the review queue." });
  } catch (error) {
    await logError(error, "POST /api/submit");
    return Response.json({ error: "Could not save that submission." }, { status: 500 });
  }
}
