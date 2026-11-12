export const CATEGORIES = [
  {
    slug: "month-end-close",
    name: "Month-end close",
    blurb: "Checklists, reconciliations, and the work that has to be signed before the books lock.",
  },
  {
    slug: "variance-commentary",
    name: "Variance commentary",
    blurb: "Turn a trial balance or management P&L into a draft explanation a controller can edit.",
  },
  {
    slug: "board-packs",
    name: "Board packs",
    blurb: "Management accounts, a short narrative, and a pack that matches the ledger.",
  },
  {
    slug: "invoice-to-gl",
    name: "Invoice-to-GL and AP",
    blurb: "Capture, code, approve, and post supplier bills and card spend.",
  },
  {
    slug: "forecasting",
    name: "Forecasting and FP&A",
    blurb: "Rolling forecasts, scenarios, and headcount plans tied to actuals.",
  },
  {
    slug: "audit-prep",
    name: "Audit prep",
    blurb: "Samples, evidence, and a file an auditor can follow without a scavenger hunt.",
  },
  {
    slug: "reporting",
    name: "Reporting and spreadsheets",
    blurb: "Models, live reports, and the spreadsheets finance already lives in.",
  },
  {
    slug: "assistants",
    name: "General assistants",
    blurb: "The chat tools finance teams use to draft, check, and ask questions of a file.",
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const bySlug = new Map(CATEGORIES.map((category) => [category.slug, category]));

export function getCategory(slug: string) {
  return bySlug.get(slug as CategorySlug);
}

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}
