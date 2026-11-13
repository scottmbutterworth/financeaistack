import { getSql, logError } from "@/lib/db";
import { clientIp, honeypotTripped, ipHash, memoryRateLimit } from "@/lib/http";
import { emailOwner } from "@/lib/mail";
import { recentInquiryCount } from "@/lib/queries";
import { emailRejection, normaliseEmail } from "@/lib/spam";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "That note was empty." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (honeypotTripped(record.leave_blank)) {
    return Response.json({ ok: true, message: "Thanks. We'll reply by email." });
  }

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? normaliseEmail(record.email) : "";
  const company = typeof record.company === "string" ? record.company.trim() : "";
  const offer = typeof record.offer === "string" ? record.offer.trim().slice(0, 120) : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const rejection = emailRejection(email);
  if (name.length < 2 || message.length < 10 || rejection) {
    return Response.json({ error: rejection ?? "Add your name, a real email, and a short note." }, { status: 400 });
  }

  const hash = ipHash(clientIp(request));
  const recent = await recentInquiryCount(hash, 60).catch(() => null);
  const limited = recent === null ? !memoryRateLimit(`inquiry:${hash}`, 5, 60 * 60 * 1000) : recent >= 5;
  if (limited) return Response.json({ error: "Too many notes from this network. Try again later." }, { status: 429 });

  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "The form is offline. Try again shortly." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      INSERT INTO sponsor_inquiries (name, email, company, offer, message, ip_hash)
      VALUES (${name.slice(0, 120)}, ${email}, ${company.slice(0, 160) || null}, ${offer || null}, ${message.slice(0, 4000)}, ${hash})
      RETURNING id
    `;
    const id = rows[0]?.id;
    const mailed = await emailOwner(
      `Sponsor inquiry from ${name}`,
      [`Name: ${name}`, `Email: ${email}`, `Company: ${company || "—"}`, `Offer: ${offer || "—"}`, "", message].join("\n"),
      `sponsor-inquiry/${id ?? email}`,
    );
    return Response.json({
      ok: true,
      id,
      message: mailed.ok
        ? "Thanks. It's saved, and a note is on its way to the owner."
        : "Thanks. It's saved. The email to the owner could not be sent and was logged.",
    });
  } catch (error) {
    await logError(error, "POST /api/sponsor-inquiry");
    return Response.json({ error: "Could not save that note." }, { status: 500 });
  }
}
