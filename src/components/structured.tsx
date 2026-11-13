import { absoluteUrl } from "@/lib/site";
import type { Faq } from "@/lib/answers";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const list = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          {list.map((item, index) => (
            <li key={item.href}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {index === list.length - 1 ? <span>{item.name}</span> : <a href={item.href}>{item.name}</a>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: list.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  );
}

export function AnswerBlock({
  what,
  best,
  australia,
  checked,
  sourceUrl,
}: {
  what: string;
  best: string;
  australia: string;
  checked?: string | null;
  sourceUrl?: string | null;
}) {
  return (
    <section className="answer">
      <p>
        <strong>What it is.</strong> {what}
      </p>
      <p>
        <strong>Best for.</strong> {best}
      </p>
      <p>
        <strong>Australia.</strong> {australia}
      </p>
      <p className="meta">
        {sourceUrl ? (
          <>
            Source: <a href={sourceUrl}>{sourceUrl.replace(/^https?:\/\//, "")}</a>.{" "}
          </>
        ) : null}
        {checked ? `Last checked ${checked}.` : "No checked date is stored on this record."}
      </p>
    </section>
  );
}

export function FaqBlock({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <section>
      <h2>Questions</h2>
      {faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
    </section>
  );
}

export function siteGraph() {
  const url = absoluteUrl("/");
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Finance AI Stack",
      url,
      description: "A directory of AI tools, skills, and workflows for CFOs and finance teams, curated by a former ASX-listed CFO.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Finance AI Stack",
      url,
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/search")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}
