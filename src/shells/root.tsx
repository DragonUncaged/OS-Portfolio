"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, type ComponentType } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { isPhoneSize, useViewport } from "@/hooks/use-viewport";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { Family, Form } from "@/types";
import { DragonOverlay, OffScreen, Panic } from "./extras";
import { Picker } from "./picker";

function Blank() {
  return <div className="fixed inset-0 bg-black" />;
}

const SHELLS: Record<Family, Record<Form, ComponentType>> = {
  macos: {
    desktop: dynamic(() => import("@/shells/macos/desktop"), { ssr: false, loading: Blank }),
    phone: dynamic(() => import("@/shells/macos/phone"), { ssr: false, loading: Blank }),
  },
  windows: {
    desktop: dynamic(() => import("@/shells/windows/desktop"), { ssr: false, loading: Blank }),
    phone: dynamic(() => import("@/shells/windows/phone"), { ssr: false, loading: Blank }),
  },
  linux: {
    desktop: dynamic(() => import("@/shells/linux/desktop"), { ssr: false, loading: Blank }),
    phone: dynamic(() => import("@/shells/linux/phone"), { ssr: false, loading: Blank }),
  },
};

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export function Root() {
  const mounted = useMounted();
  const { w, h } = useViewport();
  const phase = useSession((s) => s.phase);
  const family = useSession((s) => s.family);
  const form: Form = isPhoneSize(w, h) ? "phone" : "desktop";
  const konami = useRef(0);

  useEffect(() => {
    useSession.getState().setForm(form);
  }, [form]);

  useEffect(() => {
    const last = useSettings.getState().lastFamily;
    if (last && useSession.getState().family === null) useSession.getState().start(last);
  }, []);

  useWindowEvent("keydown", (e) => {
    if (isTyping(e)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konami.current = key === KONAMI[konami.current] ? konami.current + 1 : key === KONAMI[0] ? 1 : 0;
    if (konami.current === KONAMI.length) {
      konami.current = 0;
      useSession.getState().uncage();
    }
  });

  if (!mounted) return <Blank />;

  const Shell = family ? SHELLS[family][form] : null;
  const running = phase === "boot" || phase === "login" || phase === "desktop";
  const screen = running && Shell ? `shell:${family}` : phase;

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-root fixed inset-0 bg-black" onContextMenu={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {running && Shell ? (
              <Shell />
            ) : phase === "off" ? (
              <OffScreen />
            ) : phase === "panic" && family ? (
              <Panic family={family} />
            ) : (
              <Picker />
            )}
          </motion.div>
        </AnimatePresence>
        <DragonOverlay />
      </div>
    </MotionConfig>
  );
}
