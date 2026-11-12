import { ImageResponse } from "next/og";

export const alt = "Finance AI Stack — AI tools and workflows for CFOs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3efe6",
          color: "#1c1915",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#1b4332", textTransform: "uppercase" }}>
          Finance AI Stack
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 68, lineHeight: 1.05, maxWidth: 900 }}>
          AI tools and workflows for CFOs
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#5e584e" }}>financeaistack.com</div>
      </div>
    ),
    size,
  );
}
