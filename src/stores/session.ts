"use client";

import { create } from "zustand";
import { PLATFORM } from "@/lib/platform";
import type { AppArgs, AppId, Family, Form, Platform, PowerAction } from "@/types";
import { usePhone } from "./phone";
import { useSettings } from "./settings";
import { useWM } from "./window-manager";

export type Phase = "picker" | "boot" | "login" | "desktop" | "off" | "panic";

export interface Notice {
  id: number;
  app: AppId;
  title: string;
  body: string;
  at: number;
  open?: { app: AppId; args?: AppArgs };
}

interface SessionState {
  phase: Phase;
  family: Family | null;
  form: Form;
  loggedIn: boolean;
  notices: Notice[];
  banner: number | null;
  dragon: number;
  boots: number;
  setForm: (form: Form) => void;
  start: (family: Family) => void;
  setPhase: (phase: Phase) => void;
  login: () => void;
  power: (action: PowerAction) => void;
  panic: () => void;
  notify: (n: Omit<Notice, "id" | "at">) => void;
  dismiss: (id: number) => void;
  hideBanner: () => void;
  clearNotices: () => void;
  uncage: () => void;
}

let noticeId = 0;

function quitAll() {
  useWM.getState().closeAll();
  usePhone.getState().closeAll();
}

export const useSession = create<SessionState>()((set) => ({
  phase: "picker",
  family: null,
  form: "desktop",
  loggedIn: false,
  notices: [],
  banner: null,
  dragon: 0,
  boots: 0,
  setForm: (form) => set({ form }),
  start: (family) => {
    useSettings.getState().setLastFamily(family);
    quitAll();
    set((s) => ({ family, phase: "boot", loggedIn: false, notices: [], banner: null, boots: s.boots + 1 }));
  },
  setPhase: (phase) => set({ phase }),
  login: () => set({ phase: "desktop", loggedIn: true }),
  power: (action) => {
    if (action === "lock") return set({ phase: "login" });
    quitAll();
    if (action === "logout") set({ phase: "login", loggedIn: false });
    else if (action === "shutdown") set({ phase: "off", loggedIn: false });
    else set({ phase: "picker", loggedIn: false });
  },
  panic: () => set({ phase: "panic" }),
  notify: (n) =>
    set((s) => {
      const notice: Notice = { ...n, id: ++noticeId, at: Date.now() };
      return { notices: [notice, ...s.notices].slice(0, 20), banner: notice.id };
    }),
  dismiss: (id) =>
    set((s) => ({
      notices: s.notices.filter((n) => n.id !== id),
      banner: s.banner === id ? null : s.banner,
    })),
  hideBanner: () => set({ banner: null }),
  clearNotices: () => set({ notices: [], banner: null }),
  uncage: () => set((s) => ({ dragon: s.dragon + 1 })),
}));

export function usePlatform(): Platform {
  return useSession((s) => PLATFORM[s.family ?? "macos"][s.form]);
}

export function useFamily(): Family {
  return useSession((s) => s.family ?? "macos");
}
