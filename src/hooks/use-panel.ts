"use client";

import { useState } from "react";

export function usePanel<T extends string>() {
  const [panel, setPanel] = useState<T | null>(null);
  return {
    panel,
    open: (p: T) => setPanel(p),
    close: () => setPanel(null),
    toggle: (p: T) => setPanel((cur) => (cur === p ? null : p)),
  };
}
