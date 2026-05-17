"use client";

import { useEffect } from "react";
import { useSession } from "@/stores/session";
import { useWindowEvent } from "./use-window-event";

export function useBootTimer(ms: number) {
  const phase = useSession((s) => s.phase);
  const booting = phase === "boot";
  useEffect(() => {
    if (!booting) return;
    const id = window.setTimeout(() => useSession.getState().setPhase("login"), ms);
    return () => window.clearTimeout(id);
  }, [booting, ms]);
  const skip = () => {
    if (useSession.getState().phase === "boot") useSession.getState().setPhase("login");
  };
  useWindowEvent("keydown", skip, booting);
  return skip;
}
