import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";

export const alt = "Rifaldi - Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
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
            "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.34), transparent 36%), linear-gradient(135deg, #0a0f1e 0%, #0f1b34 52%, #12334b 100%)",
          color: "#E2E8F0",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div
          style={{
            margin: 36,
            borderRadius: 24,
            border: "1px solid rgba(148,163,184,0.28)",
            background: "rgba(15,23,42,0.5)",
            boxShadow: "0 16px 50px rgba(2,6,23,0.45)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "42px 44px",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            {SITE_NAME}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 840 }}>
            <div style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 900, letterSpacing: -2 }}>
              Building digital products that move faster
            </div>
            <div style={{ fontSize: 28, color: "#CBD5E1", lineHeight: 1.28 }}>
              Portfolio of Rifaldi - Full Stack and Mobile Developer.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {["Next.js", "Laravel", "Flutter", "AI"].map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 18,
                  border: "1px solid rgba(148,163,184,0.32)",
                  borderRadius: 999,
                  padding: "7px 13px",
                  background: "rgba(15,23,42,0.4)",
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
