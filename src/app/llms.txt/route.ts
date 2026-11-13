import { CATEGORIES } from "@/lib/categories";
import { listSkills, searchEntries } from "@/lib/queries";
import { STAGES } from "@/lib/skills";
import { absoluteUrl, SITE_DESCRIPTION } from "@/lib/site";

export async function GET() {
  const [tools, workflows, skills] = await Promise.all([
    searchEntries({ kind: "tool", limit: 200 }),
    searchEntries({ kind: "workflow", limit: 50 }),
    listSkills({}),
  ]);
  const available = tools.ok && workflows.ok && skills.ok;
  const lines = [
    "# Finance AI Stack",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Curated by a former CFO of an ASX-listed company. Prices are recorded only when a vendor publishes them. News is public only after a person writes why it matters.",
    "",
    "## Sections",
    `- [Home](${absoluteUrl("/")}): the directory front page`,
    `- [News](${absoluteUrl("/news")}): published finance AI stories`,
    `- [Skills](${absoluteUrl("/skills")}): vetted skills, plugins, and MCP connectors`,
    `- [Workflows](${absoluteUrl("/workflows")}): step-by-step finance workflows`,
    `- [About](${absoluteUrl("/about")}): vetting criteria and corrections`,
    `- [Full text](${absoluteUrl("/llms-full.txt")}): tools, skills, workflows, and categories in plain text`,
    "",
    "## Categories",
    ...CATEGORIES.map((category) => `- [${category.name}](${absoluteUrl(`/category/${category.slug}`)}): ${category.blurb}`),
    "",
    "## Stages",
    ...STAGES.map((stage) => `- [${stage.name}](${absoluteUrl(`/compare/${stage.slug}`)}): comparison table`),
    "",
    available ? `Catalogue counts: ${tools.data.length} tools, ${skills.data.length} skills, ${workflows.data.length} workflows.` : "The catalogue is temporarily unavailable.",
    "",
  ];
  return text(lines.join("\n"), available);
}

function text(body: string, cache: boolean) {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": cache ? "public, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });
}
