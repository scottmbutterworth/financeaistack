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
  {
    slug: "accounts-receivable",
    name: "Accounts receivable",
    blurb: "Invoices out, collections, and the cash customers still owe.",
  },
  {
    slug: "payroll",
    name: "Payroll",
    blurb: "Pay runs, employees, and the journals that follow.",
  },
  {
    slug: "treasury-and-cash",
    name: "Treasury and cash",
    blurb: "Bank balances, cash position, and the short-term forecast.",
  },
  {
    slug: "working-capital",
    name: "Working capital",
    blurb: "Receivables, payables, and the cash tied up between them.",
  },
  {
    slug: "capital-management",
    name: "Capital management",
    blurb: "Cap tables, funding, and how the business is capitalised.",
  },
  {
    slug: "risk-and-controls",
    name: "Risk and controls",
    blurb: "Controls, governance, and where the risk actually sits.",
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
