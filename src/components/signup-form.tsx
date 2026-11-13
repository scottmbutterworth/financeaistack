"use client";

import { useState, type FormEvent } from "react";

export function SignupForm({ compact = false, idPrefix = "signup" }: { compact?: boolean; idPrefix?: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "bad">("ok");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setStatus("Saving…");
    setTone("ok");
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setTone("bad");
      setStatus(payload.error ?? "Could not save that address.");
      return;
    }
    form.reset();
    setTone("ok");
    setStatus(payload.message ?? "You're on the list.");
  }

  return (
    <form onSubmit={onSubmit}>
      {compact ? null : <p>One short email a week. Five tools, one story, and the sponsor line.</p>}
      <label htmlFor={`${idPrefix}-email`}>Email</label>
      <input
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@company.com"
      />
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${idPrefix}-leave`}>Leave this blank</label>
        <input id={`${idPrefix}-leave`} name="leave_blank" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit">Get the weekly note</button>
      {status ? <p className={tone === "ok" ? "ok notice" : "bad notice"}>{status}</p> : null}
    </form>
  );
}
