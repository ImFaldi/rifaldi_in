import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";

export const alt = "Rifaldi - Full Stack & Mobile Developer";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 12%, rgba(29,78,216,0.35), transparent 38%), radial-gradient(circle at 84% 28%, rgba(34,211,238,0.28), transparent 36%), linear-gradient(135deg, #070b1a 0%, #0b1630 45%, #10233e 100%)",
          color: "#E2E8F0",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 36,
            borderRadius: 24,
            border: "1px solid rgba(148,163,184,0.28)",
            background: "rgba(15,23,42,0.45)",
            boxShadow: "0 18px 60px rgba(2,6,23,0.45)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 46px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1.1 }}>
              rifaldi
              <span style={{ color: "#60A5FA" }}>.</span>
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#93C5FD",
                padding: "8px 14px",
                border: "1px solid rgba(147,197,253,0.38)",
                borderRadius: 999,
              }}
            >
              {SITE_NAME}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 860 }}>
            <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2.2 }}>
              Full Stack and Mobile Developer
            </div>
            <div style={{ fontSize: 28, color: "#CBD5E1", lineHeight: 1.28 }}>
              Laravel, Next.js, Flutter, and AI Agents to build fast and impactful digital products.
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              "Next.js",
              "Laravel",
              "Flutter",
              "TypeScript",
              "AI Agents",
            ].map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 20,
                  color: "#E2E8F0",
                  border: "1px solid rgba(148,163,184,0.32)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  background: "rgba(15,23,42,0.42)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
