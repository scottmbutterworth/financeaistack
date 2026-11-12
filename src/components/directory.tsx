import { CATEGORIES, categoryName } from "@/lib/categories";
import type { Entry } from "@/lib/types";
import Link from "next/link";

export function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="list tools">
      {entries.map((entry) => {
        const href = entry.kind === "workflow" ? `/workflows/${entry.slug}` : `/tools/${entry.slug}`;
        const price = entry.pricing_aud || entry.pricing_usd || (entry.kind === "tool" ? "See pricing" : "Workflow");
        return (
          <li key={entry.slug}>
            <Link className="row" href={href}>
              <strong>{entry.name}</strong>
              <span className="price">{price}</span>
              <p>{entry.summary}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryLinks({ current }: { current?: string }) {
  return (
    <nav className="chips" aria-label="Job categories">
      {CATEGORIES.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          aria-current={current === category.slug ? "page" : undefined}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

export function TagList({ categories }: { categories: string[] }) {
  return (
    <div className="tags">
      {categories.map((slug) => (
        <Link key={slug} className="tag" href={`/category/${slug}`}>
          {categoryName(slug)}
        </Link>
      ))}
    </div>
  );
}

export function DbNotice({ ok, empty }: { ok: boolean; empty: boolean }) {
  if (!ok) {
    return (
      <p className="notice">
        The catalogue is temporarily unavailable. Pages still load, and they fill in once the database is reachable.
      </p>
    );
  }
  if (empty) {
    return <p className="notice">Nothing is published yet. Seed the database, or approve a submission, and it will show here.</p>;
  }
  return null;
}
