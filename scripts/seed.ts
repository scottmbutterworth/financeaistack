import postgres from "postgres";
import { CATALOG, TOOL_COUNT, WORKFLOW_COUNT } from "../src/lib/catalog";
import "./load-env";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Run npm run db:migrate first, with the variable set.");
    process.exit(1);
  }

  const known = new Set(CATALOG.filter((entry) => entry.kind === "tool").map((entry) => entry.slug));
  for (const entry of CATALOG) {
    for (const slug of entry.toolSlugs) {
      if (!known.has(slug)) {
        throw new Error(`Workflow ${entry.slug} links unknown tool ${slug}`);
      }
    }
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
    });
    console.log(`Seeded ${TOOL_COUNT} tools and ${WORKFLOW_COUNT} workflows. Safe to run again.`);
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
