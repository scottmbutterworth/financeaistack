import { listNews } from "@/lib/news";
import { absoluteUrl } from "@/lib/site";

export async function GET() {
  const news = await listNews({ status: "published", limit: 50 });
  const items = news.data
    .map((item) => {
      const date = item.published_at ? new Date(item.published_at).toUTCString() : "";
      return `<item>
        <title>${escapeXml(item.title)}</title>
        <link>${escapeXml(item.url)}</link>
        <guid>${escapeXml(item.url)}</guid>
        <pubDate>${date}</pubDate>
        <description>${escapeXml(item.why_it_matters || item.summary || "")}</description>
        <source url="${escapeXml(item.url)}">${escapeXml(item.source)}</source>
      </item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Finance AI Stack news</title>
    <link>${escapeXml(absoluteUrl("/news"))}</link>
    <description>Published finance AI stories with a note on why they matter to a CFO.</description>
    <language>en-au</language>
    ${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
