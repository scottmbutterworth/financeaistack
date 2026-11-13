import { getSql, logError } from "@/lib/db";
import { clientIp, honeypotTripped, ipHash, memoryRateLimit } from "@/lib/http";
import { addToAudience } from "@/lib/mail";
import { recentSignupCount } from "@/lib/queries";
import { emailRejection, normaliseEmail } from "@/lib/spam";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Send an email address." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (honeypotTripped(record.leave_blank)) {
    return Response.json({ ok: true, message: "You're on the list." });
  }

  const email = typeof record.email === "string" ? normaliseEmail(record.email) : "";
  const rejection = emailRejection(email);
  if (rejection) return Response.json({ error: rejection }, { status: 400 });

  const hash = ipHash(clientIp(request));
  const recent = await recentSignupCount(hash, 60).catch(() => null);
  const limited = recent === null ? !memoryRateLimit(`signup:${hash}`, 8, 60 * 60 * 1000) : recent >= 8;
  if (limited) return Response.json({ error: "Too many signups from this network. Try again later." }, { status: 429 });

  try {
    const sql = await getSql();
    if (!sql) return Response.json({ error: "The list is offline. Try again shortly." }, { status: 503 });
    const rows = await sql<{ id: number }[]>`
      INSERT INTO signups (email, ip_hash)
      VALUES (${email}, ${hash})
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `;
    const audience = await addToAudience(email);
    if (audience.id) {
      await sql`UPDATE signups SET resend_contact_id = ${audience.id} WHERE email = ${email}`;
    }
    const message = audience.ok || audience.skipped
      ? "You're on the list. One short note a week."
      : "You're saved on this site. Adding you to the email audience failed and was logged.";
    return Response.json({ ok: true, id: rows[0]?.id ?? null, message });
  } catch (error) {
    await logError(error, "POST /api/signup");
    return Response.json({ error: "Could not save that address." }, { status: 500 });
  }
}
