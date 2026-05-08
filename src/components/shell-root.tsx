"use client";

import type { CSSProperties, ReactNode } from "react";
import { useDark } from "@/hooks/use-dark";
import { useFamily } from "@/stores/session";
import { accentOf, useSettings } from "@/stores/settings";
import type { Platform } from "@/types";
import { MenuHost } from "./menu";
import { Wallpaper } from "./wallpaper";

function lighten(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix((n >> 16) & 255)} ${mix((n >> 8) & 255)} ${mix(n & 255)})`;
}

export function ShellRoot({ platform, children }: { platform: Platform; children: ReactNode }) {
  const family = useFamily();
  const dark = useDark();
  const chosen = accentOf(
    family,
    useSettings((s) => s.prefs[family].accent),
  );
  const accent = dark && platform === "windows" ? { hex: lighten(chosen.hex, 0.5), fg: "#0b0b0b" } : chosen;
  const brightness = useSettings((s) => s.brightness);
  const nightLight = useSettings((s) => s.nightLight);
  return (
    <div
      className="os-root fixed inset-0 overflow-hidden"
      data-os={platform}
      data-theme={dark ? "dark" : "light"}
      style={{ "--accent": accent.hex, "--accent-fg": accent.fg } as CSSProperties}
    >
      {children}
      <MenuHost />
      {nightLight && <div className="pointer-events-none fixed inset-0 z-[9000] bg-[#ff8a2a]/20 mix-blend-multiply" />}
      {brightness < 1 && (
        <div className="pointer-events-none fixed inset-0 z-[9001] bg-black" style={{ opacity: (1 - brightness) * 0.85 }} />
      )}
    </div>
  );
}

export function ShellWallpaper({ className }: { className?: string }) {
  const family = useFamily();
  const dark = useDark();
  const id = useSettings((s) => s.prefs[family].wallpaper);
  return <Wallpaper id={id} family={family} dark={dark} className={className} />;
}
