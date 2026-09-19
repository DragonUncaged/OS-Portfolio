"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Family, Theme } from "@/types";

export interface Accent {
  id: string;
  name: string;
  hex: string;
  fg: string;
}

export const ACCENTS: Record<Family, Accent[]> = {
  macos: [
    { id: "blue", name: "Blue", hex: "#0a7aff", fg: "#fff" },
    { id: "purple", name: "Purple", hex: "#a550a7", fg: "#fff" },
    { id: "pink", name: "Pink", hex: "#f74f9e", fg: "#fff" },
    { id: "red", name: "Red", hex: "#ff5257", fg: "#fff" },
    { id: "orange", name: "Orange", hex: "#f7821b", fg: "#fff" },
    { id: "yellow", name: "Yellow", hex: "#f5b800", fg: "#1d1d1f" },
    { id: "green", name: "Green", hex: "#4fae3b", fg: "#fff" },
    { id: "graphite", name: "Graphite", hex: "#8c8c8c", fg: "#fff" },
  ],
  windows: [
    { id: "blue", name: "Blue", hex: "#0067c0", fg: "#fff" },
    { id: "cobalt", name: "Cobalt", hex: "#3a6ff7", fg: "#fff" },
    { id: "violet", name: "Violet", hex: "#8764b8", fg: "#fff" },
    { id: "magenta", name: "Magenta", hex: "#c30052", fg: "#fff" },
    { id: "red", name: "Red", hex: "#d13438", fg: "#fff" },
    { id: "orange", name: "Orange", hex: "#da5a00", fg: "#fff" },
    { id: "green", name: "Green", hex: "#107c10", fg: "#fff" },
    { id: "teal", name: "Teal", hex: "#038387", fg: "#fff" },
  ],
  linux: [
    { id: "orange", name: "Orange", hex: "#e95420", fg: "#fff" },
    { id: "bark", name: "Bark", hex: "#787859", fg: "#fff" },
    { id: "sage", name: "Sage", hex: "#657b69", fg: "#fff" },
    { id: "olive", name: "Olive", hex: "#4b8501", fg: "#fff" },
    { id: "viridian", name: "Viridian", hex: "#03875b", fg: "#fff" },
    { id: "blue", name: "Blue", hex: "#0073e5", fg: "#fff" },
    { id: "purple", name: "Purple", hex: "#7764d8", fg: "#fff" },
    { id: "magenta", name: "Magenta", hex: "#b34cb3", fg: "#fff" },
  ],
};

interface FamilyPrefs {
  wallpaper: string;
  accent: string;
}

interface SettingsState {
  lastFamily: Family | null;
  theme: Theme;
  prefs: Record<Family, FamilyPrefs>;
  brightness: number;
  volume: number;
  nightLight: boolean;
  glass: number;
  welcomed: Family[];
  setLastFamily: (f: Family | null) => void;
  setTheme: (t: Theme) => void;
  setWallpaper: (f: Family, id: string) => void;
  setAccent: (f: Family, id: string) => void;
  setBrightness: (v: number) => void;
  setVolume: (v: number) => void;
  setNightLight: (v: boolean) => void;
  setGlass: (v: number) => void;
  markWelcomed: (f: Family) => void;
}

export const DEFAULT_PREFS: Record<Family, FamilyPrefs> = {
  macos: { wallpaper: "dunes", accent: "blue" },
  windows: { wallpaper: "ribbons", accent: "blue" },
  linux: { wallpaper: "orbit", accent: "orange" },
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lastFamily: null,
      theme: "auto",
      prefs: DEFAULT_PREFS,
      brightness: 1,
      volume: 0.6,
      nightLight: false,
      glass: 0.5,
      welcomed: [],
      setLastFamily: (lastFamily) => set({ lastFamily }),
      setTheme: (theme) => set({ theme }),
      setWallpaper: (f, wallpaper) =>
        set((s) => ({ prefs: { ...s.prefs, [f]: { ...s.prefs[f], wallpaper } } })),
      setAccent: (f, accent) =>
        set((s) => ({ prefs: { ...s.prefs, [f]: { ...s.prefs[f], accent } } })),
      setBrightness: (v) => set({ brightness: Math.min(1, Math.max(0.35, v)) }),
      setVolume: (v) => set({ volume: Math.min(1, Math.max(0, v)) }),
      setNightLight: (nightLight) => set({ nightLight }),
      setGlass: (v) => set({ glass: Math.min(1, Math.max(0, v)) }),
      markWelcomed: (f) =>
        set((s) => (s.welcomed.includes(f) ? s : { welcomed: [...s.welcomed, f] })),
    }),
    {
      name: "os-portfolio:settings",
      version: 1,
      // deep merge, so a pref added in a later version still gets its default
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          prefs: {
            macos: { ...current.prefs.macos, ...p.prefs?.macos },
            windows: { ...current.prefs.windows, ...p.prefs?.windows },
            linux: { ...current.prefs.linux, ...p.prefs?.linux },
          },
        };
      },
    },
  ),
);

export function accentOf(family: Family, id: string): Accent {
  return ACCENTS[family].find((a) => a.id === id) ?? ACCENTS[family][0];
}
