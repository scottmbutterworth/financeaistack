export const SKILL_TYPES = [
  { slug: "skill", name: "Skill" },
  { slug: "plugin", name: "Plugin" },
  { slug: "mcp", name: "MCP connector" },
  { slug: "app", name: "App" },
] as const;

export type SkillTypeSlug = (typeof SKILL_TYPES)[number]["slug"];

export function skillTypeName(slug: string | null | undefined) {
  return SKILL_TYPES.find((type) => type.slug === slug)?.name ?? null;
}

export const STAGES = [
  { slug: "ap", name: "Accounts payable and spend" },
  { slug: "ar", name: "Accounts receivable" },
  { slug: "payroll", name: "Payroll" },
  { slug: "month-end-close", name: "Month-end close" },
  { slug: "interim-reporting", name: "Interim reporting" },
  { slug: "year-end-statutory", name: "Full-year reporting" },
  { slug: "management-reporting", name: "Management reporting" },
  { slug: "board-pack", name: "Board pack" },
  { slug: "working-capital", name: "Working capital" },
  { slug: "cash-forecasting", name: "Cash forecasting" },
  { slug: "treasury", name: "Treasury" },
  { slug: "capital-management", name: "Capital management" },
  { slug: "risk", name: "Risk" },
  { slug: "controls-governance", name: "Controls and governance" },
] as const;

export function stageName(slug: string) {
  return STAGES.find((stage) => stage.slug === slug)?.name ?? slug;
}

export function accessLabel(level: string | null, detail: string | null) {
  if (level === "read-only") return "Read-only";
  if (level === "read-write") return "Read-write";
  if (level === "read-only or read-write") return "Read-only or read-write";
  return detail;
}

export const VETTING = {
  checkedOn: "13 Nov 2026",
  quality: [
    "Identifiable publisher",
    "Actively maintained (within 12 months)",
    "Documented",
    "Real finance work",
  ],
  security: [
    "Official or verifiable source",
    "Data handling terms, or you can host it yourself",
    "Least-privilege auth",
    "No known advisories",
    "Open code or a certified vendor",
    "No broad credential requests",
  ],
};
