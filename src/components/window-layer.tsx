"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useMemo } from "react";
import { useViewport } from "@/hooks/use-viewport";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
import { useSession } from "@/stores/session";
import { frameOf, useWM, type Win } from "@/stores/window-manager";
import type { Rect } from "@/types";
import { Window, type OverviewSlot } from "./window";

function overviewSlots(wins: Win[], area: Rect, region: Rect): Map<string, OverviewSlot> {
  const slots = new Map<string, OverviewSlot>();
  const n = wins.length;
  if (!n) return slots;
  const cols = Math.ceil(Math.sqrt(n * (region.w / Math.max(region.h, 1)) * 0.7)) || 1;
  const rows = Math.ceil(n / Math.min(cols, n));
  const perRow = Math.ceil(n / rows);
  const cellW = region.w / perRow;
  const cellH = region.h / rows;
  wins.forEach((win, i) => {
    const f = frameOf(win, area);
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, n - row * perRow);
    const col = i - row * perRow;
    const scale = Math.min((cellW * 0.86) / f.w, (cellH * 0.74) / f.h, 1);
    const offset = (region.w - inRow * cellW) / 2;
    slots.set(win.id, {
      scale,
      x: region.x + offset + col * cellW + (cellW - f.w * scale) / 2,
      y: region.y + row * cellH + (cellH - f.h * scale) / 2 - 12,
    });
  });
  return slots;
}

export function WindowLayer({
  insets,
  snapping = false,
  overviewInsets = { top: 96, right: 48, bottom: 96, left: 48 },
}: {
  insets: { top: number; right: number; bottom: number; left: number };
  snapping?: boolean;
  overviewInsets?: { top: number; right: number; bottom: number; left: number };
}) {
  const { w: vw, h: vh } = useViewport();
  const wins = useWM((s) => s.wins);
  const focus = useWM((s) => s.focus);
  const area = useWM((s) => s.area);
  const overview = useWM((s) => s.overview);
  const snapHint = useWM((s) => s.snapHint);

  const { top, right, bottom, left } = insets;
  useEffect(() => {
    useWM.getState().setArea({ x: left, y: top, w: Math.max(200, vw - left - right), h: Math.max(160, vh - top - bottom) });
  }, [vw, vh, top, right, bottom, left]);

  const slots = useMemo(() => {
    if (!overview) return null;
    const region = {
      x: overviewInsets.left,
      y: overviewInsets.top,
      w: vw - overviewInsets.left - overviewInsets.right,
      h: vh - overviewInsets.top - overviewInsets.bottom,
    };
    return overviewSlots(
      wins.filter((w) => !w.minimized),
      area,
      region,
    );
  }, [overview, wins, area, vw, vh, overviewInsets.top, overviewInsets.right, overviewInsets.bottom, overviewInsets.left]);

  useWindowEvent("keydown", (e) => {
    if (useSession.getState().phase !== "desktop") return;
    const wm = useWM.getState();
    if (e.key === "Escape" && wm.overview) {
      wm.setOverview(false);
      return;
    }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const id = wm.focus;
    if (e.code === "Backquote") {
      e.preventDefault();
      wm.cycle();
    } else if (id && e.code === "KeyW") {
      e.preventDefault();
      wm.close(id);
    } else if (id && e.code === "KeyM" && !isTyping(e)) {
      e.preventDefault();
      wm.minimize(id);
    } else if (id && e.code === "Enter") {
      e.preventDefault();
      wm.toggleMax(id);
    }
  });

  const hint = snapHint && frameOf({ mode: snapHint, rect: area } as Win, area);

  return (
    <div className="os-windows pointer-events-none fixed inset-0 z-10" data-overview={overview || undefined}>
      {hint && (
        <div
          className="os-snap-hint absolute"
          style={{ left: hint.x + 6, top: hint.y + 6, width: hint.w - 12, height: hint.h - 12, zIndex: 5 }}
        />
      )}
      <AnimatePresence>
        {wins.map((win) => (
          <Window
            key={win.id}
            win={win}
            focused={win.id === focus && !overview}
            area={area}
            slot={slots?.get(win.id) ?? null}
            snapping={snapping}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
