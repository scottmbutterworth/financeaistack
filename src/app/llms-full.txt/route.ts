import { CATEGORIES, categoryName } from "@/lib/categories";
import { listSkills, searchEntries } from "@/lib/queries";
import { accessLabel, stageName } from "@/lib/skills";
import { absoluteUrl } from "@/lib/site";
import type { Entry } from "@/lib/types";

export async function GET() {
  const [tools, workflows, skills] = await Promise.all([
    searchEntries({ kind: "tool", limit: 200 }),
    searchEntries({ kind: "workflow", limit: 50 }),
    listSkills({}),
  ]);
  const available = tools.ok && workflows.ok && skills.ok;
  const lines = [
    "# Finance AI Stack — full text",
    "",
    "Facts below are the directory records. A price is included only when the record stores one. Checked dates are the dates stored on the record.",
    "",
    "## Categories",
    ...CATEGORIES.map((category) => `- ${category.name} (${absoluteUrl(`/category/${category.slug}`)}): ${category.blurb}`),
    "",
  ];
  if (!available) {
    lines.push("The catalogue is temporarily unavailable.");
  } else {
    lines.push("## Tools", "");
    for (const entry of tools.data) lines.push(block(entry), "");
    lines.push("## Skills, plugins, and connectors", "");
    for (const entry of skills.data) lines.push(block(entry), "");
    lines.push("## Workflows", "");
    for (const entry of workflows.data) lines.push(block(entry), "");
  }
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": available ? "public, s-maxage=3600, stale-while-revalidate=86400" : "no-store",
    },
  });
}

function block(entry: Entry) {
  const path = entry.kind === "workflow" ? `/workflows/${entry.slug}` : entry.kind === "skill" ? `/skills/${entry.slug}` : `/tools/${entry.slug}`;
  return [
    `### ${entry.name}`,
    `URL: ${absoluteUrl(path)}`,
    entry.website_url ? `Vendor: ${entry.website_url}` : "",
    entry.publisher ? `Publisher: ${entry.publisher}` : "",
    `Kind: ${entry.kind}${entry.item_type_detail ? ` (${entry.item_type_detail})` : ""}`,
    `Summary: ${entry.summary}`,
    `Categories: ${entry.categories.map((slug) => categoryName(slug)).join(", ") || "none"}`,
    entry.stages.length ? `Stages: ${entry.stages.map((slug) => stageName(slug)).join(", ")}` : "",
    `Pricing: ${entry.pricing_summary || "Not published"}`,
    entry.pricing_usd ? `USD: ${entry.pricing_usd}` : "",
    entry.pricing_aud ? `AUD: ${entry.pricing_aud}` : "",
    entry.pricing_source_url ? `Price source: ${entry.pricing_source_url}` : "",
    entry.pricing_checked_on ? `Checked: ${entry.pricing_checked_on}` : "",
    entry.access_detail ? `Access: ${accessLabel(entry.access_level, entry.access_detail)}` : "",
    entry.au_fit === true ? "AU fit: yes" : entry.au_fit === false ? "AU fit: no" : "",
    entry.description_source_url ? `Description source: ${entry.description_source_url}` : "",
    entry.security_notes ? `Security notes: ${entry.security_notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
