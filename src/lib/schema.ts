import { categoryName } from "@/lib/categories";
import { skillTypeName } from "@/lib/skills";
import { absoluteUrl } from "@/lib/site";
import type { Entry } from "@/lib/types";

export function softwareApplication(entry: Entry) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: entry.name,
    applicationCategory: entry.categories.map((slug) => categoryName(slug)).join(", ") || "BusinessApplication",
    description: entry.summary,
    url: entry.website_url || absoluteUrl(entry.kind === "skill" ? `/skills/${entry.slug}` : `/tools/${entry.slug}`),
  };
  if (entry.publisher) data.publisher = { "@type": "Organization", name: entry.publisher };
  if (entry.original) {
    data.license = "https://opensource.org/license/mit";
    data.isAccessibleForFree = true;
  }
  if (entry.pricing_checked_on) data.dateModified = entry.pricing_checked_on;
  const offer = publishedOffer(entry);
  if (offer) data.offers = offer;
  return data;
}

function publishedOffer(entry: Entry) {
  const source = entry.pricing_aud || entry.pricing_usd || "";
  const match = source.match(/(?:A\$|US\$|\$)\s?([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return null;
  const currency = entry.pricing_aud && source === entry.pricing_aud ? "AUD" : "USD";
  return {
    "@type": "Offer",
    price: match[1],
    priceCurrency: currency,
    description: entry.pricing_summary || source,
    url: entry.pricing_source_url || undefined,
  };
}

export function howTo(entry: Entry) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: entry.name,
    description: entry.summary,
    step: (entry.steps ?? []).map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
    })),
  };
}

export function itemList(name: string, entries: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.url,
    })),
  };
}

export function entryTypeName(entry: Entry) {
  if (entry.kind === "skill") return skillTypeName(entry.item_type) || entry.item_type_detail || "Skill";
  if (entry.kind === "workflow") return "Workflow";
  return "Tool";
}
