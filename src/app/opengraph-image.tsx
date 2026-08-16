import { ImageResponse } from "next/og";
import { profile, site } from "@/data/portfolio";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SYSTEMS = [
  { name: "macOS", phone: "iPhone", tint: "#b98cff" },
  { name: "Windows", phone: "Windows Phone", tint: "#5aa9ff" },
  { name: "Linux", phone: "Android", tint: "#ff8a5c" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          background:
            "radial-gradient(900px 500px at 12% 0%, rgba(120,90,255,0.45), transparent 70%), radial-gradient(800px 500px at 100% 100%, rgba(255,120,70,0.38), transparent 70%), #07080c",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
          {profile.name} / portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{profile.name}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 40, color: "rgba(255,255,255,0.8)" }}>
            {profile.role} · {profile.tagline}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            A portfolio you boot. Choose an operating system:
          </div>
          <div style={{ display: "flex" }}>
            {SYSTEMS.map((s) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: 20,
                  padding: "18px 30px",
                  borderRadius: 22,
                  border: `2px solid ${s.tint}`,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: s.tint }}>{s.name}</div>
                <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.65)" }}>becomes {s.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
