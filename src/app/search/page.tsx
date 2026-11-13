import { DbNotice, EntryList } from "@/components/directory";
import { CATEGORIES } from "@/lib/categories";
import { logZeroResult, searchEntries } from "@/lib/queries";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI tools and workflows for finance teams, and filter by the job to be done.",
};

type Query = { q?: string; category?: string; kind?: string };

export default function SearchPage({ searchParams }: { searchParams: Promise<Query> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Searching…</p>}>
        <SearchBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchBody({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 120);
  const category = CATEGORIES.some((item) => item.slug === params.category) ? params.category ?? "" : "";
  const kind = params.kind === "tool" || params.kind === "workflow" || params.kind === "skill" ? params.kind : "";
  const results = await searchEntries({
    q,
    category,
    kind: kind || undefined,
    limit: 80,
  });

  if (results.ok && q.length >= 2 && results.data.length === 0) {
    await logZeroResult(q);
  }

  return (
    <>
      <h1>Search</h1>
      <form className="search" action="/search" method="get">
        <input name="q" defaultValue={q} placeholder="Variance, BAS, close, Excel…" aria-label="Search" />
        <select name="category" defaultValue={category} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select name="kind" defaultValue={kind} aria-label="Type">
          <option value="">All</option>
          <option value="tool">Tools</option>
          <option value="workflow">Workflows</option>
          <option value="skill">Skills and plugins</option>
        </select>
        <button type="submit">Search</button>
      </form>
      <DbNotice ok={results.ok} empty={false} />
      {results.ok && q && results.data.length === 0 ? (
        <p className="notice">Nothing matched “{q}”. That search was logged so the directory can grow toward it.</p>
      ) : null}
      <EntryList entries={results.data} />
    </>
  );
}
