import { CategoryLinks, DbNotice, EntryList } from "@/components/directory";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { searchEntries } from "@/lib/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Params = { slug: string };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: category.blurb,
  };
}

export default function CategoryPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="wrap page">
      <Suspense fallback={<p className="status">Loading this category…</p>}>
        <CategoryBody params={params} />
      </Suspense>
    </div>
  );
}

async function CategoryBody({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const [tools, workflows] = await Promise.all([
    searchEntries({ kind: "tool", category: slug }),
    searchEntries({ kind: "workflow", category: slug }),
  ]);

  return (
    <>
      <CategoryLinks current={slug} />
      <h1>{category.name}</h1>
      <p className="lede">{category.blurb}</p>
      <DbNotice ok={tools.ok} empty={tools.ok && tools.data.length === 0 && workflows.data.length === 0} />
      <h2>Tools</h2>
      <EntryList entries={tools.data} />
      <h2>Workflows</h2>
      {workflows.data.length === 0 ? <p className="meta">No workflow in this category yet.</p> : <EntryList entries={workflows.data} />}
    </>
  );
}
