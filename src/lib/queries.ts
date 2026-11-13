import { getSql, isPrerenderInterrupt, logError } from "@/lib/db";
import type { DbState, Entry, SponsorWeek, WorkflowStep } from "@/lib/types";

function formatDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const match = /^\d{4}-\d{2}-\d{2}/.exec(String(value));
  return match ? match[0] : null;
}

function mapEntry(row: Record<string, unknown>): Entry {
  const steps = row.steps;
  return {
    id: Number(row.id),
    slug: String(row.slug),
    kind: row.kind === "workflow" ? "workflow" : row.kind === "skill" ? "skill" : "tool",
    name: String(row.name),
    summary: String(row.summary),
    description: String(row.description),
    description_source_url: (row.description_source_url as string | null) ?? null,
    website_url: (row.website_url as string | null) ?? null,
    pricing_summary: (row.pricing_summary as string | null) ?? null,
    pricing_usd: (row.pricing_usd as string | null) ?? null,
    pricing_aud: (row.pricing_aud as string | null) ?? null,
    pricing_source_url: (row.pricing_source_url as string | null) ?? null,
    pricing_checked_on: formatDate(row.pricing_checked_on),
    how_finance_teams_use: (row.how_finance_teams_use as string | null) ?? null,
    categories: Array.isArray(row.categories) ? (row.categories as string[]) : [],
    steps: Array.isArray(steps) ? (steps as WorkflowStep[]) : null,
    tool_slugs: Array.isArray(row.tool_slugs) ? (row.tool_slugs as string[]) : [],
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    item_type: (row.item_type as string | null) ?? null,
    item_type_detail: (row.item_type_detail as string | null) ?? null,
    publisher: (row.publisher as string | null) ?? null,
    access_level: (row.access_level as string | null) ?? null,
    access_detail: (row.access_detail as string | null) ?? null,
    au_fit: typeof row.au_fit === "boolean" ? row.au_fit : null,
    auth_note: (row.auth_note as string | null) ?? null,
    security_notes: (row.security_notes as string | null) ?? null,
    last_updated: (row.last_updated as string | null) ?? null,
    stages: Array.isArray(row.stages) ? (row.stages as string[]) : [],
    australian_relevance: (row.australian_relevance as string | null) ?? null,
    caveat: (row.caveat as string | null) ?? null,
  };
}

function likePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export async function searchEntries(options: {
  q?: string;
  category?: string;
  kind?: "tool" | "workflow" | "skill";
  featured?: boolean;
  limit?: number;
}): Promise<DbState<Entry[]>> {
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: [] };
    const q = (options.q ?? "").trim().slice(0, 120);
    const category = options.category ?? "";
    const kind = options.kind ?? "";
    const featured = options.featured ?? false;
    const limit = options.limit ?? 100;
    const pattern = q ? likePattern(q) : "";
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM entries
      WHERE published = TRUE
        AND (${kind} = '' OR kind = ${kind})
        AND (${featured} = FALSE OR featured = TRUE)
        AND (${category} = '' OR ${category} = ANY(categories))
        AND (
          ${q} = ''
          OR name ILIKE ${pattern} ESCAPE '\\'
          OR summary ILIKE ${pattern} ESCAPE '\\'
          OR description ILIKE ${pattern} ESCAPE '\\'
        )
      ORDER BY featured DESC, name ASC
      LIMIT ${limit}
    `;
    return { ok: true, data: rows.map(mapEntry) };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "searchEntries");
    return { ok: false, data: [] };
  }
}

export async function getEntry(slug: string): Promise<DbState<Entry | null>> {
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: null };
    const rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM entries WHERE slug = ${slug} AND published = TRUE LIMIT 1
    `;
    return { ok: true, data: rows[0] ? mapEntry(rows[0]) : null };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, `entry:${slug}`);
    return { ok: false, data: null };
  }
}

export async function getEntriesBySlugs(slugs: string[]): Promise<DbState<Entry[]>> {
  if (slugs.length === 0) return { ok: true, data: [] };
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: [] };
    const rows = await sql<Record<string, unknown>[]>`
      SELECT * FROM entries
      WHERE published = TRUE AND slug = ANY(${slugs})
    `;
    const mapped = rows.map(mapEntry);
    const order = new Map(slugs.map((slug, index) => [slug, index]));
    mapped.sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
    return { ok: true, data: mapped };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "entriesBySlugs");
    return { ok: false, data: [] };
  }
}

export async function listPublishedPaths(): Promise<{ kind: string; slug: string }[]> {
  try {
    const sql = await getSql();
    if (!sql) return [];
    const rows = await sql<{ kind: string; slug: string }[]>`
      SELECT kind, slug FROM entries WHERE published = TRUE ORDER BY slug
    `;
    return rows;
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "sitemap");
    return [];
  }
}

export async function logZeroResult(query: string) {
  const trimmed = query.trim().slice(0, 200);
  if (trimmed.length < 2) return;
  try {
    const sql = await getSql();
    if (!sql) return;
    await sql`INSERT INTO zero_result_searches (query) VALUES (${trimmed})`;
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "zero-result");
  }
}

export async function getCurrentSponsor(): Promise<DbState<SponsorWeek | null>> {
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: null };
    const rows = await sql<SponsorWeek[]>`
      SELECT id, week_start::text, sponsor_name, sponsor_slug, tagline, destination_url, active
      FROM sponsor_weeks
      WHERE active = TRUE
        AND week_start <= CURRENT_DATE
        AND week_start + 7 > CURRENT_DATE
      ORDER BY week_start DESC
      LIMIT 1
    `;
    return { ok: true, data: rows[0] ?? null };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "sponsor-week");
    return { ok: false, data: null };
  }
}

export async function getSponsorDestination(slug: string) {
  try {
    const sql = await getSql();
    if (!sql) return null;
    const rows = await sql<{ destination_url: string }[]>`
      SELECT destination_url
      FROM sponsor_weeks
      WHERE sponsor_slug = ${slug} AND active = TRUE
      ORDER BY week_start DESC
      LIMIT 1
    `;
    return rows[0]?.destination_url ?? null;
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, `go:${slug}`);
    return null;
  }
}

export async function logSponsorClick(slug: string, path: string | null) {
  try {
    const sql = await getSql();
    if (!sql) return;
    await sql`
      INSERT INTO sponsor_clicks (sponsor_slug, path)
      VALUES (${slug}, ${path})
    `;
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, `click:${slug}`);
  }
}

export async function publicStats() {
  const empty = { subscribers: 0, monthlyPageviews: 0, available: false };
  try {
    const sql = await getSql();
    if (!sql) return empty;
    const [signups, views] = await Promise.all([
      sql<{ count: number }[]>`SELECT COUNT(*)::int AS count FROM signups`,
      sql<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM pageviews
        WHERE created_at >= date_trunc('month', NOW())
      `,
    ]);
    return {
      subscribers: signups[0]?.count ?? 0,
      monthlyPageviews: views[0]?.count ?? 0,
      available: true,
    };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "public-stats");
    return empty;
  }
}

export async function listSkills(options: { stage?: string; itemType?: string }): Promise<DbState<Entry[]>> {
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: [] };
    const stage = options.stage ?? "";
    const itemType = options.itemType ?? "";
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM entries
      WHERE published = TRUE
        AND kind = 'skill'
        AND (${stage} = '' OR ${stage} = ANY(stages))
        AND (${itemType} = '' OR item_type = ${itemType})
      ORDER BY name ASC
    `;
    return { ok: true, data: rows.map(mapEntry) };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "listSkills");
    return { ok: false, data: [] };
  }
}

export async function skillsForTool(toolSlug: string): Promise<DbState<Entry[]>> {
  try {
    const sql = await getSql();
    if (!sql) return { ok: false, data: [] };
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM entries
      WHERE published = TRUE
        AND kind = 'skill'
        AND ${toolSlug} = ANY(tool_slugs)
      ORDER BY name ASC
    `;
    return { ok: true, data: rows.map(mapEntry) };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, `skills:${toolSlug}`);
    return { ok: false, data: [] };
  }
}

export async function recentSubmissionCount(hash: string, minutes: number) {
  const sql = await getSql();
  if (!sql) return null;
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM submissions
    WHERE ip_hash = ${hash}
      AND created_at > NOW() - (${minutes} * INTERVAL '1 minute')
  `;
  return rows[0]?.count ?? 0;
}

export async function recentSignupCount(hash: string, minutes: number) {
  const sql = await getSql();
  if (!sql) return null;
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM signups
    WHERE ip_hash = ${hash}
      AND created_at > NOW() - (${minutes} * INTERVAL '1 minute')
  `;
  return rows[0]?.count ?? 0;
}

export async function recentInquiryCount(hash: string, minutes: number) {
  const sql = await getSql();
  if (!sql) return null;
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM sponsor_inquiries
    WHERE ip_hash = ${hash}
      AND created_at > NOW() - (${minutes} * INTERVAL '1 minute')
  `;
  return rows[0]?.count ?? 0;
}
