"use client";

import { CopySimple, Minus, Plus, Square, X } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Suspense, useMemo, useRef } from "react";
import { APP_COMPONENTS } from "@/apps/lazy";
import { appName } from "@/apps/registry";
import { InstanceContext, type Instance } from "@/hooks/use-instance";
import { usePlatform } from "@/stores/session";
import { frameOf, useWM, type Win, type WinMode } from "@/stores/window-manager";
import type { Platform, Rect } from "@/types";
import { AppIcon } from "./app-icon";

export interface OverviewSlot {
  x: number;
  y: number;
  scale: number;
}

export function AppLoading() {
  return (
    <div className="grid h-full w-full place-items-center bg-bg">
      <div
        className="size-6 rounded-full border-2 border-line border-t-accent"
        style={{ animation: "k-spin 0.7s linear infinite" }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function Controls({ platform, win, title }: { platform: Platform; win: Win; title: string }) {
  const wm = useWM.getState();
  const close = () => wm.close(win.id);
  const minimize = () => wm.minimize(win.id);
  const zoom = () => wm.toggleMax(win.id);
  const maxed = win.mode !== "normal";

  if (platform === "macos") {
    return (
      <div className="mac-lights absolute left-[19px] top-[20px] z-20 flex gap-2" data-no-drag>
        <button type="button" className="mac-light" data-kind="close" aria-label={`Close ${title}`} onClick={close}>
          <X size={8} weight="bold" />
        </button>
        <button type="button" className="mac-light" data-kind="min" aria-label={`Minimize ${title}`} onClick={minimize}>
          <Minus size={8} weight="bold" />
        </button>
        <button type="button" className="mac-light" data-kind="zoom" aria-label={`Zoom ${title}`} onClick={zoom}>
          <Plus size={8} weight="bold" />
        </button>
      </div>
    );
  }
  if (platform === "windows") {
    return (
      <div className="win-caption absolute right-0 top-0 z-20 flex" data-no-drag>
        <button type="button" aria-label={`Minimize ${title}`} onClick={minimize}>
          <Minus size={14} />
        </button>
        <button type="button" aria-label={maxed ? `Restore ${title}` : `Maximize ${title}`} onClick={zoom}>
          {maxed ? <CopySimple size={13} /> : <Square size={12} />}
        </button>
        <button type="button" data-kind="close" aria-label={`Close ${title}`} onClick={close}>
          <X size={14} />
        </button>
      </div>
    );
  }
  return (
    <div className="ub-buttons absolute right-[10px] top-[11px] z-20 flex gap-2" data-no-drag>
      <button type="button" aria-label={`Minimize ${title}`} onClick={minimize}>
        <Minus size={11} weight="bold" />
      </button>
      <button type="button" aria-label={maxed ? `Restore ${title}` : `Maximize ${title}`} onClick={zoom}>
        {maxed ? <CopySimple size={11} weight="bold" /> : <Square size={10} weight="bold" />}
      </button>
      <button type="button" data-kind="close" aria-label={`Close ${title}`} onClick={close}>
        <X size={11} weight="bold" />
      </button>
    </div>
  );
}

export function Window({
  win,
  focused,
  area,
  slot,
  snapping,
}: {
  win: Win;
  focused: boolean;
  area: Rect;
  slot: OverviewSlot | null;
  snapping: boolean;
}) {
  const platform = usePlatform();
  const ref = useRef<HTMLDivElement>(null);
  const frame = frameOf(win, area);
  const title = appName(win.appId, platform);
  const App = APP_COMPONENTS[win.appId];

  const instance = useMemo<Instance>(
    () => ({
      id: win.id,
      appId: win.appId,
      args: win.args,
      active: focused,
      close: () => useWM.getState().close(win.id),
    }),
    [win.id, win.appId, win.args, focused],
  );

  const sync = () => {
    const el = ref.current;
    const state = useWM.getState();
    const now = state.wins.find((w) => w.id === win.id);
    if (!el || !now) return;
    const f = frameOf(now, state.area);
    el.style.transform = `translate(${f.x}px, ${f.y}px)`;
    el.style.width = `${f.w}px`;
    el.style.height = `${f.h}px`;
  };

  const track = (onMove: (e: PointerEvent) => void, onEnd: () => void) => {
    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.body.classList.remove("wm-busy");
      delete ref.current?.dataset.busy;
      onEnd();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0 || slot) return;
    const target = e.target as HTMLElement;
    if (!target.closest("[data-wm-drag]") || target.closest("button, a, input, textarea, select, [data-no-drag]")) return;
    const el = ref.current;
    if (!el) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let base = frame;
    let mode: WinMode = win.mode;
    let moved = false;
    let hint: WinMode | null = null;
    let cur = frame;

    track(
      (ev) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (!moved) {
          if (Math.hypot(dx, dy) < 4) return;
          moved = true;
          document.body.classList.add("wm-busy");
          el.dataset.busy = "1";
          if (mode !== "normal") {
            const ratio = (sx - base.x) / base.w;
            base = { x: sx - win.rect.w * ratio, y: base.y, w: win.rect.w, h: win.rect.h };
            mode = "normal";
            el.style.width = `${base.w}px`;
            el.style.height = `${base.h}px`;
          }
        }
        const a = useWM.getState().area;
        cur = {
          ...base,
          x: base.x + dx,
          y: Math.min(Math.max(base.y + dy, a.y), a.y + a.h - 40),
        };
        el.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
        if (snapping) {
          hint = ev.clientY <= a.y + 6 ? "max" : ev.clientX <= 6 ? "left" : ev.clientX >= window.innerWidth - 6 ? "right" : null;
          useWM.getState().setSnapHint(hint);
        }
      },
      () => {
        if (!moved) return;
        const wm = useWM.getState();
        wm.setSnapHint(null);
        if (hint) wm.setMode(win.id, hint);
        else {
          wm.setMode(win.id, "normal");
          wm.setRect(win.id, cur);
        }
        sync();
      },
    );
  };

  const shown = !win.minimized;
  const toDock = win.minTo
    ? { x: win.minTo.x - (frame.x + frame.w / 2), y: win.minTo.y - (frame.y + frame.h / 2) }
    : { x: 0, y: area.h / 2 };

  return (
    <div
      ref={ref}
      className="os-window-pos pointer-events-none absolute left-0 top-0"
      data-overview={slot ? "1" : undefined}
      style={{
        width: frame.w,
        height: frame.h,
        zIndex: win.z,
        transform: slot
          ? `translate(${slot.x}px, ${slot.y}px) scale(${slot.scale})`
          : `translate(${frame.x}px, ${frame.y}px)`,
      }}
    >
      <motion.div
        className="os-window @container"
        role="dialog"
        aria-label={title}
        data-win={win.id}
        data-app={win.appId}
        data-focused={focused}
        data-mode={win.mode}
        inert={!shown}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={
          shown
            ? { opacity: 1, scale: 1, x: 0, y: 0, visibility: "visible" }
            : { opacity: 0, scale: 0.08, ...toDock, transitionEnd: { visibility: "hidden" } }
        }
        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.14 } }}
        transition={
          shown ? { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } : { duration: 0.32, ease: [0.4, 0, 0.6, 1] }
        }
        style={{ pointerEvents: shown ? "auto" : "none" }}
        onPointerDownCapture={() => {
          if (!slot) useWM.getState().focusWin(win.id);
        }}
        onPointerDown={startDrag}
        onDoubleClick={(e) => {
          const t = e.target as HTMLElement;
          if (t.closest("[data-wm-drag]") && !t.closest("button, a, input, textarea, select, [data-no-drag]")) {
            useWM.getState().toggleMax(win.id);
          }
        }}
      >
        <div className="os-window-clip">
          <InstanceContext value={instance}>
            <Suspense fallback={<AppLoading />}>{App ? <App /> : <AppLoading />}</Suspense>
          </InstanceContext>
        </div>
        <Controls platform={platform} win={win} title={title} />
        {slot && (
          <>
            <button
              type="button"
              className="os-window-pick absolute inset-0 z-40"
              aria-label={`Switch to ${title}`}
              onClick={() => useWM.getState().focusWin(win.id)}
            />
            <div
              className="os-overview-label pointer-events-none absolute left-1/2 top-full z-40 flex origin-top items-center gap-2 whitespace-nowrap"
              style={{ transform: `translateX(-50%) scale(${1 / slot.scale})`, marginTop: 10 / slot.scale }}
            >
              <AppIcon id={win.appId} size={20} />
              {title}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
