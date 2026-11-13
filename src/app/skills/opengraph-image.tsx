import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = "Skills and plugins";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard("Skills and connectors");
}
