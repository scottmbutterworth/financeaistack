import { NewsletterEmail, type NewsletterProps } from "../../emails/newsletter";
import { CATALOG } from "@/lib/catalog";
import { getCurrentSponsor, searchEntries } from "@/lib/queries";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { Resend } from "resend";

const FALLBACK_STORY = {
  title: "How a finance team drafted variance commentary from a trial balance",
  body: "They exported the month's trial balance and left it unchanged. An assistant drafted only the accounts that moved past a threshold they set, quoting both numbers. A preparer tied every figure to the export, and a manager wrote the reason in their own words before it went near the board pack.",
  path: "/workflows/variance-commentary-from-a-trial-balance",
};

export async function buildNewsletterProps(): Promise<NewsletterProps> {
  const featured = await searchEntries({ kind: "tool", featured: true, limit: 5 });
  const source =
    featured.ok && featured.data.length >= 5
      ? featured.data
      : CATALOG.filter((entry) => entry.kind === "tool").slice(0, 5);

  const picks = source.slice(0, 5).map((entry) => ({
    name: entry.name,
    line: entry.summary,
    href: absoluteUrl(`/tools/${entry.slug}`),
  }));

  const sponsor = await getCurrentSponsor();
  const sponsorName =
    sponsor.ok && sponsor.data ? sponsor.data.sponsor_name : "this spot is open";
  const sponsorHref =
    sponsor.ok && sponsor.data
      ? absoluteUrl(`/go/${sponsor.data.sponsor_slug}`)
      : absoluteUrl("/sponsor");

  return {
    preview: "Five finance tools, one close story, and this week's sponsor.",
    picks,
    storyTitle: FALLBACK_STORY.title,
    storyBody: FALLBACK_STORY.body,
    storyHref: absoluteUrl(FALLBACK_STORY.path),
    sponsorName,
    sponsorHref,
    siteUrl: siteUrl(),
  };
}

export function fromAddress() {
  const raw = process.env.FROM_EMAIL?.trim();
  if (!raw) return null;
  if (raw.includes("<")) return raw;
  return `Finance AI Stack <${raw}>`;
}

export async function createDraftBroadcast() {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_AUDIENCE_ID;
  const from = fromAddress();
  if (!apiKey || !segmentId || !from) {
    return {
      ok: false as const,
      error: "RESEND_API_KEY, RESEND_AUDIENCE_ID, and FROM_EMAIL are required to create a draft.",
    };
  }

  const { render } = await import("@react-email/render");
  const props = await buildNewsletterProps();
  const html = await render(NewsletterEmail(props));
  const resend = new Resend(apiKey);
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await resend.broadcasts.create({
    name: `Finance AI Stack ${today}`,
    from,
    subject: "Five finance tools, and one way a team used them",
    html,
    previewText: props.preview,
    segmentId,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, id: data?.id ?? null, sent: false };
}
