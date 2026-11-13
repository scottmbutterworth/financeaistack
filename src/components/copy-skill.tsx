"use client";

import { useState } from "react";

export function CopySkill({ slug }: { slug: string }) {
  const [note, setNote] = useState("");

  async function copy() {
    try {
      const response = await fetch(`/skills/${slug}/raw`);
      if (!response.ok) {
        setNote("The skill text could not be read.");
        return;
      }
      await navigator.clipboard.writeText(await response.text());
      setNote("Copied. Paste it into Claude, a custom GPT, or Cursor.");
    } catch {
      setNote("Copy failed. Use the raw file link instead.");
    }
  }

  return (
    <p className="skill-actions">
      <button type="button" onClick={copy}>
        Copy skill
      </button>
      <a className="button" href={`/skills/${slug}/download`}>
        Download zip
      </a>
      <a href={`/skills/${slug}/raw`}>Raw SKILL.md</a>
      {note ? <span className="meta">{note}</span> : null}
    </p>
  );
}
