import { DbNotice, TagList } from "@/components/directory";
import { getEntry } from "@/lib/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry.data || entry.data.kind !== "tool") {
    return { title: "Tool", description: "An AI tool for finance teams." };
  }
  return { title: entry.data.name, description: entry.data.summary };
}

export default function ToolPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading this tool…</p>}>
        <ToolBody params={params} />
      </Suspense>
    </div>
  );
}

async function ToolBody({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getEntry(slug);
  if (!result.ok) {
    return <DbNotice ok={false} empty={false} />;
  }
  const entry = result.data;
  if (!entry || entry.kind !== "tool") notFound();
  const checked = entry.pricing_checked_on
    ? new Date(`${entry.pricing_checked_on}T00:00:00Z`).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <article className="prose">
      <p className="meta">
        <Link href="/">Directory</Link>
      </p>
      <h1>{entry.name}</h1>
      <p className="lede">{entry.summary}</p>
      <TagList categories={entry.categories} />
      <h2>What it does</h2>
      <p>{entry.description}</p>
      {entry.description_source_url ? (
        <p className="meta">
          Source:{" "}
          <a href={entry.description_source_url} rel="noreferrer">
            {entry.description_source_url.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}
      <h2>Pricing</h2>
      <p>{entry.pricing_summary ?? "Contact sales."}</p>
      {entry.pricing_usd ? <p>USD: {entry.pricing_usd}</p> : null}
      {entry.pricing_aud ? <p>AUD: {entry.pricing_aud}</p> : null}
      <p className="meta">
        {entry.pricing_source_url ? (
          <>
            Price source:{" "}
            <a href={entry.pricing_source_url} rel="noreferrer">
              {entry.pricing_source_url.replace(/^https?:\/\//, "")}
            </a>
            .{" "}
          </>
        ) : null}
        {checked ? `Checked ${checked}.` : null}
      </p>
      <h2>How finance teams use it</h2>
      <p>{entry.how_finance_teams_use}</p>
      {entry.website_url ? (
        <p>
          <a className="button" href={entry.website_url} rel="noreferrer">
            Vendor site
          </a>
        </p>
      ) : null}
    </article>
  );
}
