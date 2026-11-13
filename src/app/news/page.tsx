import { entryPath } from "@/components/directory";
import { Breadcrumbs, JsonLd } from "@/components/structured";
import { getEntriesBySlugs } from "@/lib/queries";
import { isAustralianSource } from "@/lib/feeds";
import { listNews } from "@/lib/news";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Finance AI news",
  description: "Published finance AI stories, each with a short note on why it matters to a CFO. Nothing is published until it is reviewed.",
  alternates: { canonical: "/news" },
};

const PAGE_SIZE = 15;

export default function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string; region?: string }> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading news…</p>}>
        <NewsBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NewsBody({ searchParams }: { searchParams: Promise<{ page?: string; region?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const region = params.region === "au" ? "au" : "";
  const news = await listNews({ status: "published", limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, region });
  const pages = Math.max(1, Math.ceil(news.total / PAGE_SIZE));
  const related = await getEntriesBySlugs(news.data.flatMap((item) => item.related_slugs));
  const bySlug = new Map(related.data.map((entry) => [entry.slug, entry]));

  return (
    <>
      <Breadcrumbs items={[{ name: "News", href: "/news" }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Finance AI news",
          itemListElement: news.data.map((item, index) => ({
            "@type": "ListItem",
            position: (page - 1) * PAGE_SIZE + index + 1,
            item: {
              "@type": "NewsArticle",
              headline: item.title,
              datePublished: item.published_at || undefined,
              description: item.why_it_matters || item.summary || undefined,
              url: item.url,
              publisher: { "@type": "Organization", name: item.source },
            },
          })),
        }}
      />
      <div className="section-head">
        <h1>Finance AI news</h1>
        <span className="meta">
          <Link href="/news" aria-current={region ? undefined : "page"}>
            All
          </Link>
          {" · "}
          <Link href="/news?region=au" aria-current={region ? "page" : undefined}>
            Australia
          </Link>
          {" · "}
          <a href="/news/rss.xml">RSS</a>
        </span>
      </div>
      <p className="lede">
        Only items a person has published. The note under each headline is written here. The story itself stays on the
        source site.
      </p>
      {!news.ok ? <p className="notice">The news list is temporarily unavailable.</p> : null}
      {news.ok && news.data.length === 0 ? <p className="notice">Nothing is published yet.</p> : null}
      <ol className="news-list">
        {news.data.map((item) => (
          <li key={item.id}>
            <article>
              <p className="meta">
                {item.region === "AU" || isAustralianSource(item.source) ? <span className="badge badge-au">AU</span> : null}{" "}
                {item.source}
                {item.published_at ? ` · ${item.published_at.slice(0, 10)}` : ""}
              </p>
              <h2>
                <a href={item.url}>{item.title}</a>
              </h2>
              {item.why_it_matters ? (
                <>
                  <h3>Why it matters for CFOs</h3>
                  <p>{item.why_it_matters}</p>
                </>
              ) : null}
              {item.summary ? <p className="meta">{item.summary}</p> : null}
              {item.related_slugs.length > 0 ? (
                <p className="tags">
                  {item.related_slugs.map((slug) => {
                    const entry = bySlug.get(slug);
                    return entry ? (
                      <Link key={slug} className="tag" href={entryPath(entry)}>
                        {entry.name}
                      </Link>
                    ) : null;
                  })}
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ol>
      {pages > 1 ? (
        <p className="meta">
          {page > 1 ? <Link href={newsHref(region, page - 1)}>Newer</Link> : null} Page {page} of {pages}{" "}
          {page < pages ? <Link href={newsHref(region, page + 1)}>Older</Link> : null}
        </p>
      ) : null}
      <p className="meta">
        <a href={absoluteUrl("/news/rss.xml")}>RSS feed of published items</a>
      </p>
      {news.data.some((item) => item.via === "newsdata") ? (
        <p className="meta">
          <a href="https://newsdata.io">Powered by NewsData.io</a>
        </p>
      ) : null}
    </>
  );
}

function newsHref(region: string, page: number) {
  const params = new URLSearchParams();
  if (region) params.set("region", region);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}
