export const SITE_NAME = "Finance AI Stack";

export const SITE_DESCRIPTION =
  "A curated directory of AI tools and proven workflows for CFOs and finance teams, with a weekly newsletter.";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://financeaistack.com";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
