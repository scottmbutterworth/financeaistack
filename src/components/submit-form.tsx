"use client";

import { CATEGORIES } from "@/lib/categories";
import { useState, type FormEvent } from "react";

export function SubmitForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "bad">("ok");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = {
      kind: data.get("kind"),
      name: data.get("name"),
      website_url: data.get("website_url"),
      summary: data.get("summary"),
      submitter_email: data.get("submitter_email"),
      notes: data.get("notes"),
      leave_blank: data.get("leave_blank"),
      categories: data.getAll("categories"),
    };
    setStatus("Sending…");
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setTone("bad");
      setStatus(payload.error ?? "Could not save that.");
      return;
    }
    form.reset();
    setTone("ok");
    setStatus(payload.message ?? "Thanks. It's in the review queue.");
  }

  return (
    <form onSubmit={onSubmit} className="panel">
      <label htmlFor="kind">This is a</label>
      <select id="kind" name="kind" defaultValue="tool">
        <option value="tool">Tool</option>
        <option value="workflow">Workflow</option>
      </select>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required minLength={2} maxLength={160} />
      <label htmlFor="website_url">Website</label>
      <input id="website_url" name="website_url" type="url" placeholder="https://" />
      <label htmlFor="summary">What it does, in a sentence</label>
      <textarea id="summary" name="summary" required minLength={12} maxLength={1000} />
      <label>Categories</label>
      <div className="checks">
        {CATEGORIES.map((category) => (
          <label key={category.slug}>
            <input type="checkbox" name="categories" value={category.slug} />
            {category.name}
          </label>
        ))}
      </div>
      <label htmlFor="submitter_email">Your email</label>
      <input id="submitter_email" name="submitter_email" type="email" autoComplete="email" />
      <label htmlFor="notes">Anything a reviewer should know</label>
      <textarea id="notes" name="notes" maxLength={4000} />
      <div className="hp" aria-hidden="true">
        <label htmlFor="company_fax">Fax</label>
        <input id="company_fax" name="leave_blank" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit">Submit for review</button>
      {status ? <p className={tone === "ok" ? "ok notice" : "bad notice"}>{status}</p> : null}
    </form>
  );
}
