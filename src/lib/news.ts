import { AU_SOURCES, FEEDS } from "@/lib/feeds";
import { getSql, isPrerenderInterrupt, logError } from "@/lib/db";
import { isRelevant, parseFeed } from "@/lib/rss";

export type NewsItem = {
  id: number;
  source: string;
  title: string;
  url: string;
  published_at: string | null;
  summary: string | null;
  why_it_matters: string | null;
  status: string;
  related_slugs: string[];
  created_at: string;
};

function mapNews(row: Record<string, unknown>): NewsItem {
  return {
    id: Number(row.id),
    source: String(row.source),
    title: String(row.title),
    url: String(row.url),
    published_at: row.published_at ? new Date(String(row.published_at)).toISOString() : null,
    summary: (row.summary as string | null) ?? null,
    why_it_matters: (row.why_it_matters as string | null) ?? null,
    status: String(row.status),
    related_slugs: Array.isArray(row.related_slugs) ? (row.related_slugs as string[]) : [],
    created_at: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date(0).toISOString(),
  };
}

export async function listNews(options: {
  status?: string;
  limit?: number;
  offset?: number;
  sinceDays?: number;
  region?: string;
}) {
  const empty = { ok: false as const, data: [] as NewsItem[], total: 0 };
  try {
    const sql = await getSql();
    if (!sql) return empty;
    const status = options.status ?? "published";
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    const sinceDays = options.sinceDays ?? 0;
    const australiaOnly = options.region === "au";
    const rows = await sql<Record<string, unknown>[]>`
      SELECT *
      FROM news_items
      WHERE (${status} = 'all' OR status = ${status})
        AND (${sinceDays} = 0 OR COALESCE(published_at, created_at) >= NOW() - (${sinceDays} * INTERVAL '1 day'))
        AND (${australiaOnly} = FALSE OR source = ANY(${AU_SOURCES}))
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const totals = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM news_items
      WHERE (${status} = 'all' OR status = ${status})
        AND (${sinceDays} = 0 OR COALESCE(published_at, created_at) >= NOW() - (${sinceDays} * INTERVAL '1 day'))
        AND (${australiaOnly} = FALSE OR source = ANY(${AU_SOURCES}))
    `;
    return { ok: true as const, data: rows.map(mapNews), total: totals[0]?.count ?? 0 };
  } catch (error) {
    if (isPrerenderInterrupt(error)) throw error;
    await logError(error, "listNews");
    return empty;
  }
}

export async function ingestNews() {
  const sql = await getSql();
  if (!sql) return { ok: false as const, error: "Database unavailable.", inserted: 0, feeds: [] as FeedReport[] };
  const feeds: FeedReport[] = [];
  let inserted = 0;
  for (const feed of FEEDS) {
    const report = await readFeed(feed.source, feed.url);
    feeds.push(report);
    for (const item of report.items) {
      const rows = await sql<{ id: number }[]>`
        INSERT INTO news_items (source, title, url, published_at, summary, status)
        VALUES (${feed.source}, ${item.title}, ${item.url}, ${item.publishedAt}, ${item.summary || null}, 'pending')
        ON CONFLICT (url) DO NOTHING
        RETURNING id
      `;
      if (rows.length > 0) inserted += 1;
    }
  }
  return {
    ok: true as const,
    inserted,
    feeds: feeds.map((report) => ({
      source: report.source,
      url: report.url,
      ok: report.ok,
      error: report.error,
      seen: report.seen,
      kept: report.kept,
    })),
  };
}

type FeedReport = {
  source: string;
  url: string;
  ok: boolean;
  error?: string;
  seen: number;
  kept: number;
  items: { title: string; url: string; summary: string; publishedAt: string | null }[];
};

async function readFeed(source: string, url: string): Promise<FeedReport> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/rss+xml, application/atom+xml, application/xml, text/xml", "user-agent": "FinanceAIStack/1.0" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!response.ok) {
      return { source, url, ok: false, error: `HTTP ${response.status}`, seen: 0, kept: 0, items: [] };
    }
    const xml = await response.text();
    if (!/<(rss|feed)\b/i.test(xml.slice(0, 2000))) {
      return { source, url, ok: false, error: "Response was not RSS or Atom.", seen: 0, kept: 0, items: [] };
    }
    const parsed = parseFeed(xml).slice(0, 20);
    const items = parsed.filter((item) => isRelevant(item.title, item.summary));
    return { source, url, ok: true, seen: parsed.length, kept: items.length, items };
  } catch (error) {
    return { source, url, ok: false, error: error instanceof Error ? error.message : "Fetch failed", seen: 0, kept: 0, items: [] };
  }
}
