import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = "Finance AI news";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard("Finance AI news");
}
