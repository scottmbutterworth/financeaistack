import { CATEGORIES } from "@/lib/categories";
import { listPublishedPaths } from "@/lib/queries";
import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const staticPaths = ["", "/workflows", "/skills", "/search", "/submit", "/sponsor", ...CATEGORIES.map((category) => `/category/${category.slug}`)];
  const entries = await listPublishedPaths();
  const dynamic = entries.map((entry) =>
    entry.kind === "workflow" ? `/workflows/${entry.slug}` : entry.kind === "skill" ? `/skills/${entry.slug}` : `/tools/${entry.slug}`,
  );
  return [...staticPaths, ...dynamic].map((path) => ({
    url: `${origin}${path || "/"}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
