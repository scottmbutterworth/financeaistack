"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function closedNow() {
  return window.sessionStorage.getItem("fas-sponsor-closed") === "1";
}

function closedOnServer() {
  return false;
}

function dismissSponsor() {
  window.sessionStorage.setItem("fas-sponsor-closed", "1");
  listeners.forEach((listener) => listener());
}

type Sponsor = {
  sponsor_name: string;
  sponsor_slug: string;
  tagline: string | null;
};

export function SponsorBar({ sponsor }: { sponsor: Sponsor | null }) {
  const closed = useSyncExternalStore(subscribe, closedNow, closedOnServer);
  if (closed) return null;

  const href = sponsor ? `/go/${sponsor.sponsor_slug}` : "/sponsor";
  const text = sponsor
    ? `Sponsored by ${sponsor.sponsor_name}${sponsor.tagline ? ` — ${sponsor.tagline}` : ""}`
    : "Sponsor this spot";

  return (
    <div className="sponsor">
      <a href={href}>{text}</a>
      <button type="button" aria-label="Dismiss sponsor" onClick={dismissSponsor}>
        Close
      </button>
    </div>
  );
}
