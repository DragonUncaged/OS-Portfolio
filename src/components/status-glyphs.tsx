"use client";

import { BatteryCharging, BatteryFull, BatteryHigh, BatteryLow, BatteryMedium, WifiHigh, WifiSlash } from "@phosphor-icons/react";
import { useBattery } from "@/hooks/use-battery";
import { useOnline } from "@/hooks/use-online";

export function BatteryGlyph({ size = 18, showPercent = false }: { size?: number; showPercent?: boolean }) {
  const battery = useBattery();
  if (!battery) return null;
  const Glyph = battery.charging
    ? BatteryCharging
    : battery.level > 0.8
      ? BatteryFull
      : battery.level > 0.5
        ? BatteryHigh
        : battery.level > 0.2
          ? BatteryMedium
          : BatteryLow;
  const pct = Math.round(battery.level * 100);
  return (
    <span className="inline-flex items-center gap-1" title={`Battery ${pct}%`} aria-label={`Battery ${pct} percent`}>
      {showPercent && <span className="text-[0.92em] tabular-nums">{pct}%</span>}
      <Glyph size={size} weight="fill" />
    </span>
  );
}

export function WifiGlyph({ size = 16 }: { size?: number }) {
  const online = useOnline();
  const Glyph = online ? WifiHigh : WifiSlash;
  return (
    <span className="inline-flex" title={online ? "Connected" : "Offline"} aria-label={online ? "Network connected" : "Network offline"}>
      <Glyph size={size} weight="bold" />
    </span>
  );
}
