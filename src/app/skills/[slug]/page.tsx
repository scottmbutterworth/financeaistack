import { CopySkill } from "@/components/copy-skill";
import { AccessFlag, AuFlag, DbNotice, TagList, TypeBadge } from "@/components/directory";
import { AnswerBlock, Breadcrumbs, JsonLd } from "@/components/structured";
import { originalGithubTree, originalSkill } from "@/data/original-skills";
import { answerForEntry } from "@/lib/answers";
import { getEntriesBySlugs, getEntry } from "@/lib/queries";
import { softwareApplication } from "@/lib/schema";
import { listSkillFiles, readSkillFile } from "@/lib/skill-files";
import { renderSkillMarkdown, stripFrontmatter } from "@/lib/skill-markdown";
import { accessLabel, stageName } from "@/lib/skills";
import { absoluteUrl } from "@/lib/site";
import type { Entry } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (entry.data && entry.data.kind === "skill") {
    return {
      title: entry.data.name,
      description: entry.data.summary,
      alternates: { canonical: `/skills/${entry.data.slug}` },
    };
  }
  const original = originalSkill(slug);
  if (original) {
    return {
      title: original.name,
      description: original.summary,
      alternates: { canonical: `/skills/${original.slug}` },
    };
  }
  return { title: "Skill", description: "A vetted finance skill, plugin, or connector." };
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
  const original = originalSkill(slug);
  const files = original ? listSkillFiles(slug) : [];
  const markdown = original ? readSkillFile(slug, "SKILL.md") : null;

  if (!result.ok && !original) return <DbNotice ok={false} empty={false} />;
  const entry = result.data;
  if (entry && entry.kind !== "skill") notFound();
  if (!entry && !original) notFound();

  return (
    <article className={original ? "prose skill-page" : "prose"}>
      <Breadcrumbs
        items={[
          { name: "Skills", href: "/skills" },
          ...(original ? [{ name: "Originals", href: "/skills/originals" }] : []),
          { name: entry?.name || original?.name || slug, href: `/skills/${slug}` },
        ]}
      />
      {entry ? <JsonLd data={softwareApplication(entry)} /> : original ? <JsonLd data={originalJsonLd(slug, original)} /> : null}
      {!result.ok && original ? (
        <p className="notice">The directory database is unavailable. The skill text below is read from the repository.</p>
      ) : null}
      {entry ? <DirectorySkill entry={entry} /> : null}
      {original && markdown ? (
        <section>
          {entry ? <h2>Skill instructions</h2> : <h1>{original.name}</h1>}
          {!entry ? <p className="lede">{original.summary}</p> : null}
          <p className="badges" style={{ justifyContent: "flex-start", margin: "0.4rem 0 0.6rem" }}>
            <span className="badge badge-original">Original</span>
            <span className="badge badge-au">AU fit</span>
          </p>
          <CopySkill slug={slug} />
          <p className="meta">
            GitHub:{" "}
            <a href={originalGithubTree(slug)} rel="noreferrer">
              {originalGithubTree(slug).replace(/^https?:\/\//, "")}
            </a>
          </p>
          <p className="notice">
            This is not accounting, tax, legal or financial advice. Check the draft with your auditor and your other
            advisers before anyone relies on it.
          </p>
          <div className="skill-doc" dangerouslySetInnerHTML={{ __html: renderSkillMarkdown(stripFrontmatter(markdown)) }} />
          {files.length > 0 ? (
            <>
              <h2>Files in this skill</h2>
              <ul>
                {files.map((name) => (
                  <li key={name}>
                    <code>{name}</code>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}

function DirectorySkill({ entry }: { entry: Entry }) {
  const parents = getEntriesBySlugs(entry.tool_slugs);
  return <DirectorySkillBody entry={entry} parents={parents} />;
}

async function DirectorySkillBody({
  entry,
  parents,
}: {
  entry: Entry;
  parents: ReturnType<typeof getEntriesBySlugs>;
}) {
  const related = await parents;
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
    <>
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
        {entry.original ? <span className="badge badge-original">Original</span> : null}
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
      {!entry.original ? (
        <>
          <h2>What it does</h2>
          <p>{entry.description}</p>
        </>
      ) : (
        <p>{entry.description}</p>
      )}
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
      {related.data.length > 0 ? (
        <>
          <h2>Works with</h2>
          <ul>
            {related.data.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {entry.website_url && !entry.original ? (
        <p>
          <a className="button" href={entry.website_url} rel="noreferrer">
            Source page
          </a>
        </p>
      ) : null}
    </>
  );
}

function originalJsonLd(slug: string, skill: NonNullable<ReturnType<typeof originalSkill>>) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: skill.name,
    description: skill.summary,
    url: absoluteUrl(`/skills/${slug}`),
    license: "https://opensource.org/license/mit",
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "Finance AI Stack" },
  };
}
