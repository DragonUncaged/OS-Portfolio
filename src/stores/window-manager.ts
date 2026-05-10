"use client";

import { create } from "zustand";
import { APPS } from "@/apps/registry";
import type { AppArgs, AppId, Rect } from "@/types";

export type WinMode = "normal" | "max" | "left" | "right";

export interface Win {
  id: string;
  appId: AppId;
  args: AppArgs;
  rect: Rect;
  z: number;
  mode: WinMode;
  minimized: boolean;
  minTo: { x: number; y: number } | null;
}

interface WMState {
  wins: Win[];
  focus: string | null;
  area: Rect;
  overview: boolean;
  snapHint: WinMode | null;
  open: (appId: AppId, args?: AppArgs, fresh?: boolean) => string;
  close: (id: string) => void;
  closeAll: () => void;
  focusWin: (id: string) => void;
  minimize: (id: string) => void;
  toggleMax: (id: string) => void;
  setMode: (id: string, mode: WinMode) => void;
  setRect: (id: string, rect: Rect) => void;
  setArea: (area: Rect) => void;
  setOverview: (v: boolean) => void;
  setSnapHint: (m: WinMode | null) => void;
  cycle: () => void;
  showDesktop: () => void;
}

let seq = 0;
let nonce = 0;
let zTop = 10;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

export function fitRect(r: Rect, area: Rect, min: [number, number] = [320, 240]): Rect {
  const w = clamp(r.w, Math.min(min[0], area.w), area.w);
  const h = clamp(r.h, Math.min(min[1], area.h), area.h);
  return {
    w,
    h,
    x: clamp(r.x, area.x - w + 96, area.x + area.w - 96),
    y: clamp(r.y, area.y, area.y + area.h - 44),
  };
}

export function frameOf(win: Win, area: Rect): Rect {
  if (win.mode === "max") return area;
  const half = Math.round(area.w / 2);
  if (win.mode === "left") return { x: area.x, y: area.y, w: half, h: area.h };
  if (win.mode === "right") return { x: area.x + half, y: area.y, w: area.w - half, h: area.h };
  return win.rect;
}

function dockPoint(appId: AppId, area: Rect): { x: number; y: number } {
  const el = document.querySelector<HTMLElement>(`[data-dock="${appId}"]`);
  if (el) {
    const b = el.getBoundingClientRect();
    if (b.width > 0) return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }
  return { x: area.x + area.w / 2, y: area.y + area.h };
}

const topVisible = (wins: Win[], except?: string) =>
  wins
    .filter((w) => !w.minimized && w.id !== except)
    .sort((a, b) => b.z - a.z)[0]?.id ?? null;

export const useWM = create<WMState>()((set, get) => ({
  wins: [],
  focus: null,
  area: { x: 0, y: 0, w: 1280, h: 720 },
  overview: false,
  snapHint: null,

  open: (appId, args = {}, fresh = false) => {
    const { wins, area } = get();
    const existing = fresh ? undefined : wins.find((w) => w.appId === appId);
    const z = ++zTop;
    if (existing) {
      set({
        wins: wins.map((w) =>
          w.id === existing.id
            ? { ...w, z, minimized: false, args: { ...args, nonce: ++nonce } }
            : w,
        ),
        focus: existing.id,
        overview: false,
      });
      return existing.id;
    }
    const def = APPS[appId];
    const w = Math.min(def.size[0], area.w - 24);
    const h = Math.min(def.size[1], area.h - 24);
    const n = wins.length % 6;
    const rect = fitRect(
      {
        w,
        h,
        x: area.x + (area.w - w) / 2 + (n - 2) * 26,
        y: area.y + (area.h - h) / 2 + (n - 2) * 22,
      },
      area,
      def.min,
    );
    const id = `${appId}-${++seq}`;
    // too small to float a window
    const mode: WinMode = area.w < 720 || area.h < 480 ? "max" : "normal";
    set({
      wins: [
        ...wins,
        { id, appId, args: { ...args, nonce: ++nonce }, rect, z, mode, minimized: false, minTo: null },
      ],
      focus: id,
      overview: false,
    });
    return id;
  },

  close: (id) =>
    set((s) => {
      const wins = s.wins.filter((w) => w.id !== id);
      return { wins, focus: s.focus === id ? topVisible(wins) : s.focus };
    }),

  closeAll: () => set({ wins: [], focus: null, overview: false }),

  focusWin: (id) =>
    set((s) => {
      const win = s.wins.find((w) => w.id === id);
      if (!win) return s;
      if (s.focus === id && !win.minimized && !s.overview) return s;
      const z = ++zTop;
      return {
        wins: s.wins.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)),
        focus: id,
        overview: false,
      };
    }),

  minimize: (id) =>
    set((s) => {
      const win = s.wins.find((w) => w.id === id);
      if (!win) return s;
      const minTo = dockPoint(win.appId, s.area);
      const wins = s.wins.map((w) => (w.id === id ? { ...w, minimized: true, minTo } : w));
      return { wins, focus: topVisible(wins) };
    }),

  toggleMax: (id) =>
    set((s) => ({
      wins: s.wins.map((w) =>
        w.id === id ? { ...w, mode: w.mode === "normal" ? "max" : "normal" } : w,
      ),
    })),

  setMode: (id, mode) =>
    set((s) => ({ wins: s.wins.map((w) => (w.id === id ? { ...w, mode } : w)) })),

  setRect: (id, rect) =>
    set((s) => ({
      wins: s.wins.map((w) =>
        w.id === id ? { ...w, rect: fitRect(rect, s.area, APPS[w.appId].min) } : w,
      ),
    })),

  setArea: (area) =>
    set((s) => {
      const a = s.area;
      if (a.x === area.x && a.y === area.y && a.w === area.w && a.h === area.h) return s;
      return {
        area,
        wins: s.wins.map((w) => ({ ...w, rect: fitRect(w.rect, area, APPS[w.appId].min) })),
      };
    }),

  setOverview: (overview) => set({ overview }),
  setSnapHint: (snapHint) => set((s) => (s.snapHint === snapHint ? s : { snapHint })),

  cycle: () => {
    const { wins, focus } = get();
    const order = wins.filter((w) => !w.minimized).sort((a, b) => a.z - b.z);
    if (order.length < 2) return;
    const next = order.find((w) => w.id !== focus) ?? order[0];
    get().focusWin(next.id);
  },

  showDesktop: () =>
    set((s) => {
      const anyVisible = s.wins.some((w) => !w.minimized);
      if (!anyVisible) {
        const wins = s.wins.map((w) => ({ ...w, minimized: false }));
        return { wins, focus: topVisible(wins) };
      }
      return {
        wins: s.wins.map((w) =>
          w.minimized ? w : { ...w, minimized: true, minTo: dockPoint(w.appId, s.area) },
        ),
        focus: null,
      };
    }),
}));

export function useActiveApp(): AppId | null {
  return useWM((s) => s.wins.find((w) => w.id === s.focus)?.appId ?? null);
}
