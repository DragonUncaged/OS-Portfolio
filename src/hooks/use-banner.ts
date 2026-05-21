"use client";

import { useEffect } from "react";
import { useSession, type Notice } from "@/stores/session";

export function useBanner(): Notice | null {
  const banner = useSession((s) => s.banner);
  const notice = useSession((s) => s.notices.find((n) => n.id === s.banner) ?? null);
  useEffect(() => {
    if (banner === null) return;
    const id = window.setTimeout(() => useSession.getState().hideBanner(), 5200);
    return () => window.clearTimeout(id);
  }, [banner]);
  return notice;
}
