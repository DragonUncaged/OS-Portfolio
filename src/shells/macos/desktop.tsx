"use client";

import "./macos.css";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/app-icon";
import { showContextMenu } from "@/components/menu";
import { Banner } from "@/components/notifications";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { WindowLayer } from "@/components/window-layer";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
import { launch } from "@/lib/launch";
import { useSession } from "@/stores/session";
import { DEFAULT_PREFS, useSettings } from "@/stores/settings";
import { useWM } from "@/stores/window-manager";
import { askSiri } from "./answers";
import { DESKTOP_WALLPAPER, DOCK_H, MENU_H, type Panel } from "./constants";
import { ControlCentre } from "./control-centre";
import { Dock } from "./dock";
import { DocumentIcon, FolderIcon } from "./glyphs";
import { Boot, Login } from "./login";
import { MenuBar } from "./menu-bar";
import { NotificationCentre } from "./notification-centre";
import { Siri, type SiriTurn } from "./siri";
import { Spotlight } from "./spotlight";
import { DesktopWidgets } from "./widgets";

const SEEDED_KEY = "os-portfolio:macos-desktop";

function useDesktopWallpaper() {
  useEffect(() => {
    try {
      if (localStorage.getItem(SEEDED_KEY)) return;
      localStorage.setItem(SEEDED_KEY, "1");
    } catch {
      return;
    }
    const settings = useSettings.getState();
    if (settings.prefs.macos.wallpaper === DEFAULT_PREFS.macos.wallpaper) settings.setWallpaper("macos", DESKTOP_WALLPAPER);
  }, []);
}

function useGlassAmount() {
  const glass = useSettings((s) => s.glass);
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--mac-glass", String(glass));
    return () => {
      root.style.removeProperty("--mac-glass");
    };
  }, [glass]);
}

const DESKTOP_ITEMS = [
  { id: "projects", label: "Projects", icon: <FolderIcon size={58} />, open: () => launch("files", { path: "Projects" }) },
  { id: "resume", label: "Resume", icon: <AppIcon id="resume" size={50} platform="macos" />, open: () => launch("resume") },
  { id: "about", label: "about.md", icon: <DocumentIcon size={56} />, open: () => launch("viewer", { path: "about.md" }) },
];

function DesktopIcons() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div
      className="absolute inset-0 z-[1]"
      onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      onContextMenu={(e) =>
        showContextMenu(e, [
          { label: "New Note", onSelect: () => launch("notes") },
          { label: "Open Terminal", onSelect: () => launch("terminal") },
          { type: "separator" },
          { label: "Change Wallpaper…", onSelect: () => launch("settings", { section: "wallpaper" }) },
          { label: "Mission Control", onSelect: () => useWM.getState().setOverview(true) },
          { type: "separator" },
          { label: "About This Mac", onSelect: () => launch("settings", { section: "system" }) },
        ])
      }
    >
      <DesktopWidgets />
      <div className="pointer-events-none absolute right-3 flex flex-col items-end gap-2.5" style={{ top: MENU_H + 12 }}>
        {DESKTOP_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mac-desktop-icon pointer-events-auto"
            data-on={selected === item.id}
            onClick={() => setSelected(item.id)}
            onDoubleClick={item.open}
            onKeyDown={(e) => e.key === "Enter" && item.open()}
          >
            <span className="mac-desktop-art">{item.icon}</span>
            <span className="mac-desktop-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Desktop() {
  const { panel, open, toggle, close } = usePanel<Panel>();
  const [siri, setSiri] = useState<SiriTurn | null>(null);
  const overview = useWM((s) => s.overview);
  useWelcome("Press ⌘K to search this Mac or ask Siri, or open Apps from the Dock. Restart from the ⌘ menu to try another system.");

  const ask = (question: string) => {
    // askSiri has side effects, keep it out of the state updater
    const reply = askSiri(question);
    setSiri((prev) => ({ id: (prev?.id ?? 0) + 1, question, reply }));
    open("siri");
  };

  useWindowEvent("keydown", (e) => {
    if (useSession.getState().phase !== "desktop") return;
    const wm = useWM.getState();
    if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.code === "Space" && e.ctrlKey)) {
      e.preventDefault();
      toggle("spotlight");
    } else if (e.key === "F4") {
      e.preventDefault();
      toggle("apps");
    } else if (e.key === "F3" || (e.key === "ArrowUp" && e.ctrlKey && !isTyping(e))) {
      e.preventDefault();
      close();
      wm.setOverview(!wm.overview);
    } else if (e.key === "Escape" && panel) {
      close();
    }
  });

  useWindowEvent(
    "pointerdown",
    (e) => {
      const t = e.target as Element | null;
      if (t && !t.closest("[data-panel], [data-panel-trigger]")) close();
    },
    panel === "control" || panel === "notifications",
  );

  return (
    <>
      <DesktopIcons />
      <AnimatePresence>
        {overview && (
          <motion.button
            type="button"
            key="mc"
            aria-label="Leave Mission Control"
            className="mac-mission fixed inset-0 z-[9] cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => useWM.getState().setOverview(false)}
          >
            <span className="mac-mission-bar absolute inset-x-0 flex justify-center" style={{ top: MENU_H }}>
              <span className="mac-mission-desk mac-glass" data-glass="smoke">
                Desktop
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <WindowLayer insets={{ top: MENU_H, right: 0, bottom: DOCK_H, left: 0 }} overviewInsets={{ top: 104, right: 56, bottom: 124, left: 56 }} />
      <MenuBar panel={panel} toggle={toggle} />
      <Dock toggle={toggle} />
      <Banner className="fixed right-2.5 w-[352px] max-w-[calc(100vw-20px)]" style={{ top: MENU_H + 8 }} from={{ x: 60 }} />
      <AnimatePresence>
        {panel === "spotlight" && <Spotlight key="spotlight" initial="all" onClose={close} onAsk={ask} />}
        {panel === "apps" && <Spotlight key="apps" initial="apps" onClose={close} onAsk={ask} />}
        {panel === "siri" && siri && <Siri key={`siri${siri.id}`} first={siri} onClose={close} />}
        {panel === "control" && <ControlCentre key="control" onClose={close} />}
        {panel === "notifications" && <NotificationCentre key="nc" onClose={close} />}
      </AnimatePresence>
    </>
  );
}

export default function MacDesktop() {
  const phase = useSession((s) => s.phase);
  useDesktopWallpaper();
  useGlassAmount();
  return (
    <ShellRoot platform="macos">
      <ShellWallpaper className="mac-wallpaper" />
      {phase !== "boot" && (
        <div className="absolute inset-0" inert={phase !== "desktop"}>
          <Desktop />
        </div>
      )}
      <AnimatePresence>
        {phase === "login" && <Login key="login" />}
        {phase === "boot" && <Boot key="boot" />}
      </AnimatePresence>
    </ShellRoot>
  );
}
