"use client";

import "@fontsource-variable/open-sans";
import "./windows.css";
import {
  ArrowClockwise,
  ArrowRight,
  Cards,
  LockSimple,
  MagnifyingGlass,
  Power,
  SpeakerHigh,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { appName } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Avatar } from "@/components/kit";
import { showContextMenu, toggleDropdown, type MenuItem } from "@/components/menu";
import { Banner } from "@/components/notifications";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { WindowLayer } from "@/components/window-layer";
import { profile } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useNow } from "@/hooks/use-now";
import { usePanel } from "@/hooks/use-panel";
import { useSuperKey } from "@/hooks/use-super-key";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { dateLong, dateNumeric, time12m } from "@/lib/format";
import { launch } from "@/lib/launch";
import { useSession } from "@/stores/session";
import { useWM } from "@/stores/window-manager";
import type { AppId } from "@/types";
import { WinLogo } from "./win-logo";

const TASKBAR_H = 48;
const PINNED: AppId[] = ["files", "browser", "about", "projects", "resume", "contact", "terminal", "settings"];

type Panel = "start" | "quick" | "calendar";

function powerItems(): MenuItem[] {
  const { power } = useSession.getState();
  return [
    { label: "Lock", icon: LockSimple, onSelect: () => power("lock") },
    { label: "Sign out", icon: ArrowRight, onSelect: () => power("logout") },
    { type: "separator" },
    { label: "Shut down", icon: Power, onSelect: () => power("shutdown") },
    { label: "Restart", icon: ArrowClockwise, onSelect: () => power("restart") },
  ];
}

function Boot() {
  const skip = useBootTimer(2400);
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-[5000] grid cursor-default place-items-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Starting up. Click to skip"
      onClick={skip}
    >
      <div className="flex flex-col items-center gap-20">
        <WinLogo size={96} />
        <div className="win-spinner" />
      </div>
    </motion.button>
  );
}

function Login() {
  const now = useNow(1000);
  const loggedIn = useSession((s) => s.loggedIn);
  const [signIn, setSignIn] = useState(false);
  const { login } = useSession.getState();
  useWindowEvent("keydown", (e) => {
    if (!signIn) setSignIn(true);
    else if (e.key === "Enter") login();
    else if (e.key === "Escape") setSignIn(false);
  });
  return (
    <motion.div
      className="fixed inset-0 z-[4500] overflow-hidden text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ShellWallpaper />
      <motion.div className="absolute inset-0 bg-black/30" animate={{ backdropFilter: signIn ? "blur(30px)" : "blur(0px)" }} />
      <AnimatePresence mode="wait">
        {signIn ? (
          <motion.div
            key="signin"
            className="absolute inset-0 grid place-items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col items-center gap-4">
              <Avatar size={150} />
              <div className="text-[28px] font-semibold">{profile.name}</div>
              <button type="button" autoFocus className="win-signin" onClick={login}>
                {loggedIn ? "Unlock" : "Sign in"}
              </button>
              <p className="text-[12.5px] opacity-70">No PIN needed, just press Enter</p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="lock"
            type="button"
            autoFocus
            className="absolute inset-0 flex cursor-default flex-col items-center pt-[14vh] outline-none"
            exit={{ y: "-40%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.3, 0, 0.3, 1] }}
            aria-label="Lock screen. Click or press any key to sign in"
            onClick={() => setSignIn(true)}
          >
            <span className="text-[104px] font-semibold leading-none tracking-tight drop-shadow-[0_2px_16px_rgb(0_0_0/0.35)]">
              {time12m(now).replace(/ [AP]M/, "")}
            </span>
            <span className="mt-3 text-[22px] font-medium drop-shadow-[0_2px_10px_rgb(0_0_0/0.4)]">{dateLong(now)}</span>
            <span className="mt-auto pb-10 text-[13px] opacity-75">Click or press any key</span>
          </motion.button>
        )}
      </AnimatePresence>
      <div className="absolute bottom-5 right-6 flex items-center gap-4">
        <WifiGlyph size={20} />
        <button
          type="button"
          className="grid size-10 place-items-center rounded-md hover:bg-white/15"
          aria-label="Power"
          data-menu-trigger
          onClick={(e) => toggleDropdown(e.currentTarget, "login-power", powerItems().slice(3), { side: "top", align: "end", gap: 8 })}
        >
          <Power size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function TaskbarApp({ id }: { id: AppId }) {
  const win = useWM((s) => s.wins.find((w) => w.appId === id));
  const focused = useWM((s) => s.focus !== null && s.focus === win?.id);
  const name = appName(id, "windows");
  return (
    <button
      type="button"
      className="win-task"
      data-dock={id}
      data-running={Boolean(win)}
      data-on={focused}
      aria-label={name}
      title={name}
      onClick={() => {
        const wm = useWM.getState();
        if (!win) launch(id);
        else if (focused && !win.minimized) wm.minimize(win.id);
        else wm.focusWin(win.id);
      }}
      onContextMenu={(e) =>
        showContextMenu(e, [
          { label: win ? name : `Open ${name}`, onSelect: () => (win ? useWM.getState().focusWin(win.id) : launch(id)) },
          ...(win
            ? ([{ type: "separator" }, { label: "Close window", onSelect: () => useWM.getState().close(win.id) }] satisfies MenuItem[])
            : []),
        ])
      }
    >
      <AppIcon id={id} size={26} />
      <span className="win-task-pill" />
    </button>
  );
}

function Taskbar({ panel, toggle }: { panel: Panel | null; toggle: (p: Panel) => void }) {
  const now = useNow(1000);
  const wins = useWM((s) => s.wins);
  const overview = useWM((s) => s.overview);
  const notices = useSession((s) => s.notices.length);
  const extra = [...new Set(wins.map((w) => w.appId))].filter((id) => !PINNED.includes(id));
  return (
    <div className="win-taskbar fixed inset-x-0 bottom-0 z-[1000] flex items-center justify-between pl-2" style={{ height: TASKBAR_H }} role="toolbar" aria-label="Taskbar">
      <span className="hidden w-[190px] lg:block" />
      <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          className="win-task"
          data-on={panel === "start"}
          aria-label="Start"
          aria-expanded={panel === "start"}
          title="Start"
          data-panel-trigger
          onClick={() => toggle("start")}
        >
          <WinLogo size={24} />
        </button>
        <button type="button" className="win-search hidden md:flex" data-panel-trigger onClick={() => toggle("start")}>
          <MagnifyingGlass size={15} weight="bold" />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="win-task"
          data-on={overview}
          aria-label="Task view"
          title="Task view"
          onClick={() => useWM.getState().setOverview(!overview)}
        >
          <Cards size={22} weight="duotone" />
        </button>
        {[...PINNED, ...extra].map((id) => (
          <TaskbarApp key={id} id={id} />
        ))}
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          className="win-tray"
          aria-label="Quick settings"
          aria-expanded={panel === "quick"}
          data-on={panel === "quick"}
          data-panel-trigger
          onClick={() => toggle("quick")}
        >
          <WifiGlyph size={16} />
          <SpeakerHigh size={16} />
          <BatteryGlyph size={19} />
        </button>
        <button
          type="button"
          className="win-tray !flex-col !items-end !gap-0 text-right leading-[1.25]"
          aria-label="Notifications and calendar"
          aria-expanded={panel === "calendar"}
          data-on={panel === "calendar"}
          data-panel-trigger
          onClick={() => toggle("calendar")}
        >
          <span className="tabular-nums">{time12m(now)}</span>
          <span className="tabular-nums">
            {dateNumeric(now)}
            {notices > 0 && <span className="win-badge">{notices}</span>}
          </span>
        </button>
        <button type="button" className="win-peek" aria-label="Show desktop" title="Show desktop" onClick={() => useWM.getState().showDesktop()} />
      </div>
    </div>
  );
}

function Desktop() {
  const { panel, toggle, close } = usePanel<Panel>();
  const overview = useWM((s) => s.overview);
  useWelcome("Press Ctrl+K or click Start to search. Drag a window to a screen edge to snap it. Restart from the power menu to try another system.");
  useSuperKey(() => toggle("start"));

  useWindowEvent("keydown", (e) => {
    if (useSession.getState().phase !== "desktop") return;
    const wm = useWM.getState();
    if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggle("start");
    } else if (e.ctrlKey && e.altKey && e.key === "Tab") {
      e.preventDefault();
      close();
      wm.setOverview(!wm.overview);
    } else if (e.ctrlKey && e.altKey && e.code === "KeyD") {
      e.preventDefault();
      wm.showDesktop();
    } else if (e.key === "Escape" && panel) close();
  });

  useWindowEvent(
    "pointerdown",
    (e) => {
      const t = e.target as Element | null;
      if (t && !t.closest("[data-panel], [data-panel-trigger], [data-menu]")) close();
    },
    panel !== null,
  );

  return (
    <>
      <WindowLayer
        insets={{ top: 0, right: 0, bottom: TASKBAR_H, left: 0 }}
        overviewInsets={{ top: 56, right: 56, bottom: TASKBAR_H + 96, left: 56 }}
      />
      <Taskbar panel={panel} toggle={toggle} />
      <Banner className="fixed right-3 w-[364px] max-w-[calc(100vw-24px)]" style={{ bottom: TASKBAR_H + 12 }} from={{ x: 80 }} />
      <AnimatePresence>
      </AnimatePresence>
    </>
  );
}

export default function WindowsDesktop() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="windows">
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
