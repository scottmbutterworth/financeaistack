import { CategoryLinks, DbNotice, EntryList } from "@/components/directory";
import { AnswerBlock, Breadcrumbs, FaqBlock, JsonLd } from "@/components/structured";
import { answerForCategory, categoryFaqs } from "@/lib/answers";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { searchEntries } from "@/lib/queries";
import { itemList } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";
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
    alternates: { canonical: `/category/${category.slug}` },
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
  const [tools, workflows, skills] = await Promise.all([
    searchEntries({ kind: "tool", category: slug }),
    searchEntries({ kind: "workflow", category: slug }),
    searchEntries({ kind: "skill", category: slug }),
  ]);
  const empty = tools.data.length === 0 && workflows.data.length === 0 && skills.data.length === 0;
  const listed = [...tools.data, ...skills.data];
  const answer = answerForCategory(category.name, category.blurb, listed);
  const newest = listed
    .map((entry) => entry.pricing_checked_on)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);

  return (
    <>
      <Breadcrumbs items={[{ name: category.name, href: `/category/${slug}` }]} />
      <JsonLd
        data={itemList(
          category.name,
          listed.map((entry) => ({
            name: entry.name,
            url: absoluteUrl(entry.kind === "skill" ? `/skills/${entry.slug}` : `/tools/${entry.slug}`),
          })),
        )}
      />
      <CategoryLinks current={slug} />
      <h1>{category.name}</h1>
      <AnswerBlock what={answer.what} best={answer.best} australia={answer.australia} checked={newest} />
      <FaqBlock faqs={categoryFaqs(category.name, listed)} />
      <p className="lede">{category.blurb}</p>
      <DbNotice ok={tools.ok && skills.ok} empty={tools.ok && empty} />
      <h2>Tools</h2>
      {tools.data.length === 0 ? <p className="meta">No tool in this category yet.</p> : <EntryList entries={tools.data} />}
      <h2>Connectors and skills</h2>
      {skills.data.length === 0 ? (
        <p className="meta">No vetted connector or skill in this category yet.</p>
      ) : (
        <EntryList entries={skills.data} />
      )}
      <h2>Workflows</h2>
      {workflows.data.length === 0 ? <p className="meta">No workflow in this category yet.</p> : <EntryList entries={workflows.data} />}
    </>
  );
}
