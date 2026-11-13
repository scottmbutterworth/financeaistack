import { listSkills, searchEntries } from "@/lib/queries";
import type { DbState, Entry } from "@/lib/types";

export const STAGE_CATEGORIES: Record<string, string[]> = {
  ap: ["invoice-to-gl"],
  ar: ["accounts-receivable"],
  payroll: ["payroll"],
  "month-end-close": ["month-end-close"],
  "interim-reporting": ["reporting", "month-end-close"],
  "year-end-statutory": ["reporting", "audit-prep"],
  "management-reporting": ["reporting", "variance-commentary"],
  "board-pack": ["board-packs"],
  "working-capital": ["working-capital"],
  "cash-forecasting": ["forecasting", "treasury-and-cash"],
  treasury: ["treasury-and-cash"],
  "capital-management": ["capital-management"],
  risk: ["risk-and-controls", "audit-prep"],
  "controls-governance": ["risk-and-controls", "audit-prep"],
};

export async function entriesForStage(stage: string): Promise<DbState<Entry[]>> {
  const categories = STAGE_CATEGORIES[stage] ?? [];
  const [skills, ...toolLists] = await Promise.all([
    listSkills({ stage }),
    ...categories.map((category) => searchEntries({ kind: "tool", category, limit: 80 })),
  ]);
  if (!skills.ok || toolLists.some((list) => !list.ok)) return { ok: false, data: [] };
  const rows = new Map<string, Entry>();
  for (const list of toolLists) {
    for (const entry of list.data) rows.set(entry.slug, entry);
  }
  for (const entry of skills.data) rows.set(entry.slug, entry);
  return { ok: true, data: [...rows.values()].sort((a, b) => a.name.localeCompare(b.name)) };
}
