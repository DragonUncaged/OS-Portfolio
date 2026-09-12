"use client";

import { X } from "@phosphor-icons/react";
import { motion, type TargetAndTransition, type Transition } from "motion/react";
import { Suspense, useMemo, useRef, useState } from "react";
import { APP_COMPONENTS } from "@/apps/lazy";
import { appName } from "@/apps/registry";
import { InstanceContext, type Instance } from "@/hooks/use-instance";
import { useViewport } from "@/hooks/use-viewport";
import { usePhone, type PhoneApp } from "@/stores/phone";
import { usePlatform } from "@/stores/session";
import { AppIcon } from "./app-icon";
import { AppLoading } from "./window";

export type PhoneVariant = "ios" | "android" | "wp";

const LOOK: Record<PhoneVariant, { scale: number; gap: number; radius: number; lift: number }> = {
  ios: { scale: 0.72, gap: 14, radius: 30, lift: 14 },
  android: { scale: 0.72, gap: 18, radius: 30, lift: 12 },
  wp: { scale: 0.6, gap: 26, radius: 0, lift: 26 },
};

const OPEN: Record<PhoneVariant, Transition> = {
  ios: { type: "spring", stiffness: 300, damping: 30, mass: 0.9 },
  android: { type: "spring", stiffness: 340, damping: 32, mass: 0.9 },
  wp: { duration: 0.36, ease: [0.1, 0.9, 0.2, 1] },
};

function Screen({ app, active }: { app: PhoneApp; active: boolean }) {
  const App = APP_COMPONENTS[app.id];
  const instance = useMemo<Instance>(
    () => ({
      id: `phone:${app.id}`,
      appId: app.id,
      args: app.args,
      active,
      close: () => usePhone.getState().close(app.id),
    }),
    [app.id, app.args, active],
  );
  return (
    <InstanceContext value={instance}>
      <Suspense fallback={<AppLoading />}>{App ? <App /> : <AppLoading />}</Suspense>
    </InstanceContext>
  );
}

export function PhoneHost({ variant }: { variant: PhoneVariant }) {
  const platform = usePlatform();
  const apps = usePhone((s) => s.apps);
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  const { w: W, h: H } = useViewport();
  const look = LOOK[variant];

  const [pos, setPos] = useState(0);
  const [wasOpen, setWasOpen] = useState(switcher);
  if (switcher !== wasOpen) {
    setWasOpen(switcher);
    if (switcher) setPos(0);
  }
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; axis: "x" | "y" | null } | null>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);

  const cardW = W * look.scale;
  const step = cardW + look.gap;
  // fixed DOM order: an iframe reloads when React moves it
  const ordered = useMemo(() => [...apps].sort((a, b) => a.id.localeCompare(b.id)), [apps]);

  const endGesture = (app: PhoneApp, index: number) => {
    const d = drag;
    gesture.current = null;
    setDrag(null);
    const phone = usePhone.getState();
    if (!d || d.axis === null) {
      if (index === Math.round(pos)) phone.open(app.id, app.args);
      else setPos(index);
      return;
    }
    if (d.axis === "y") {
      if (d.dy < -H * 0.16) {
        phone.close(app.id);
        setPos((p) => Math.max(0, Math.min(p, apps.length - 2)));
      }
      return;
    }
    setPos((p) => Math.max(0, Math.min(apps.length - 1, Math.round(p + d.dx / step))));
  };

  return (
    <div
      className="phone-host absolute inset-0 z-20 overflow-hidden"
      data-switcher={switcher || undefined}
      style={{ pointerEvents: current || switcher ? "auto" : "none", perspective: variant === "wp" ? 1400 : undefined }}
    >
      {switcher && (
        <motion.button
          type="button"
          aria-label="Close app switcher"
          className="phone-switcher-bg absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => usePhone.getState().setSwitcher(false)}
        />
      )}
      {switcher && apps.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[15px] text-white/70">
          No recent apps
        </div>
      )}
      {ordered.map((app) => {
        const index = apps.findIndex((a) => a.id === app.id);
        const isCurrent = app.id === current;
        const origin = app.origin ?? { x: W / 2, y: H * 0.78 };
        const dragging = drag?.id === app.id ? drag : null;
        const rowDx = drag?.axis === "x" ? drag.dx : 0;

        let target: TargetAndTransition;
        if (switcher) {
          target = {
            x: (W - cardW) / 2 - (index - pos) * step + rowDx,
            y: (H - H * look.scale) / 2 + look.lift + (dragging?.axis === "y" ? Math.min(0, dragging.dy) : 0),
            scale: look.scale,
            rotateY: 0,
            opacity: dragging?.axis === "y" ? Math.max(0.2, 1 + dragging.dy / (H * 0.4)) : 1,
            borderRadius: look.radius / look.scale,
            visibility: "visible",
          };
        } else if (isCurrent) {
          target = { x: 0, y: 0, scale: 1, rotateY: 0, opacity: 1, borderRadius: 0, visibility: "visible" };
        } else if (variant === "wp") {
          target = { x: 0, y: 0, scale: 1, rotateY: 78, opacity: 0, borderRadius: 0, transitionEnd: { visibility: "hidden" } };
        } else if (variant === "android") {
          target = {
            x: W * 0.06,
            y: H * 0.1,
            scale: 0.88,
            rotateY: 0,
            opacity: 0,
            borderRadius: 36,
            transitionEnd: { visibility: "hidden" },
          };
        } else {
          target = {
            x: origin.x - W * 0.09,
            y: origin.y - H * 0.09,
            scale: 0.18,
            rotateY: 0,
            opacity: 0,
            borderRadius: 120,
            transitionEnd: { visibility: "hidden" },
          };
        }

        const initial: TargetAndTransition =
          variant === "wp"
            ? { rotateY: -78, opacity: 0, x: 0, y: 0, scale: 1 }
            : variant === "android"
              ? { x: origin.x - W * 0.3, y: origin.y - H * 0.3, scale: 0.6, opacity: 0, borderRadius: 48 }
              : { x: origin.x - W * 0.09, y: origin.y - H * 0.09, scale: 0.18, opacity: 0, borderRadius: 120 };

        return (
          <motion.div
            key={app.id}
            className="phone-screen absolute left-0 top-0 origin-top-left overflow-hidden"
            data-app={app.id}
            style={{ width: W, height: H, zIndex: switcher ? 100 - index : isCurrent ? 2 : 1 }}
            initial={initial}
            animate={target}
            transition={drag ? { duration: 0 } : OPEN[variant]}
            inert={!isCurrent || switcher}
          >
            <Screen app={app} active={isCurrent && !switcher} />
          </motion.div>
        );
      })}
      {switcher &&
        apps.map((app, index) => {
          const x = (W - cardW) / 2 - (index - pos) * step + (drag?.axis === "x" ? drag.dx : 0);
          const y = (H - H * look.scale) / 2 + look.lift;
          const dy = drag?.id === app.id && drag.axis === "y" ? Math.min(0, drag.dy) : 0;
          const name = appName(app.id, platform);
          return (
            <motion.div
              key={`card:${app.id}`}
              className="phone-card absolute left-0 top-0 touch-none"
              style={{ width: cardW, height: H * look.scale, zIndex: 200 - index }}
              initial={false}
              animate={{ x, y: y + dy }}
              transition={drag ? { duration: 0 } : OPEN[variant]}
            >
              <div className="phone-card-label absolute bottom-full left-0 right-0 flex items-center gap-2 pb-2.5">
                <AppIcon id={app.id} size={variant === "wp" ? 22 : 28} />
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <button
                  type="button"
                  className="phone-card-close"
                  aria-label={`Close ${name}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    usePhone.getState().close(app.id);
                    setPos((p) => Math.max(0, Math.min(p, apps.length - 2)));
                  }}
                >
                  <X size={14} weight="bold" />
                </button>
              </div>
              <button
                type="button"
                aria-label={`Open ${name}`}
                className="absolute inset-0 cursor-pointer"
                onPointerDown={(e) => {
                  gesture.current = { x: e.clientX, y: e.clientY };
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ id: app.id, dx: 0, dy: 0, axis: null });
                }}
                onPointerMove={(e) => {
                  const g = gesture.current;
                  if (!g) return;
                  const dx = e.clientX - g.x;
                  const dy = e.clientY - g.y;
                  setDrag((d) => {
                    if (!d) return d;
                    const axis = d.axis ?? (Math.hypot(dx, dy) > 8 ? (Math.abs(dx) > Math.abs(dy) ? "x" : "y") : null);
                    return { ...d, dx, dy, axis };
                  });
                }}
                onPointerUp={() => endGesture(app, index)}
                onPointerCancel={() => {
                  gesture.current = null;
                  setDrag(null);
                }}
                onClick={(e) => {
                  // detail is 0 for keyboard activation, pointer taps are handled above
                  if (e.detail === 0) usePhone.getState().open(app.id, app.args);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Delete" || e.key === "Backspace") usePhone.getState().close(app.id);
                }}
              />
            </motion.div>
          );
        })}
    </div>
  );
}
