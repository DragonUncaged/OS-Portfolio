"use client";

import { useSyncExternalStore } from "react";

let viewport = { w: 1280, h: 720 };

function readViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (viewport.w !== w || viewport.h !== h) viewport = { w, h };
  return viewport;
}

function subscribeViewport(cb: () => void) {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
}

const serverViewport = { w: 1280, h: 720 };

export function useViewport(): { w: number; h: number } {
  return useSyncExternalStore(subscribeViewport, readViewport, () => serverViewport);
}

export function isPhoneSize(w: number, h: number): boolean {
  return w < 768 || (h < 500 && w < 1000);
}
