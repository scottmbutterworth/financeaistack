import { Breadcrumbs, FaqBlock } from "@/components/structured";
import { VETTING } from "@/lib/skills";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About and methodology",
  description:
    "How Finance AI Stack vets tools and skills, who curates it, how often it is updated, and how to send a correction.",
  alternates: { canonical: "/about" },
};

const FAQS = [
  {
    question: "Who curates Finance AI Stack?",
    answer:
      "Finance AI Stack is curated by a former CFO of an ASX-listed company. Product names are not invented, and a price is recorded only when a vendor publishes it.",
  },
  {
    question: "How often is the directory updated?",
    answer:
      "Each tool and skill record shows the date its price page was checked. News feeds are read once a day at 19:00 UTC. A news item is not public until a person writes why it matters and publishes it.",
  },
  {
    question: "How do I correct an error?",
    answer:
      "Use the submit form and say what is wrong, with a link to the vendor page. Corrections are reviewed before the record changes.",
  },
];

export default function AboutPage() {
  return (
    <article className="wrap page prose">
      <Breadcrumbs items={[{ name: "About", href: "/about" }]} />
      <h1>About and methodology</h1>
      <p>
        Finance AI Stack is a directory of AI tools, skills, plugins, and connectors for CFOs and finance teams. It is
        curated by a former CFO of an ASX-listed company. The point is a list you can defend: a source link, a checked
        date, and no invented price.
      </p>
      <h2>What gets in</h2>
      <p>A skill or connector is listed only after a pass on every quality check and every security check.</p>
      <h3>Quality</h3>
      <ul>
        {VETTING.quality.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>Security</h3>
      <ul>
        {VETTING.security.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>The checks behind the current skills list were read on {VETTING.checkedOn}.</p>
      <h2>Update cadence</h2>
      <p>
        Price lines stay as published on the checked date printed on the record. News sources are fetched daily at
        19:00 UTC, which is 6am in Sydney during Australian summer. New stories land as pending. They appear on the
        site only after a curation note is written.
      </p>
      <h2>Corrections</h2>
      <p>
        If a price, access note, or description is wrong, send the vendor page that shows the correction through the{" "}
        <Link href="/submit">submit form</Link>.
      </p>
      <FaqBlock faqs={FAQS} />
    </article>
  );
}
