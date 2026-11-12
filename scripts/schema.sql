CREATE TABLE IF NOT EXISTS entries (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('tool', 'workflow')),
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  description_source_url TEXT,
  website_url TEXT,
  pricing_summary TEXT,
  pricing_usd TEXT,
  pricing_aud TEXT,
  pricing_source_url TEXT,
  pricing_checked_on DATE,
  how_finance_teams_use TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  steps JSONB,
  tool_slugs TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('tool', 'workflow')),
  name TEXT NOT NULL,
  website_url TEXT,
  summary TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  submitter_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  entry_slug TEXT
);

CREATE TABLE IF NOT EXISTS signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resend_contact_id TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed',
  ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS zero_result_searches (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pageviews (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsor_weeks (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  sponsor_name TEXT NOT NULL,
  sponsor_slug TEXT NOT NULL,
  tagline TEXT,
  destination_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsor_clicks (
  id BIGSERIAL PRIMARY KEY,
  sponsor_slug TEXT NOT NULL,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  offer TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS errors (
  id BIGSERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  path TEXT,
  digest TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entries ADD COLUMN IF NOT EXISTS description_source_url TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS pricing_usd TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS pricing_aud TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS tool_slugs TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS entry_slug TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS resend_contact_id TEXT;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE sponsor_inquiries ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE errors ADD COLUMN IF NOT EXISTS digest TEXT;

CREATE INDEX IF NOT EXISTS entries_kind_idx ON entries (kind);
CREATE INDEX IF NOT EXISTS entries_published_idx ON entries (published);
CREATE INDEX IF NOT EXISTS entries_categories_idx ON entries USING GIN (categories);
CREATE INDEX IF NOT EXISTS pageviews_created_at_idx ON pageviews (created_at);
CREATE INDEX IF NOT EXISTS pageviews_path_idx ON pageviews (path);
CREATE INDEX IF NOT EXISTS sponsor_clicks_slug_idx ON sponsor_clicks (sponsor_slug);
CREATE INDEX IF NOT EXISTS zero_result_searches_created_idx ON zero_result_searches (created_at);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status, created_at);
