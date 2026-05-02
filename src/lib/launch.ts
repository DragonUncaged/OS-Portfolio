"use client";

import { usePhone } from "@/stores/phone";
import { useSession } from "@/stores/session";
import { useWM } from "@/stores/window-manager";
import type { AppArgs, AppId } from "@/types";

export function originOf(el: Element | null): { x: number; y: number } | null {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
}

export function launch(
  id: AppId,
  args: AppArgs = {},
  opts: { origin?: { x: number; y: number } | null; fresh?: boolean } = {},
) {
  if (useSession.getState().form === "phone") {
    usePhone.getState().open(id, args, opts.origin ?? null);
  } else {
    useWM.getState().open(id, args, opts.fresh);
  }
}

export function openExternal(href: string) {
  window.open(href, href.startsWith("mailto:") ? "_self" : "_blank", "noopener,noreferrer");
}

const backHandlers = new Map<string, () => void>();

export function registerBack(instance: string, handler: (() => void) | null) {
  if (handler) backHandlers.set(instance, handler);
  else backHandlers.delete(instance);
}

function goBack(instance: string): boolean {
  const handler = backHandlers.get(instance);
  if (!handler) return false;
  handler();
  return true;
}
