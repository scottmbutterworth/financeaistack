"use client";

import { useState, type FormEvent } from "react";

export function InquiryForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "bad">("ok");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setStatus("Sending…");
    const response = await fetch("/api/sponsor-inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setTone("bad");
      setStatus(payload.error ?? "Could not send that.");
      return;
    }
    form.reset();
    setTone("ok");
    setStatus(payload.message ?? "Thanks. We'll reply by email.");
  }

  return (
    <form onSubmit={onSubmit} className="panel">
      <h2>Get in touch</h2>
      <p>No checkout. The note is saved here and emailed to the owner.</p>
      <label htmlFor="iname">Name</label>
      <input id="iname" name="name" required minLength={2} maxLength={120} />
      <label htmlFor="iemail">Email</label>
      <input id="iemail" name="email" type="email" autoComplete="email" required />
      <label htmlFor="icompany">Company</label>
      <input id="icompany" name="company" maxLength={160} />
      <label htmlFor="ioffer">Offer</label>
      <select id="ioffer" name="offer" defaultValue="Sponsor bar, A$150/week">
        <option>Sponsor bar, A$150/week</option>
        <option>Featured listing, A$99/month</option>
        <option>Both</option>
        <option>Not sure yet</option>
      </select>
      <label htmlFor="imessage">Message</label>
      <textarea id="imessage" name="message" required minLength={10} maxLength={4000} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="inquiry_blank">Leave blank</label>
        <input id="inquiry_blank" name="leave_blank" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit">Send</button>
      {status ? <p className={tone === "ok" ? "ok notice" : "bad notice"}>{status}</p> : null}
    </form>
  );
}
