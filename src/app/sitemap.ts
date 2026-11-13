import { CATEGORIES } from "@/lib/categories";
import { listNews } from "@/lib/news";
import { listPublishedPaths } from "@/lib/queries";
import { STAGES } from "@/lib/skills";
import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const entries = await listPublishedPaths();
  const news = await listNews({ status: "published", limit: 1 });
  const newsLast = news.data[0]?.published_at;
  const staticPaths = [
    "",
    "/news",
    "/workflows",
    "/skills",
    "/skills/originals",
    "/about",
    "/search",
    "/submit",
    "/sponsor",
    ...CATEGORIES.map((category) => `/category/${category.slug}`),
    ...STAGES.map((stage) => `/compare/${stage.slug}`),
  ];
  const dynamic = entries.map((entry) => ({
    path: entry.kind === "workflow" ? `/workflows/${entry.slug}` : entry.kind === "skill" ? `/skills/${entry.slug}` : `/tools/${entry.slug}`,
    lastModified: toDate(entry.updated_at),
  }));
  return [
    ...staticPaths.map((path) => ({
      url: `${origin}${path || "/"}`,
      lastModified: path === "/news" ? toDate(newsLast) : undefined,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...dynamic.map((entry) => ({
      url: `${origin}${entry.path}`,
      lastModified: entry.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

function toDate(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
