"use client";

import { create } from "zustand";
import type { AppArgs, AppId } from "@/types";

export interface PhoneApp {
  id: AppId;
  args: AppArgs;
  origin: { x: number; y: number } | null;
}

interface PhoneState {
  apps: PhoneApp[];
  current: AppId | null;
  switcher: boolean;
  open: (id: AppId, args?: AppArgs, origin?: { x: number; y: number } | null) => void;
  home: () => void;
  close: (id: AppId) => void;
  closeAll: () => void;
  setSwitcher: (v: boolean) => void;
}

let nonce = 0;

export const usePhone = create<PhoneState>()((set) => ({
  apps: [],
  current: null,
  switcher: false,
  open: (id, args = {}, origin = null) =>
    set((s) => {
      const prev = s.apps.find((a) => a.id === id);
      const app: PhoneApp = {
        id,
        args: { ...args, nonce: ++nonce },
        origin: origin ?? prev?.origin ?? null,
      };
      return { apps: [app, ...s.apps.filter((a) => a.id !== id)], current: id, switcher: false };
    }),
  home: () => set({ current: null, switcher: false }),
  close: (id) =>
    set((s) => {
      const apps = s.apps.filter((a) => a.id !== id);
      return {
        apps,
        current: s.current === id ? null : s.current,
        switcher: s.switcher && apps.length > 0,
      };
    }),
  closeAll: () => set({ apps: [], current: null, switcher: false }),
  setSwitcher: (switcher) => set({ switcher }),
}));
