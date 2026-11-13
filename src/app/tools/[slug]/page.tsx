import { DbNotice, SkillList, TagList } from "@/components/directory";
import { AnswerBlock, Breadcrumbs, JsonLd } from "@/components/structured";
import { answerForEntry } from "@/lib/answers";
import { getEntry, skillsForTool } from "@/lib/queries";
import { softwareApplication } from "@/lib/schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry.data || entry.data.kind !== "tool") {
    return { title: "Tool", description: "An AI tool for finance teams." };
  }
  return {
    title: entry.data.name,
    description: entry.data.summary,
    alternates: { canonical: `/tools/${entry.data.slug}` },
  };
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
  const [result, related] = await Promise.all([getEntry(slug), skillsForTool(slug)]);
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

  const answer = answerForEntry(entry);
  return (
    <article className="prose">
      <Breadcrumbs items={[{ name: entry.name, href: `/tools/${entry.slug}` }]} />
      <JsonLd data={softwareApplication(entry)} />
      <h1>{entry.name}</h1>
      <AnswerBlock
        what={answer.what}
        best={answer.best}
        australia={answer.australia}
        checked={checked}
        sourceUrl={entry.description_source_url || entry.pricing_source_url}
      />
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
      {related.data.length > 0 ? (
        <>
          <h2>AI connectors and skills</h2>
          <p className="meta">
            Vetted connectors and skills for this product. Each one links to its own page, with the access level and the
            source.
          </p>
          <SkillList entries={related.data} />
        </>
      ) : null}
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
