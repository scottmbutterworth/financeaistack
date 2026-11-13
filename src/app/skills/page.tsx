import { DbNotice, SkillList } from "@/components/directory";
import { Breadcrumbs, JsonLd } from "@/components/structured";
import { listSkills } from "@/lib/queries";
import { itemList } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import { SKILL_TYPES, STAGES, VETTING } from "@/lib/skills";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Skills and plugins",
  description:
    "Vetted AI skills, plugins, and MCP connectors for finance teams, filterable by the job in the close and by type.",
  alternates: { canonical: "/skills" },
};

type Query = { stage?: string; type?: string };

export default function SkillsPage({ searchParams }: { searchParams: Promise<Query> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading skills…</p>}>
        <SkillsBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SkillsBody({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const stage = STAGES.some((item) => item.slug === params.stage) ? params.stage ?? "" : "";
  const itemType = SKILL_TYPES.some((item) => item.slug === params.type) ? params.type ?? "" : "";
  const skills = await listSkills({ stage, itemType });

  return (
    <>
      <Breadcrumbs items={[{ name: "Skills", href: "/skills" }]} />
      <JsonLd
        data={itemList(
          "Skills and plugins",
          skills.data.map((entry) => ({ name: entry.name, url: absoluteUrl(`/skills/${entry.slug}`) })),
        )}
      />
      <h1>Skills and plugins</h1>
      <p className="lede">
        Connectors, skills, and apps a finance team can add to the tools they already run. Vetted for quality and
        security on {VETTING.checkedOn}. Prices are only what the publisher has printed.
      </p>
      <div className="layout">
        <div>
          <form className="search" action="/skills" method="get">
            <select name="stage" defaultValue={stage} aria-label="Stage">
              <option value="">All stages</option>
              {STAGES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select name="type" defaultValue={itemType} aria-label="Type">
              <option value="">All types</option>
              {SKILL_TYPES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="submit">Filter</button>
          </form>
          <DbNotice ok={skills.ok} empty={skills.ok && skills.data.length === 0} />
          <SkillList entries={skills.data} />
        </div>
        <aside className="side">
          <div className="panel">
            <h2>Vetted for quality and security</h2>
            <p>A pass on every check, from the publisher’s own pages, on {VETTING.checkedOn}.</p>
            <h3>Quality</h3>
            <ul className="criteria">
              {VETTING.quality.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Security</h3>
            <ul className="criteria">
              {VETTING.security.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
