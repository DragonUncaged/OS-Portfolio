"use client";

import { useEffect, useRef } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (e: WindowEventMap[K]) => void,
  active = true,
) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!active) return;
    const fn = (e: WindowEventMap[K]) => ref.current(e);
    window.addEventListener(type, fn);
    return () => window.removeEventListener(type, fn);
  }, [type, active]);
}

export function useEscape(onEscape: () => void, active = true) {
  useWindowEvent(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    },
    active,
  );
}

export function useOutsidePress(selector: string, onOutside: () => void, active = true) {
  useWindowEvent(
    "pointerdown",
    (e) => {
      const t = e.target as Element | null;
      if (t && !t.closest(selector)) onOutside();
    },
    active,
  );
}

export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT";
}
