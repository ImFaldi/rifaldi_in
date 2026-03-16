import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const runtime = "edge";

export const alt = "Rifaldi - Full Stack and Mobile Developer";
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
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 12% 18%, rgba(251,191,36,0.2), transparent 35%), radial-gradient(circle at 86% 14%, rgba(34,211,238,0.24), transparent 36%), radial-gradient(circle at 64% 84%, rgba(99,102,241,0.26), transparent 40%), linear-gradient(140deg, #040711 0%, #0A1020 46%, #121F39 100%)",
          color: "#E5E7EB",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(4,7,17,0.12) 0%, rgba(4,7,17,0.75) 52%, rgba(4,7,17,0.95) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -130,
            top: -120,
            height: 420,
            width: 420,
            borderRadius: 999,
            background:
              "conic-gradient(from 180deg, rgba(56,189,248,0.45), rgba(251,191,36,0.4), rgba(99,102,241,0.46), rgba(56,189,248,0.45))",
            filter: "blur(54px)",
            opacity: 0.75,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -160,
            bottom: -170,
            height: 420,
            width: 420,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(251,191,36,0.42) 0%, rgba(245,158,11,0.14) 45%, transparent 70%)",
            filter: "blur(36px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 30,
            borderRadius: 28,
            border: "1px solid rgba(148,163,184,0.24)",
            background: "rgba(8,13,27,0.55)",
            boxShadow: "0 24px 80px rgba(2,6,23,0.62)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 44px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 999,
                border: "1px solid rgba(56,189,248,0.4)",
                background: "rgba(2,132,199,0.16)",
                fontSize: 18,
                color: "#7DD3FC",
                letterSpacing: 0.4,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#7DD3FC",
                }}
              />
              {SITE_NAME}
            </div>

            <div
              style={{
                fontSize: 16,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.26)",
                color: "#CBD5E1",
                background: "rgba(15,23,42,0.55)",
              }}
            >
              rifaldiin.vercel.app
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 860 }}>
            <div
              style={{
                fontSize: 76,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: -2.8,
                color: "#F8FAFC",
              }}
            >
              Build once.
              <br />
              Scale with confidence.
            </div>
            <div style={{ fontSize: 30, color: "#CBD5E1", lineHeight: 1.3, maxWidth: 820 }}>
              Full Stack and Mobile Developer crafting high-performance products with Laravel,
              Next.js, Flutter, and AI agents.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {["Next.js", "Laravel", "Flutter", "AI Agents", "TypeScript"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: 999,
                    padding: "8px 13px",
                    color: index % 2 === 0 ? "#E2E8F0" : "#FDE68A",
                    background: "rgba(15,23,42,0.48)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                color: "#94A3B8",
              }}
            >
              <div style={{ fontSize: 14, letterSpacing: 0.5 }}>RIFALDI PORTFOLIO</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.4 }}>
                Premium Digital Engineer
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
