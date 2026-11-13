import { getCategory } from "@/lib/categories";
import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = "Finance AI Stack category";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogCard(getCategory(slug)?.name ?? "Category");
}
