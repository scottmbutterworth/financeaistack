import { ogCard, ogContentType, ogSize } from "@/lib/og";
import { getEntry } from "@/lib/queries";

export const alt = "Finance AI Stack skill";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getEntry(slug).catch(() => null);
  return ogCard(entry?.data?.name || "Skill");
}
