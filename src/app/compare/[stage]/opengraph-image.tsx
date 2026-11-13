import { ogCard, ogContentType, ogSize } from "@/lib/og";
import { stageName } from "@/lib/skills";

export const alt = "Finance AI Stack comparison";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  return ogCard(stageName(stage));
}
