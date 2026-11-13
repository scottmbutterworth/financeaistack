import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { ORIGINAL_CAVEAT, ORIGINAL_SKILLS, originalGithubTree } from "../src/data/original-skills";
import { CATALOG, TOOL_COUNT, WORKFLOW_COUNT } from "../src/lib/catalog";
import "./load-env";

type SkillSeed = {
  slug: string;
  kind: "skill";
  name: string;
  summary: string;
  description: string;
  descriptionSourceUrl: string | null;
  websiteUrl: string | null;
  pricingSummary: string | null;
  pricingUsd: string | null;
  pricingAud: string | null;
  pricingSourceUrl: string | null;
  pricingCheckedOn: string | null;
  howFinanceTeamsUse: string | null;
  categories: string[];
  steps: null;
  toolSlugs: string[];
  featured: boolean;
  itemType: string | null;
  itemTypeLabel: string | null;
  publisher: string | null;
  stages: string[];
  accessLevel: string | null;
  accessDetail: string | null;
  auFit: boolean;
  authNote: string | null;
  securityNotes: string | null;
  lastUpdated: string | null;
  australianRelevance: string | null;
  caveat: string | null;
  attachedTo: string | null;
  original?: boolean;
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Run npm run db:migrate first, with the variable set.");
    process.exit(1);
  }

  const skills = JSON.parse(readFileSync(resolve("src/data/skills.json"), "utf8")) as SkillSeed[];
  const originals: SkillSeed[] = ORIGINAL_SKILLS.map((skill) => ({
    slug: skill.slug,
    kind: "skill",
    name: skill.name,
    summary: skill.summary,
    description: skill.description,
    descriptionSourceUrl: originalGithubTree(skill.slug),
    websiteUrl: originalGithubTree(skill.slug),
    pricingSummary: "No charge. The skill text is in this repository under the MIT licence.",
    pricingUsd: null,
    pricingAud: null,
    pricingSourceUrl: null,
    pricingCheckedOn: null,
    howFinanceTeamsUse: skill.howFinanceTeamsUse,
    categories: skill.categories,
    steps: null,
    toolSlugs: [],
    featured: false,
    itemType: "skill",
    itemTypeLabel: "Finance AI Stack original",
    publisher: "Finance AI Stack",
    stages: skill.stages,
    accessLevel: null,
    accessDetail: "Files you upload",
    auFit: true,
    authNote: "No ledger login. The skill reads the files you give it.",
    securityNotes:
      "Runs in your own AI tool. Read that tool's terms before you paste a facility agreement, a payroll file, or a board pack.",
    lastUpdated: "13 Nov 2026",
    australianRelevance: skill.australianRelevance,
    caveat: ORIGINAL_CAVEAT,
    attachedTo: null,
    original: true,
  }));
  const slugs = new Set(skills.map((skill) => skill.slug));
  for (const skill of originals) {
    if (slugs.has(skill.slug)) throw new Error(`Original skill slug already used: ${skill.slug}`);
    skills.push(skill);
  }
  const known = new Set(CATALOG.filter((entry) => entry.kind === "tool").map((entry) => entry.slug));
  for (const entry of CATALOG) {
    for (const slug of entry.toolSlugs) {
      if (!known.has(slug)) {
        throw new Error(`Workflow ${entry.slug} links unknown tool ${slug}`);
      }
    }
  }
  const unmapped: string[] = [];
  for (const skill of skills) {
    for (const slug of skill.toolSlugs) {
      if (!known.has(slug)) unmapped.push(`${skill.slug} -> ${slug}`);
    }
    if (skill.attachedTo && !known.has(skill.attachedTo)) unmapped.push(`${skill.slug} attached to ${skill.attachedTo}`);
  }
  if (unmapped.length > 0) {
    throw new Error(`Unmapped skill links:\n${unmapped.join("\n")}`);
  }

  const sql = postgres(url, { max: 1, prepare: false, ssl: hostNeedsSsl(url) ? "require" : false });
  try {
    await sql.begin(async (tx) => {
      for (const entry of CATALOG) {
        await tx`
          INSERT INTO entries (
            slug, kind, name, summary, description, description_source_url, website_url,
            pricing_summary, pricing_usd, pricing_aud, pricing_source_url, pricing_checked_on,
            how_finance_teams_use, categories, steps, tool_slugs, featured, published, updated_at
          ) VALUES (
            ${entry.slug},
            ${entry.kind},
            ${entry.name},
            ${entry.summary},
            ${entry.description},
            ${entry.descriptionSourceUrl},
            ${entry.websiteUrl},
            ${entry.pricingSummary},
            ${entry.pricingUsd},
            ${entry.pricingAud},
            ${entry.pricingSourceUrl},
            ${entry.pricingCheckedOn},
            ${entry.howFinanceTeamsUse},
            ${entry.categories},
            ${entry.steps ? tx.json(entry.steps) : null},
            ${entry.toolSlugs},
            ${entry.featured},
            ${true},
            NOW()
          )
          ON CONFLICT (slug) DO UPDATE SET
            kind = EXCLUDED.kind,
            name = EXCLUDED.name,
            summary = EXCLUDED.summary,
            description = EXCLUDED.description,
            description_source_url = EXCLUDED.description_source_url,
            website_url = EXCLUDED.website_url,
            pricing_summary = EXCLUDED.pricing_summary,
            pricing_usd = EXCLUDED.pricing_usd,
            pricing_aud = EXCLUDED.pricing_aud,
            pricing_source_url = EXCLUDED.pricing_source_url,
            pricing_checked_on = EXCLUDED.pricing_checked_on,
            how_finance_teams_use = EXCLUDED.how_finance_teams_use,
            categories = EXCLUDED.categories,
            steps = EXCLUDED.steps,
            tool_slugs = EXCLUDED.tool_slugs,
            featured = EXCLUDED.featured,
            published = TRUE,
            updated_at = NOW()
        `;
      }
      for (const skill of skills) {
        await tx`
          INSERT INTO entries (
            slug, kind, name, summary, description, description_source_url, website_url,
            pricing_summary, pricing_usd, pricing_aud, pricing_source_url, pricing_checked_on,
            how_finance_teams_use, categories, steps, tool_slugs, featured, published,
            item_type, item_type_detail, publisher, access_level, access_detail, au_fit,
            auth_note, security_notes, last_updated, stages, australian_relevance, caveat, original, updated_at
          ) VALUES (
            ${skill.slug},
            ${"skill"},
            ${skill.name},
            ${skill.summary},
            ${skill.description},
            ${skill.descriptionSourceUrl},
            ${skill.websiteUrl},
            ${skill.pricingSummary},
            ${skill.pricingUsd},
            ${skill.pricingAud},
            ${skill.pricingSourceUrl},
            ${skill.pricingCheckedOn},
            ${skill.howFinanceTeamsUse},
            ${skill.categories},
            ${null},
            ${skill.toolSlugs},
            ${false},
            ${true},
            ${skill.itemType},
            ${skill.itemTypeLabel},
            ${skill.publisher},
            ${skill.accessLevel},
            ${skill.accessDetail},
            ${skill.auFit},
            ${skill.authNote},
            ${skill.securityNotes},
            ${skill.lastUpdated},
            ${skill.stages},
            ${skill.australianRelevance},
            ${skill.caveat},
            ${skill.original === true},
            NOW()
          )
          ON CONFLICT (slug) DO UPDATE SET
            kind = 'skill',
            name = EXCLUDED.name,
            summary = EXCLUDED.summary,
            description = EXCLUDED.description,
            description_source_url = EXCLUDED.description_source_url,
            website_url = EXCLUDED.website_url,
            pricing_summary = EXCLUDED.pricing_summary,
            pricing_usd = EXCLUDED.pricing_usd,
            pricing_aud = EXCLUDED.pricing_aud,
            pricing_source_url = EXCLUDED.pricing_source_url,
            pricing_checked_on = EXCLUDED.pricing_checked_on,
            how_finance_teams_use = EXCLUDED.how_finance_teams_use,
            categories = EXCLUDED.categories,
            steps = EXCLUDED.steps,
            tool_slugs = EXCLUDED.tool_slugs,
            featured = FALSE,
            published = TRUE,
            item_type = EXCLUDED.item_type,
            item_type_detail = EXCLUDED.item_type_detail,
            publisher = EXCLUDED.publisher,
            access_level = EXCLUDED.access_level,
            access_detail = EXCLUDED.access_detail,
            au_fit = EXCLUDED.au_fit,
            auth_note = EXCLUDED.auth_note,
            security_notes = EXCLUDED.security_notes,
            last_updated = EXCLUDED.last_updated,
            stages = EXCLUDED.stages,
            australian_relevance = EXCLUDED.australian_relevance,
            caveat = EXCLUDED.caveat,
            original = EXCLUDED.original,
            updated_at = NOW()
        `;
      }
    });
    const attached = skills.filter((skill) => skill.attachedTo).length;
    console.log(
      `Seeded ${TOOL_COUNT} tools, ${WORKFLOW_COUNT} workflows, and ${skills.length} skills (${attached} linked to an existing tool, ${skills.length - attached} new). Safe to run again.`,
    );
  } finally {
    await sql.end();
  }
}

function hostNeedsSsl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
