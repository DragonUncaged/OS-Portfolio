"use client";

import "./macos.css";
import { AnimatePresence, motion } from "motion/react";
import { Banner } from "@/components/notifications";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { WindowLayer } from "@/components/window-layer";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
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
        {panel === "control" && <ControlCentre key="control" />}
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
