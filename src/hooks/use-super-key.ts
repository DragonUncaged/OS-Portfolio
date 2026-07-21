"use client";

import { useRef } from "react";
import { useWindowEvent } from "./use-window-event";

// most hosts keep the Super key for themselves, so nothing may depend on this
export function useSuperKey(onTap: () => void, active = true) {
  const armed = useRef(false);
  useWindowEvent(
    "keydown",
    (e) => {
      armed.current = e.key === "Meta" && !e.repeat;
    },
    active,
  );
  useWindowEvent(
    "keyup",
    (e) => {
      if (e.key === "Meta" && armed.current) onTap();
      armed.current = false;
    },
    active,
  );
  useWindowEvent("pointerdown", () => (armed.current = false), active);
  useWindowEvent("blur", () => (armed.current = false), active);
}
