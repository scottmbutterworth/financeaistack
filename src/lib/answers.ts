import { categoryName } from "@/lib/categories";
import type { Entry } from "@/lib/types";

export type Faq = { question: string; answer: string };

export function answerForEntry(entry: Entry) {
  const categories = entry.categories.map((slug) => categoryName(slug));
  const what = entry.summary.trim();
  const best = firstSentence(entry.how_finance_teams_use) || (categories.length
    ? `It is tagged for ${categories.join(", ")}.`
    : "No job category is recorded on this entry.");
  let australia = "This record does not include a separate Australia-fit flag.";
  if (entry.au_fit === true) {
    australia = entry.australian_relevance || "Flagged as a fit for Australian finance teams.";
  } else if (entry.au_fit === false) {
    australia = entry.australian_relevance || "Not flagged as Australia-specific.";
  }
  if (entry.pricing_aud) {
    australia = `${australia} A published AUD price is recorded on this page.`;
  }
  return { what, best, australia };
}

export function answerForCategory(name: string, blurb: string, entries: Entry[]) {
  const names = entries.map((entry) => entry.name);
  const what = blurb;
  const best = names.length
    ? `Records tagged here: ${names.slice(0, 12).join(", ")}${names.length > 12 ? "." : "."}`
    : "No tool or skill is tagged here yet.";
  const au = entries.filter((entry) => entry.au_fit === true).map((entry) => entry.name);
  const australia = au.length
    ? `Flagged for Australia: ${au.join(", ")}.`
    : "None of the records in this category carry an Australia-fit flag.";
  return { what, best, australia };
}

export function categoryFaqs(name: string, entries: Entry[]): Faq[] {
  const names = entries.map((entry) => entry.name);
  const priced = entries.filter((entry) => entry.pricing_summary);
  const au = entries.filter((entry) => entry.au_fit === true);
  const access = entries.filter((entry) => entry.access_detail || entry.security_notes).slice(0, 6);
  const faqs: Faq[] = [
    {
      question: `What is the best AI tool for ${name}?`,
      answer: names.length
        ? `Finance AI Stack does not rank a single best tool. These are the published records tagged ${name}: ${names.join(", ")}.`
        : `No published record is tagged ${name} yet.`,
    },
    {
      question: `What do the ${name} records cost?`,
      answer: priced.length
        ? priced
            .map((entry) => `${entry.name}: ${entry.pricing_summary}`)
            .join(" ")
        : "No published price is stored for this category.",
    },
    {
      question: `Which ${name} records are flagged for Australia?`,
      answer: au.length
        ? `${au.map((entry) => entry.name).join(", ")}.`
        : "None of the records in this category carry an Australia-fit flag.",
    },
  ];
  if (access.length) {
    faqs.push({
      question: `What access do the ${name} connectors record?`,
      answer: access
        .map((entry) => `${entry.name}: ${entry.access_detail || entry.security_notes}`)
        .join(" "),
    });
  }
  const checked = entries.map((entry) => entry.pricing_checked_on).filter((date): date is string => Boolean(date)).sort().at(-1);
  faqs.push({
    question: "Where do the prices come from?",
    answer: checked
      ? `Only from the vendor page linked on each record. The newest checked date stored in this category is ${checked}. If a record says contact sales or not published, no dollar figure was on the page we read.`
      : "Only from the vendor page linked on each record. If a record says contact sales or not published, no dollar figure was on the page we read.",
  });
  return faqs.slice(0, 5);
}

function firstSentence(value: string | null) {
  if (!value) return "";
  const match = value.trim().match(/^(.+?[.])(?:\s|$)/);
  return (match?.[1] ?? value.trim()).slice(0, 320);
}
