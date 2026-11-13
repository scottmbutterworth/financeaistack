import { DbNotice, TagList } from "@/components/directory";
import { Breadcrumbs, JsonLd } from "@/components/structured";
import { getEntriesBySlugs, getEntry } from "@/lib/queries";
import { howTo } from "@/lib/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry.data || entry.data.kind !== "workflow") {
    return { title: "Workflow", description: "A finance workflow using AI tools." };
  }
  return {
    title: entry.data.name,
    description: entry.data.summary,
    alternates: { canonical: `/workflows/${entry.data.slug}` },
  };
}

export default function WorkflowPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading this workflow…</p>}>
        <WorkflowBody params={params} />
      </Suspense>
    </div>
  );
}

async function WorkflowBody({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const result = await getEntry(slug);
  if (!result.ok) return <DbNotice ok={false} empty={false} />;
  const entry = result.data;
  if (!entry || entry.kind !== "workflow") notFound();
  const tools = await getEntriesBySlugs(entry.tool_slugs);

  return (
    <article className="prose">
      <Breadcrumbs items={[{ name: "Workflows", href: "/workflows" }, { name: entry.name, href: `/workflows/${entry.slug}` }]} />
      <JsonLd data={howTo(entry)} />
      <h1>{entry.name}</h1>
      <p className="lede">{entry.summary}</p>
      <TagList categories={entry.categories} />
      <p>{entry.description}</p>
      {entry.how_finance_teams_use ? <p className="meta">{entry.how_finance_teams_use}</p> : null}
      <h2>Steps</h2>
      <ol className="steps">
        {(entry.steps ?? []).map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <div>{step.body}</div>
          </li>
        ))}
      </ol>
      <h2>Tools used</h2>
      {tools.data.length === 0 ? (
        <p className="meta">Tool links appear once those entries are published.</p>
      ) : (
        <ul>
          {tools.data.map((tool) => (
            <li key={tool.slug}>
              <Link href={`/tools/${tool.slug}`}>{tool.name}</Link> — {tool.summary}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
