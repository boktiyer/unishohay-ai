import { ImageResponse } from "next/og";

export const alt = "UnishohayAI - PCIU Admission Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "white",
          background: "linear-gradient(135deg, #6D28D9, #2563EB)",
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.85 }}>Port City International University</div>
        <div style={{ fontSize: 96, fontWeight: 800, marginTop: 12 }}>UnishohayAI</div>
        <div style={{ fontSize: 40, marginTop: 16, opacity: 0.92 }}>
          AI admission assistant · Bangla &amp; English · 24/7
        </div>
      </div>
    ),
    size
  );
}
