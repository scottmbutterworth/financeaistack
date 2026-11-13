import { AccessFlag, AuFlag, DbNotice, TagList, TypeBadge } from "@/components/directory";
import { AnswerBlock, Breadcrumbs, JsonLd } from "@/components/structured";
import { answerForEntry } from "@/lib/answers";
import { getEntriesBySlugs, getEntry } from "@/lib/queries";
import { softwareApplication } from "@/lib/schema";
import { accessLabel, stageName } from "@/lib/skills";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry.data || entry.data.kind !== "skill") {
    return { title: "Skill", description: "A vetted finance skill, plugin, or connector." };
  }
  return {
    title: entry.data.name,
    description: entry.data.summary,
    alternates: { canonical: `/skills/${entry.data.slug}` },
  };
}

export default function SkillPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading this skill…</p>}>
        <SkillBody params={params} />
      </Suspense>
    </div>
  );
}

async function SkillBody({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getEntry(slug);
  if (!result.ok) return <DbNotice ok={false} empty={false} />;
  const entry = result.data;
  if (!entry || entry.kind !== "skill") notFound();
  const parents = await getEntriesBySlugs(entry.tool_slugs);
  const checked = entry.pricing_checked_on
    ? new Date(`${entry.pricing_checked_on}T00:00:00Z`).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;
  const access = accessLabel(entry.access_level, entry.access_detail);

  const answer = answerForEntry(entry);
  return (
    <article className="prose">
      <Breadcrumbs items={[{ name: "Skills", href: "/skills" }, { name: entry.name, href: `/skills/${entry.slug}` }]} />
      <JsonLd data={softwareApplication(entry)} />
      <h1>{entry.name}</h1>
      <AnswerBlock
        what={answer.what}
        best={answer.best}
        australia={answer.australia}
        checked={checked}
        sourceUrl={entry.description_source_url || entry.pricing_source_url}
      />
      <p className="badges" style={{ justifyContent: "flex-start", margin: "0.4rem 0 0.6rem" }}>
        <TypeBadge type={entry.item_type} />
        <AccessFlag entry={entry} />
        <AuFlag fit={entry.au_fit} />
      </p>
      <p className="lede">{entry.summary}</p>
      {entry.publisher ? <p className="meta">Publisher: {entry.publisher}</p> : null}
      {entry.item_type_detail ? <p className="meta">Published type: {entry.item_type_detail}</p> : null}
      <TagList categories={entry.categories} />
      {entry.stages.length > 0 ? (
        <p className="meta">Stages: {entry.stages.map((stage) => stageName(stage)).join(", ")}</p>
      ) : null}
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
      <h2>Access</h2>
      <p>{access}</p>
      {entry.access_detail && entry.access_detail !== access ? <p>{entry.access_detail}</p> : null}
      {entry.auth_note ? (
        <>
          <h2>Auth</h2>
          <p>{entry.auth_note}</p>
        </>
      ) : null}
      {entry.security_notes ? (
        <>
          <h2>Security notes</h2>
          <p>{entry.security_notes}</p>
        </>
      ) : null}
      {entry.australian_relevance ? (
        <>
          <h2>Australia</h2>
          <p>{entry.australian_relevance}</p>
        </>
      ) : null}
      {entry.caveat ? <p className="notice">{entry.caveat}</p> : null}
      <h2>Pricing</h2>
      <p>{entry.pricing_summary ?? "Not published."}</p>
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
        {entry.last_updated ? ` Last updated: ${entry.last_updated}.` : null}
      </p>
      {parents.data.length > 0 ? (
        <>
          <h2>Works with</h2>
          <ul>
            {parents.data.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {entry.website_url ? (
        <p>
          <a className="button" href={entry.website_url} rel="noreferrer">
            Source page
          </a>
        </p>
      ) : null}
    </article>
  );
}
