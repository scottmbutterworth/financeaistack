import { CategoryLinks, DbNotice, EntryList } from "@/components/directory";
import { searchEntries } from "@/lib/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Finance AI Stack — tools and workflows for CFOs",
  description:
    "AI tools and proven workflows for month-end close, variance commentary, board packs, AP, forecasting, and audit prep.",
};

export default function HomePage() {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading tools…</p>}>
        <HomeBody />
      </Suspense>
    </div>
  );
}

async function HomeBody() {
  const [tools, workflows] = await Promise.all([
    searchEntries({ kind: "tool", featured: true, limit: 12 }),
    searchEntries({ kind: "workflow", limit: 6 }),
  ]);
  const toolList = tools.data.length > 0 ? tools : await searchEntries({ kind: "tool", limit: 12 });

  return (
    <>
      <CategoryLinks />
      <DbNotice ok={toolList.ok && workflows.ok} empty={toolList.ok && toolList.data.length === 0} />
      <div className="layout">
        <div>
          <div className="section-head">
            <h1>Tools finance teams actually use</h1>
            <Link href="/search">All tools</Link>
          </div>
          <EntryList entries={toolList.data} />
          <div className="section-head">
            <h2>Workflows</h2>
            <Link href="/workflows">All workflows</Link>
          </div>
          <EntryList entries={workflows.data} />
        </div>
        <aside className="side">
          <div className="panel">
            <h2>This week</h2>
            <p>A short list, not a catalogue dump. Prices link to the vendor page they came from.</p>
            <Link className="button" href="/category/month-end-close">
              Start with the close
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
