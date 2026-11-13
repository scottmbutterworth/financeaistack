export type EntryKind = "tool" | "workflow" | "skill";

export type WorkflowStep = {
  title: string;
  body: string;
};

export type Entry = {
  id: number;
  slug: string;
  kind: EntryKind;
  name: string;
  summary: string;
  description: string;
  description_source_url: string | null;
  website_url: string | null;
  pricing_summary: string | null;
  pricing_usd: string | null;
  pricing_aud: string | null;
  pricing_source_url: string | null;
  pricing_checked_on: string | null;
  how_finance_teams_use: string | null;
  categories: string[];
  steps: WorkflowStep[] | null;
  tool_slugs: string[];
  featured: boolean;
  published: boolean;
  item_type: string | null;
  item_type_detail: string | null;
  publisher: string | null;
  access_level: string | null;
  access_detail: string | null;
  au_fit: boolean | null;
  auth_note: string | null;
  security_notes: string | null;
  last_updated: string | null;
  stages: string[];
  australian_relevance: string | null;
  caveat: string | null;
  original: boolean;
};

export type SponsorWeek = {
  id: number;
  week_start: string;
  sponsor_name: string;
  sponsor_slug: string;
  tagline: string | null;
  destination_url: string;
  active: boolean;
};

export type DbState<T> = {
  ok: boolean;
  data: T;
};
