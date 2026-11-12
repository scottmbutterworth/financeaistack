import { InquiryForm } from "@/components/inquiry-form";
import { publicStats } from "@/lib/queries";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sponsor Finance AI Stack",
  description:
    "Sponsor the bar and the weekly newsletter for A$150 a week, or a featured listing for A$99 a month. No checkout — get in touch.",
};

export default function SponsorPage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading sponsor details…</p>}>
        <SponsorBody />
      </Suspense>
    </div>
  );
}

async function SponsorBody() {
  const stats = await publicStats();
  return (
    <>
      <h1>Sponsor the directory</h1>
      <p className="lede">
        A small bar on every page, a line in the weekly note, or a featured listing. Priced in Australian dollars. There
        is no checkout.
      </p>
      <div className="stats">
        <div className="stat">
          <b>{stats.available ? stats.subscribers.toLocaleString("en-AU") : "—"}</b>
          <span>Newsletter subscribers saved on this site</span>
        </div>
        <div className="stat">
          <b>{stats.available ? stats.monthlyPageviews.toLocaleString("en-AU") : "—"}</b>
          <span>Pageviews this month, counted here</span>
        </div>
        <div className="stat">
          <b>A$150</b>
          <span>Per week for the bar and a newsletter mention</span>
        </div>
      </div>
      {!stats.available ? (
        <p className="notice">Subscriber and pageview counts appear when the database is connected. They are not estimates.</p>
      ) : null}
      <div className="offers">
        <div className="offer">
          <b>A$150 / week</b>
          Sponsor bar on the site, plus a “Sponsored by” line in that week&apos;s newsletter. Clicks go through a tracked
          /go link.
        </div>
        <div className="offer">
          <b>A$99 / month</b>
          Featured listing in the directory. Your tool stays in the set finance teams see first.
        </div>
      </div>
      <InquiryForm />
    </>
  );
}
