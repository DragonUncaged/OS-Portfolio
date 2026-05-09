"use client";

import { useId } from "react";
import { APPS, DARK_GLYPH } from "@/apps/registry";
import { usePlatform } from "@/stores/session";
import type { AppId, Platform } from "@/types";

const WIN_TINT: Partial<Record<AppId, [string, string]>> = {
  resume: ["#ff8a80", "#d6453d"],
  viewer: ["#8ab4ff", "#3b6fd6"],
  terminal: ["#aab4c3", "#5b6677"],
  calculator: ["#8fd3ff", "#3b82f6"],
  clock: ["#c4b5fd", "#7c5cff"],
  monitor: ["#7ee0b0", "#12a56a"],
  settings: ["#c3cad6", "#7b8696"],
};

export function AppIcon({
  id,
  size = 48,
  platform: forced,
  className,
}: {
  id: AppId;
  size?: number;
  platform?: Platform;
  className?: string;
}) {
  const current = usePlatform();
  const platform = forced ?? current;
  const gradId = useId();
  const app = APPS[id];
  const Glyph = app.glyphs?.[platform] ?? app.glyph;
  const [c0, c1] = app.color;
  const glyphColor = DARK_GLYPH[id] ?? "#fff";
  const base = { width: size, height: size, flex: "none" } as const;

  if (platform === "windows") {
    const [t0, t1] = WIN_TINT[id] ?? [c0, c1];
    return (
      <span className={`inline-grid place-items-center ${className ?? ""}`} style={base} aria-hidden="true">
        <Glyph
          size={size * 0.92}
          weight="fill"
          fill={`url(#${gradId})`}
          style={{ filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.22))" }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor={t0} />
              <stop offset="1" stopColor={t1} />
            </linearGradient>
          </defs>
        </Glyph>
      </span>
    );
  }

  if (platform === "wp") {
    return (
      <span
        className={`inline-grid place-items-center ${className ?? ""}`}
        style={{ ...base, background: "var(--accent)", color: "var(--accent-fg)" }}
        aria-hidden="true"
      >
        <Glyph size={size * 0.56} weight="regular" />
      </span>
    );
  }

  if (platform === "android") {
    return (
      <span
        className={`inline-grid place-items-center ${className ?? ""}`}
        style={{
          ...base,
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--accent) 24%, var(--icon-plate, #fff))",
          color: "color-mix(in srgb, var(--accent) 72%, var(--icon-ink, #111))",
        }}
        aria-hidden="true"
      >
        <Glyph size={size * 0.52} weight="fill" />
      </span>
    );
  }

  if (platform === "ubuntu") {
    return (
      <span
        className={`inline-grid place-items-center ${className ?? ""}`}
        style={{
          ...base,
          borderRadius: size * 0.2,
          background: `linear-gradient(180deg, ${c0} -40%, ${c1} 75%)`,
          boxShadow: `inset 0 -${Math.max(2, size * 0.07)}px 0 rgb(0 0 0 / 0.22), inset 0 1px 0 rgb(255 255 255 / 0.28), 0 1px 2px rgb(0 0 0 / 0.3)`,
          color: glyphColor,
          paddingBottom: size * 0.05,
        }}
        aria-hidden="true"
      >
        <Glyph size={size * 0.54} weight="fill" />
      </span>
    );
  }

  return (
    <span
      className={`inline-grid place-items-center ${className ?? ""}`}
      style={{
        ...base,
        borderRadius: size * 0.225,
        background: `linear-gradient(180deg, ${c0}, ${c1})`,
        boxShadow:
          "inset 0 0 0 0.5px rgb(255 255 255 / 0.22), inset 0 1px 0.5px rgb(255 255 255 / 0.45), 0 1px 2px rgb(0 0 0 / 0.28)",
        color: glyphColor,
      }}
      aria-hidden="true"
    >
      <Glyph size={size * 0.58} weight="fill" style={{ filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.18))" }} />
    </span>
  );
}
