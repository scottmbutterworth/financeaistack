export const ORIGINAL_REPO = "https://github.com/scottmbutterworth/financeaistack";
export const ORIGINAL_BRANCH = "cursor/finance-ai-stack-5ae2";

export function originalGithubTree(slug: string) {
  return `${ORIGINAL_REPO}/tree/${ORIGINAL_BRANCH}/skills/${slug}`;
}

export type OriginalSkill = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  howFinanceTeamsUse: string;
  categories: string[];
  stages: string[];
  australianRelevance: string;
};

const caveat =
  "This is not accounting, tax, legal or financial advice. Check the output with your auditor and your other advisers before anyone relies on it.";

export const ORIGINAL_CAVEAT = caveat;

export const ORIGINAL_SKILLS: OriginalSkill[] = [
  {
    slug: "asx-half-year-full-year-reporting",
    name: "ASX half-year and full-year reporting",
    summary:
      "Plan the Appendix 4D or 4E pack: the timetable back from the ASX deadline, the form checklist, AASB disclosure pointers, and a check that the presentation matches the results.",
    description:
      "A Finance AI Stack original skill for CFOs of ASX-listed entities. It walks Listing Rules 4.2A, 4.2B, 4.3A, 4.3B and 4.5, the Appendix 4D and 4E items read from the current forms, the auditor and directors' hand-off, and Listing Rule 3.1. It does not lodge an announcement and it does not invent a figure.",
    howFinanceTeamsUse:
      "Use it when the half-year or full-year pack starts, before the audit committee papers are locked.",
    categories: ["reporting", "audit-prep", "board-packs"],
    stages: ["interim-reporting", "year-end-statutory", "board-pack", "management-reporting", "controls-governance"],
    australianRelevance:
      "Written for Australian listed entities. Deadlines and form items are cited to the ASX Listing Rules, AASB standards, and the Corporations Act.",
  },
  {
    slug: "board-pack-builder",
    name: "Board pack builder",
    summary:
      "Assemble the monthly or quarterly board and audit-committee finance pack from ledger, budget, and KPI exports, with variance commentary, cash headroom, and a one-page summary.",
    description:
      "A Finance AI Stack original skill. It builds the CFO report from uploaded spreadsheets and CSVs: result against budget and last year, cash and funding headroom, risks, decisions, and a cross-cast. It does not log into a ledger.",
    howFinanceTeamsUse: "Use it each month when the exports are out and the board pack is still a folder of files.",
    categories: ["board-packs", "variance-commentary", "reporting", "forecasting"],
    stages: ["board-pack", "management-reporting"],
    australianRelevance:
      "Written for Australian finance teams. The pack is tool-agnostic and uses the entity's own files.",
  },
  {
    slug: "debt-covenant-checker",
    name: "Debt covenant checker",
    summary:
      "Extract the covenants from the facility agreement you upload, map them to the ledger, test headroom now and on the forecast, and draft the compliance-certificate workings.",
    description:
      "A Finance AI Stack original skill. Ratios use the agreement's own definitions, including EBITDA adjustments the clause actually allows. The capital note covers dividends under Corporations Act section 254T and on-market buy-backs under the 10/12 limit in section 257B and Appendix 3C. It does not sign a certificate.",
    howFinanceTeamsUse:
      "Use it before a compliance certificate, a dividend, or a buy-back, with the agreement and the accounts in the same working paper.",
    categories: ["capital-management", "treasury-and-cash", "forecasting"],
    stages: ["capital-management", "treasury", "cash-forecasting"],
    australianRelevance:
      "The facility test follows the contract. The dividend and buy-back notes cite the Corporations Act and the ASX buy-back form.",
  },
  {
    slug: "au-payroll-stp-check",
    name: "Australian payroll and STP check",
    summary:
      "Reconcile payroll to the ledger and to Single Touch Payroll Phase 2, including super guarantee, PAYG to the BAS, and the year-end finalisation exceptions.",
    description:
      "A Finance AI Stack original skill for Australian employers. It ties Xero, MYOB, Employment Hero, KeyPay, and other exports to the general ledger and to STP, and it points at the ATO pages for the super rate, Payday Super, and finalisation. State payroll tax is a pointer to the revenue office, not a stored threshold.",
    howFinanceTeamsUse: "Use it at month end, at BAS time, and before STP finalisation.",
    categories: ["payroll"],
    stages: ["payroll"],
    australianRelevance:
      "Super, STP, PAYG, and payroll tax are Australian. Rates and due dates are taken from ato.gov.au and re-checked on the day the skill is run.",
  },
  {
    slug: "finance-risk-and-controls",
    name: "Finance risk and controls",
    summary:
      "Build a finance risk register and key controls matrix, then test segregation of duties, journals, and access from the exports you supply.",
    description:
      "A Finance AI Stack original skill. It produces the risk-control matrix, a segregation review, journal filters, a control self-assessment, and the audit-committee paper. It cites ASX Corporate Governance Principles Recommendation 7 and Corporations Act section 295A. A control is not marked effective unless it was tested.",
    howFinanceTeamsUse:
      "Use it when the audit committee wants the finance risks, the controls, and the tests in one paper.",
    categories: ["risk-and-controls", "audit-prep"],
    stages: ["risk", "controls-governance"],
    australianRelevance:
      "Recommendation 7 of the 4th edition and the section 295A CEO and CFO declaration are the Australian anchors.",
  },
];

export function originalSkill(slug: string) {
  return ORIGINAL_SKILLS.find((skill) => skill.slug === slug) ?? null;
}
