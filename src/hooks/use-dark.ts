"use client";

import { useSettings } from "@/stores/settings";
import { useMediaQuery } from "./use-media-query";

export function useDark(): boolean {
  const theme = useSettings((s) => s.theme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  return theme === "dark" || (theme === "auto" && systemDark);
}
