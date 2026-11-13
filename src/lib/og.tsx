import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function ogCard(title: string, kicker = "Finance AI Stack") {
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
          {kicker}
        </div>
        <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05, maxWidth: 980 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#5e584e" }}>financeaistack.com</div>
      </div>
    ),
    ogSize,
  );
}
