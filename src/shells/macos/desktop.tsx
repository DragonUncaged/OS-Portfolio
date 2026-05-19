"use client";

import "./macos.css";
import { AnimatePresence } from "motion/react";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { WindowLayer } from "@/components/window-layer";
import { usePanel } from "@/hooks/use-panel";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
import { useSession } from "@/stores/session";
import { useWM } from "@/stores/window-manager";
import { MENU_H, type Panel } from "./constants";
import { Dock } from "./dock";
import { Boot, Login } from "./login";
import { MenuBar } from "./menu-bar";

function Desktop() {
  const { panel, toggle, close } = usePanel<Panel>();
  const overview = useWM((s) => s.overview);

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
      <WindowLayer insets={{ top: MENU_H, right: 0, bottom: 82, left: 0 }} overviewInsets={{ top: 96, right: 56, bottom: 120, left: 56 }} />
      <MenuBar panel={panel} toggle={toggle} />
      <Dock toggle={toggle} />
      <AnimatePresence>
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
