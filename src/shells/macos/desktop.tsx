"use client";

import "./macos.css";
import { FileText, Folder } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
import { useWM } from "@/stores/window-manager";
import { MENU_H, type Panel } from "./constants";
import { ControlCentre } from "./control-centre";
import { Dock } from "./dock";
import { Launchpad } from "./launchpad";
import { Boot, Login } from "./login";
import { MenuBar } from "./menu-bar";
import { NotificationCentre } from "./notification-centre";
import { Spotlight } from "./spotlight";

const DESKTOP_ITEMS = [
  { id: "projects", label: "Projects", icon: <Folder size={54} weight="fill" className="text-[#5ab0ff]" />, open: () => launch("files", { path: "Projects" }) },
  { id: "resume", label: "Resume", icon: <AppIcon id="resume" size={50} platform="macos" />, open: () => launch("resume") },
  { id: "about", label: "about.md", icon: <FileText size={52} weight="duotone" className="text-white" />, open: () => launch("viewer", { path: "about.md" }) },
];

function DesktopIcons() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div
      className="absolute inset-0 z-[1]"
      style={{ paddingTop: MENU_H + 14 }}
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
      <div className="pointer-events-none absolute right-3 flex flex-col items-end gap-3" style={{ top: MENU_H + 14 }}>
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
            <span className="grid h-[58px] place-items-center drop-shadow-[0_2px_4px_rgb(0_0_0/0.35)]">{item.icon}</span>
            <span className="mac-desktop-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Desktop() {
  const { panel, toggle, close } = usePanel<Panel>();
  const overview = useWM((s) => s.overview);
  useWelcome("Press ⌘K to search everything, or open Launchpad from the Dock. Restart from the ⌘ menu to try another system.");

  useWindowEvent("keydown", (e) => {
    if (useSession.getState().phase !== "desktop") return;
    const wm = useWM.getState();
    if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.code === "Space" && e.ctrlKey)) {
      e.preventDefault();
      toggle("spotlight");
    } else if (e.key === "F4") {
      e.preventDefault();
      toggle("launchpad");
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
            onClick={() => useWM.getState().setOverview(false)}
          >
            <span className="mac-mission-bar absolute inset-x-0 flex justify-center" style={{ top: MENU_H }}>
              <span className="mac-mission-desk">Desktop</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <WindowLayer insets={{ top: MENU_H, right: 0, bottom: 82, left: 0 }} overviewInsets={{ top: 96, right: 56, bottom: 120, left: 56 }} />
      <MenuBar panel={panel} toggle={toggle} />
      <Dock toggle={toggle} />
      <Banner className="fixed right-2.5 w-[344px] max-w-[calc(100vw-20px)]" style={{ top: MENU_H + 8 }} from={{ x: 60 }} />
      <AnimatePresence>
        {panel === "spotlight" && <Spotlight key="spotlight" onClose={close} />}
        {panel === "launchpad" && <Launchpad key="launchpad" onClose={close} />}
        {panel === "control" && <ControlCentre key="control" onClose={close} />}
        {panel === "notifications" && <NotificationCentre key="nc" onClose={close} />}
      </AnimatePresence>
    </>
  );
}

export default function MacDesktop() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="macos">
      <ShellWallpaper />
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
