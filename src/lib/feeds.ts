export type FeedSource = {
  source: string;
  url: string;
  region?: "AU";
};

// Each URL returned RSS or Atom XML when fetched on 13 Nov 2026.
// Dropped after that check: Anthropic (no public feed), Brex, Numeric, Workiva,
// Accounting Today (HTML, not a feed), and CFO.com (404).
export const FEEDS: FeedSource[] = [
  { source: "OpenAI News", url: "https://openai.com/news/rss.xml" },
  { source: "Microsoft Copilot blog", url: "https://www.microsoft.com/en-us/copilot/blog/feed/" },
  { source: "Xero Blog", url: "https://blog.xero.com/feed/" },
  { source: "Google Workspace updates", url: "https://workspaceupdates.googleblog.com/feeds/posts/default" },
  { source: "Google AI blog", url: "https://blog.google/technology/ai/rss/" },
  { source: "Datarails", url: "https://www.datarails.com/feed/" },
  { source: "Stripe Blog", url: "https://stripe.com/blog/feed.rss" },
  { source: "Ramp Builders", url: "https://engineering.ramp.com/rss.xml" },
  { source: "CFO Dive", url: "https://www.cfodive.com/feeds/news/" },
  { source: "Journal of Accountancy", url: "https://www.journalofaccountancy.com/feed/" },
  { source: "CPA Practice Advisor", url: "https://www.cpapracticeadvisor.com/feed/" },
  { source: "Finextra", url: "https://www.finextra.com/rss/headlines.aspx" },
  { source: "PYMNTS", url: "https://www.pymnts.com/feed/" },
  { source: "iTnews Finance", url: "https://www.itnews.com.au/RSS/rss.ashx?type=Category&ID=1412", region: "AU" },
  { source: "iTnews Financial Services", url: "https://www.itnews.com.au/RSS/rss.ashx?type=Category&ID=409", region: "AU" },
  { source: "Accountants Daily Technology", url: "https://www.accountantsdaily.com.au/technology?format=feed&type=rss", region: "AU" },
  { source: "Accountants Daily News", url: "https://www.accountantsdaily.com.au/news?format=feed&type=rss", region: "AU" },
  { source: "CFO Magazine A/NZ", url: "https://cfomagazine.com.au/feed/", region: "AU" },
  { source: "The Conversation Business", url: "https://theconversation.com/au/business/articles.atom", region: "AU" },
];

export function isAustralianSource(source: string) {
  return FEEDS.some((feed) => feed.source === source && feed.region === "AU");
}

export const AU_SOURCES = FEEDS.filter((feed) => feed.region === "AU").map((feed) => feed.source);
