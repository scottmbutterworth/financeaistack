import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
  trimValues: true,
});

const AI = /\b(ai|a\.i\.|artificial intelligence|machine learning|\bllm\b|\bgpt\b|copilot|claude|gemini|chatgpt|generative|\bmcp\b|agentic|agents?)\b/i;
const FINANCE =
  /\b(finance|financial|accounting|accountant|cfo|controller|close|ledger|invoice|forecast|audit|payroll|treasury|receivable|payable|fp&a|fpa|reporting|reconcil|gaap|ifrs|\berp\b|bookkeep|expense|spend|cash flow|board)\b/i;

export function isRelevant(title: string, summary: string) {
  const text = `${title} ${summary}`;
  return AI.test(text) && FINANCE.test(text);
}

export function parseFeed(xml: string): FeedItem[] {
  const doc = parser.parse(xml) as Record<string, unknown>;
  const rss = asRecord(doc.rss);
  const channel = asRecord(rss?.channel);
  const atom = asRecord(doc.feed);
  const rawItems = channel ? asArray(channel.item) : atom ? asArray(atom.entry) : [];
  const items: FeedItem[] = [];
  for (const raw of rawItems) {
    const record = asRecord(raw);
    if (!record) continue;
    const title = clean(text(record.title));
    const url = clean(linkOf(record.link) || text(record.guid));
    if (!title || !/^https?:\/\//i.test(url)) continue;
    const summary = clean(stripHtml(text(record.description) || text(record.summary) || text(record.content)));
    const publishedAt = toIso(text(record.pubDate) || text(record.published) || text(record.updated) || text(record.date));
    items.push({ title: title.slice(0, 300), url: url.slice(0, 1000), summary: summary.slice(0, 600), publishedAt });
  }
  return items;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): unknown[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const record = asRecord(value);
  if (!record) return "";
  if (typeof record["#text"] === "string" || typeof record["#text"] === "number") return String(record["#text"]);
  return "";
}

function linkOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const alternate = value.find((item) => asRecord(item)?.["@_rel"] === "alternate") ?? value[0];
    return linkOf(alternate);
  }
  const record = asRecord(value);
  if (!record) return "";
  const href = record["@_href"];
  return typeof href === "string" ? href : text(value);
}

function stripHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .replace(/&#\d+;/g, " ");
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function toIso(value: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
