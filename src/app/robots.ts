import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

const CITED = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  const allowSite = { allow: "/", disallow: ["/api/", "/go/"] };
  return {
    rules: [{ userAgent: "*", ...allowSite }, ...CITED.map((userAgent) => ({ userAgent, ...allowSite }))],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
