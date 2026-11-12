import { Resend } from "resend";
import { logError } from "@/lib/db";
import { fromAddress } from "@/lib/newsletter";
import { normaliseEmail } from "@/lib/spam";

export async function addToAudience(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !segmentId) {
    return { ok: false, skipped: true, id: null as string | null, error: "Resend is not configured." };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.contacts.create({
    email: normaliseEmail(email),
    unsubscribed: false,
    segments: [{ id: segmentId }],
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("exist")) {
      return { ok: true, skipped: false, id: null, error: null };
    }
    await logError(new Error(error.message), "resend-contact");
    return { ok: false, skipped: false, id: null, error: error.message };
  }

  return { ok: true, skipped: false, id: data?.id ?? null, error: null };
}

export async function emailOwner(subject: string, text: string, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = fromAddress();
  if (!apiKey || !to || !from) {
    return { ok: false, skipped: true, error: "Email is not configured." };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    { from, to: [to], subject, text },
    { idempotencyKey },
  );

  if (error) {
    await logError(new Error(error.message), "resend-owner");
    return { ok: false, skipped: false, error: error.message };
  }

  return { ok: true, skipped: false, error: null };
}
