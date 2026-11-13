import { CATEGORIES, categoryName } from "@/lib/categories";
import { accessLabel, skillTypeName } from "@/lib/skills";
import type { Entry } from "@/lib/types";
import Link from "next/link";

export function entryPath(entry: Entry) {
  if (entry.kind === "workflow") return `/workflows/${entry.slug}`;
  if (entry.kind === "skill") return `/skills/${entry.slug}`;
  return `/tools/${entry.slug}`;
}

export function TypeBadge({ type }: { type: string | null }) {
  const name = skillTypeName(type);
  if (!name) return null;
  return <span className={`badge badge-${type}`}>{name}</span>;
}

export function AuFlag({ fit }: { fit: boolean | null }) {
  if (fit === null) return null;
  return <span className={fit ? "badge badge-au" : "badge"}>{fit ? "AU fit" : "Not AU-specific"}</span>;
}

export function AccessFlag({ entry }: { entry: Entry }) {
  const label = accessLabel(entry.access_level, entry.access_detail);
  if (!label) return null;
  return <span className="badge">{label}</span>;
}

export function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="list tools">
      {entries.map((entry) => {
        const price =
          entry.kind === "skill"
            ? (skillTypeName(entry.item_type) ?? "Skill")
            : entry.pricing_aud || entry.pricing_usd || (entry.kind === "tool" ? "See pricing" : "Workflow");
        return (
          <li key={entry.slug}>
            <Link className="row" href={entryPath(entry)}>
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

export function SkillList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="list">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link className="row skill-row" href={entryPath(entry)}>
            <strong>{entry.name}</strong>
            <span className="badges">
              <TypeBadge type={entry.item_type} />
              <AccessFlag entry={entry} />
              <AuFlag fit={entry.au_fit} />
            </span>
            <p>{entry.summary}</p>
          </Link>
        </li>
      ))}
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
