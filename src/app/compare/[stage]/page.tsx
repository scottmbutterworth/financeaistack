import { entryPath } from "@/components/directory";
import { AnswerBlock, Breadcrumbs, JsonLd } from "@/components/structured";
import { entriesForStage } from "@/lib/compare";
import { accessLabel, stageName, STAGES } from "@/lib/skills";
import { itemList } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { stage: string };

export function generateStaticParams() {
  return STAGES.map((stage) => ({ stage: stage.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { stage } = await params;
  const name = stageName(stage);
  if (!STAGES.some((item) => item.slug === stage)) return { title: "Compare" };
  return {
    title: `${name} comparison`,
    description: `Tools and connectors tagged ${name}, with published pricing, access, and Australia-fit flags.`,
    alternates: { canonical: `/compare/${stage}` },
  };
}

export default function ComparePage({ params }: { params: Promise<Params> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading the comparison…</p>}>
        <CompareBody params={params} />
      </Suspense>
    </div>
  );
}

async function CompareBody({ params }: { params: Promise<Params> }) {
  const { stage } = await params;
  if (!STAGES.some((item) => item.slug === stage)) notFound();
  const name = stageName(stage);
  const rows = await entriesForStage(stage);
  const names = rows.data.map((entry) => entry.name);

  return (
    <article>
      <Breadcrumbs items={[{ name: "Compare", href: "/compare/month-end-close" }, { name, href: `/compare/${stage}` }]} />
      <JsonLd
        data={itemList(
          name,
          rows.data.map((entry) => ({ name: entry.name, url: absoluteUrl(entryPath(entry)) })),
        )}
      />
      <h1>{name}</h1>
      <AnswerBlock
        what={`A comparison of directory records tagged for ${name}.`}
        best={names.length ? `Included: ${names.slice(0, 12).join(", ")}.` : "No records are tagged for this stage yet."}
        australia={
          rows.data.some((entry) => entry.au_fit === true)
            ? `Flagged for Australia: ${rows.data.filter((entry) => entry.au_fit).map((entry) => entry.name).join(", ")}.`
            : "None of these records carry an Australia-fit flag."
        }
      />
      {!rows.ok ? <p className="notice">The comparison is temporarily unavailable.</p> : null}
      <div className="table-wrap">
        <table className="data">
          <caption>{name}: tools and connectors in this directory</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Access</th>
              <th scope="col">AU fit</th>
              <th scope="col">Pricing as published</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.data.map((entry) => (
              <tr key={entry.slug}>
                <th scope="row">
                  <Link href={entryPath(entry)}>{entry.name}</Link>
                </th>
                <td>{entry.kind === "skill" ? entry.item_type_detail || entry.item_type || "Skill" : "Tool"}</td>
                <td>{accessLabel(entry.access_level, entry.access_detail) || "Not recorded"}</td>
                <td>{entry.au_fit === true ? "Yes" : entry.au_fit === false ? "No" : "Not flagged"}</td>
                <td>{entry.pricing_summary || "Not published"}</td>
                <td>
                  {entry.pricing_source_url || entry.description_source_url || entry.website_url ? (
                    <a href={entry.pricing_source_url || entry.description_source_url || entry.website_url || "#"}>
                      Source
                    </a>
                  ) : (
                    "Not recorded"
                  )}
                  {entry.pricing_checked_on ? ` · checked ${entry.pricing_checked_on}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta">
        Other stages:{" "}
        {STAGES.map((item) => (
          <Link key={item.slug} href={`/compare/${item.slug}`}>
            {item.name}{" "}
          </Link>
        ))}
      </p>
    </article>
  );
}
