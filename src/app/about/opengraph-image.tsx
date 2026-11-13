import { ogCard, ogContentType, ogSize } from "@/lib/og";

export const alt = "About Finance AI Stack";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogCard("About and methodology");
}
