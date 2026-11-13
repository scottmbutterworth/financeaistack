import { DbNotice, SkillList } from "@/components/directory";
import { Breadcrumbs, JsonLd } from "@/components/structured";
import { ORIGINAL_SKILLS } from "@/data/original-skills";
import { listSkills } from "@/lib/queries";
import { itemList } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Finance AI Stack originals",
  description:
    "Original agent skills written for Australian CFOs: ASX reporting, board packs, debt covenants, payroll and STP, and finance risk and controls.",
  alternates: { canonical: "/skills/originals" },
};

export default function OriginalsPage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading original skills…</p>}>
        <OriginalsBody />
      </Suspense>
    </div>
  );
}

async function OriginalsBody() {
  const skills = await listSkills({ originalOnly: true });
  const order = new Map(ORIGINAL_SKILLS.map((skill, index) => [skill.slug, index]));
  const entries = [...skills.data].sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99),
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Skills", href: "/skills" },
          { name: "Originals", href: "/skills/originals" },
        ]}
      />
      <JsonLd
        data={itemList(
          "Finance AI Stack original skills",
          ORIGINAL_SKILLS.map((skill) => ({
            name: skill.name,
            url: absoluteUrl(`/skills/${skill.slug}`),
          })),
        )}
      />
      <h1>Finance AI Stack originals</h1>
      <p className="lede">
        Five skills written here, for CFOs and finance teams at Australian companies, especially those listed on
        ASX. Each one is a folder you can copy into Claude, a custom GPT, or Cursor. MIT licence. They are drafts
        for your team and your auditor, not advice.
      </p>
      <DbNotice ok={skills.ok} empty={skills.ok && entries.length === 0} />
      {skills.ok && entries.length === 0 ? (
        <p className="meta">The files are in the repository. Run the database seed to publish the directory entries.</p>
      ) : null}
      <SkillList entries={entries} />
    </>
  );
}
