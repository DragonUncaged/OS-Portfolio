import type { Family } from "@/types";

export interface WallpaperMeta {
  id: string;
  name: string;
}

export const WALLPAPERS: Record<Family, WallpaperMeta[]> = {
  macos: [
    { id: "gilt", name: "Gilt" },
    { id: "dunes", name: "Dunes" },
    { id: "aurora", name: "Aurora" },
    { id: "ridge", name: "Ridge" },
    { id: "graphite", name: "Graphite" },
  ],
  windows: [
    { id: "ribbons", name: "Ribbons" },
    { id: "glow", name: "Glow" },
    { id: "flow", name: "Flow" },
    { id: "midnight", name: "Midnight" },
  ],
  linux: [
    { id: "orbit", name: "Orbit" },
    { id: "peaks", name: "Peaks" },
    { id: "ember", name: "Ember" },
    { id: "grid", name: "Grid" },
  ],
};
