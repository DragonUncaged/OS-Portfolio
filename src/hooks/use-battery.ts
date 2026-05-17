"use client";

import { useSyncExternalStore } from "react";

export interface Battery {
  level: number;
  charging: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

let battery: Battery | null = null;

let batteryAsked = false;

const batterySubs = new Set<() => void>();

function subscribeBattery(cb: () => void) {
  batterySubs.add(cb);
  if (!batteryAsked) {
    batteryAsked = true;
    // Chromium only
    const getBattery = (navigator as unknown as { getBattery?: () => Promise<BatteryManager> }).getBattery;
    getBattery
      ?.call(navigator)
      .then((m) => {
        const read = () => {
          battery = { level: m.level, charging: m.charging };
          batterySubs.forEach((f) => f());
        };
        m.addEventListener("levelchange", read);
        m.addEventListener("chargingchange", read);
        read();
      })
      .catch(() => {});
  }
  return () => {
    batterySubs.delete(cb);
  };
}

export function useBattery(): Battery | null {
  return useSyncExternalStore(
    subscribeBattery,
    () => battery,
    () => null,
  );
}
