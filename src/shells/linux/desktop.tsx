"use client";

import "@fontsource/ubuntu/300.css";
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";
import "./ubuntu.css";
import {
  ArrowClockwise,
  ArrowRight,
  DotsNine,
  LockSimple,
  Power,
  SignOut,
  SpeakerHigh,
  TerminalWindow,
  Trash,
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
import { dateMonthDay, time24 } from "@/lib/format";
import { launch } from "@/lib/launch";
import { useSession } from "@/stores/session";
import { useWM } from "@/stores/window-manager";
import type { AppId } from "@/types";

const BAR_H = 28;
const DOCK_W = 66;
const DOCK_APPS: AppId[] = ["files", "browser", "about", "projects", "experience", "resume", "contact", "terminal", "settings"];

type Panel = "apps" | "quick" | "clock";

function powerItems(): MenuItem[] {
  const { power } = useSession.getState();
  return [
    { label: "Lock", icon: LockSimple, onSelect: () => power("lock") },
    { label: "Log Out…", icon: SignOut, onSelect: () => power("logout") },
    { type: "separator" },
    { label: "Restart…", icon: ArrowClockwise, onSelect: () => power("restart") },
    { label: "Power Off…", icon: Power, onSelect: () => power("shutdown") },
  ];
}

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 lowercase tracking-wide ${className}`}>
      <TerminalWindow size={22} weight="fill" className="text-[#e95420]" />
      {profile.name}
    </span>
  );
}

function Boot() {
  const skip = useBootTimer(2300);
  return (
    <motion.button
      type="button"
      className="ub-boot fixed inset-0 z-[5000] flex cursor-default flex-col items-center justify-center text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Starting up. Click to skip"
      onClick={skip}
    >
      <span className="ub-spinner" />
      <Wordmark className="absolute bottom-[12vh] text-[22px] font-light" />
    </motion.button>
  );
}

function Login() {
  const now = useNow(1000);
  const loggedIn = useSession((s) => s.loggedIn);
  const [picked, setPicked] = useState(false);
  const { login } = useSession.getState();
  useWindowEvent("keydown", (e) => {
    if (e.key === "Enter" && !picked) setPicked(true);
    else if (e.key === "Escape") setPicked(false);
  });
  return (
    <motion.div
      className="ub-login fixed inset-0 z-[4500] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-x-0 top-0 flex h-7 items-center justify-between px-3 text-[13px]">
        <span />
        <span className="font-medium tabular-nums">
          {dateMonthDay(now)}&nbsp;&nbsp;{time24(now)}
        </span>
        <button
          type="button"
          className="grid size-6 place-items-center rounded-full hover:bg-white/15"
          aria-label="Power"
          data-menu-trigger
          onClick={(e) => toggleDropdown(e.currentTarget, "gdm-power", powerItems().slice(3), { align: "end" })}
        >
          <Power size={15} />
        </button>
      </div>
      <div className="grid h-full place-items-center">
        {picked ? (
          <form
            className="flex flex-col items-center gap-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <Avatar size={112} />
            <div className="text-[19px] font-medium">{profile.name}</div>
            <div className="relative">
              <input
                type="password"
                autoFocus
                autoComplete="off"
                placeholder="Password"
                aria-label="Password (any or none)"
                className="ub-login-field h-10 w-[270px] rounded-full pl-4 pr-11 text-[14px] text-white placeholder:text-white/50"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/15 hover:bg-white/30" aria-label={loggedIn ? "Unlock" : "Log in"}>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
            <p className="text-[12.5px] opacity-65">No password needed, just press Enter</p>
          </form>
        ) : (
          <button type="button" autoFocus className="ub-user flex w-[300px] items-center gap-3.5 rounded-2xl p-3 text-left" onClick={() => setPicked(true)}>
            <Avatar size={56} />
            <span>
              <span className="block text-[17px] font-medium">{profile.name}</span>
              <span className="block text-[13px] opacity-65">{profile.role}</span>
            </span>
          </button>
        )}
      </div>
      <Wordmark className="absolute inset-x-0 bottom-9 justify-center text-[20px] font-light" />
    </motion.div>
  );
}

function TopBar({ panel, toggle }: { panel: Panel | null; toggle: (p: Panel) => void }) {
  const now = useNow(1000);
  const overview = useWM((s) => s.overview);
  const notices = useSession((s) => s.notices.length);
  return (
    <div className="ub-topbar fixed inset-x-0 top-0 z-[1000] flex items-center justify-between px-1.5" style={{ height: BAR_H }}>
      <button
        type="button"
        className="ub-bar-btn"
        data-on={overview}
        aria-label="Activities"
        aria-pressed={overview}
        data-panel-trigger
        onClick={() => useWM.getState().setOverview(!overview)}
      >
        <span className="ub-workspace" data-on="true" />
        <span className="ub-workspace" />
      </button>
      <button
        type="button"
        className="ub-bar-btn absolute left-1/2 -translate-x-1/2 font-medium tabular-nums"
        data-on={panel === "clock"}
        aria-label="Clock, calendar and notifications"
        aria-expanded={panel === "clock"}
        data-panel-trigger
        onClick={() => toggle("clock")}
      >
        {dateMonthDay(now)}&nbsp;&nbsp;{time24(now)}
        {notices > 0 && <span className="ml-2 size-1.5 rounded-full bg-white" />}
      </button>
      <button
        type="button"
        className="ub-bar-btn gap-2.5"
        data-on={panel === "quick"}
        aria-label="System menu"
        aria-expanded={panel === "quick"}
        data-panel-trigger
        onClick={() => toggle("quick")}
      >
        <WifiGlyph size={15} />
        <SpeakerHigh size={15} weight="fill" />
        <BatteryGlyph size={18} />
        <Power size={14} weight="bold" />
      </button>
    </div>
  );
}

function DockApp({ id }: { id: AppId }) {
  const win = useWM((s) => s.wins.find((w) => w.appId === id));
  const focused = useWM((s) => s.focus !== null && s.focus === win?.id);
  const name = appName(id, "ubuntu");
  return (
    <button
      type="button"
      className="ub-dock-item"
      data-dock={id}
      data-running={Boolean(win)}
      data-on={focused}
      aria-label={name}
      onClick={() => {
        const wm = useWM.getState();
        if (!win) launch(id);
        else if (focused && !win.minimized && !wm.overview) wm.minimize(win.id);
        else wm.focusWin(win.id);
      }}
      onContextMenu={(e) =>
        showContextMenu(e, [
          { label: win ? name : `Open ${name}`, onSelect: () => (win ? useWM.getState().focusWin(win.id) : launch(id)) },
          ...(win ? ([{ type: "separator" }, { label: "Quit", onSelect: () => useWM.getState().close(win.id) }] satisfies MenuItem[]) : []),
        ])
      }
    >
      <span className="ub-dock-dot" />
      <AppIcon id={id} size={44} />
      <span className="ub-tooltip">{name}</span>
    </button>
  );
}

function Dock({ panel, toggle }: { panel: Panel | null; toggle: (p: Panel) => void }) {
  const wins = useWM((s) => s.wins);
  const extra = [...new Set(wins.map((w) => w.appId))].filter((id) => !DOCK_APPS.includes(id));
  return (
    <div className="ub-dock fixed bottom-0 left-0 z-[1000] flex flex-col items-center gap-1 py-1.5" style={{ top: BAR_H, width: DOCK_W }} role="toolbar" aria-label="Dock">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto [scrollbar-width:none]">
        {[...DOCK_APPS, ...extra].map((id) => (
          <DockApp key={id} id={id} />
        ))}
        <span className="my-1 h-px w-8 shrink-0 bg-white/20" />
        <button type="button" className="ub-dock-item" data-dock="trash" aria-label="Trash" onClick={() => launch("files", { section: "trash" })}>
          <span className="grid size-11 place-items-center rounded-[9px] bg-white/10 text-white/85">
            <Trash size={26} weight="duotone" />
          </span>
          <span className="ub-tooltip">Trash</span>
        </button>
      </div>
      <button
        type="button"
        className="ub-dock-item shrink-0"
        data-on={panel === "apps"}
        aria-label="Show Apps"
        aria-pressed={panel === "apps"}
        data-panel-trigger
        onClick={() => toggle("apps")}
      >
        <span className="grid size-11 place-items-center text-white">
          <DotsNine size={30} weight="bold" />
        </span>
        <span className="ub-tooltip">Show Apps</span>
      </button>
    </div>
  );
}

function Desktop() {
  const { panel, toggle, close } = usePanel<Panel>();
  const overview = useWM((s) => s.overview);
  const count = useWM((s) => s.wins.filter((w) => !w.minimized).length);
  useWelcome("Press Ctrl+K or click the top-left corner for Activities. Ctrl+Alt+T opens a terminal. Restart from the system menu to try another system.");

  const activities = () => {
    close();
    useWM.getState().setOverview(!useWM.getState().overview);
  };
  useSuperKey(activities);

  useWindowEvent("keydown", (e) => {
    if (useSession.getState().phase !== "desktop") return;
    if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      activities();
    } else if (e.ctrlKey && e.altKey && e.code === "KeyT") {
      e.preventDefault();
      launch("terminal");
    } else if (e.ctrlKey && e.altKey && e.code === "KeyA") {
      e.preventDefault();
      useWM.getState().setOverview(false);
      toggle("apps");
    } else if (e.key === "Escape" && panel) close();
  });

  useWindowEvent(
    "pointerdown",
    (e) => {
      const t = e.target as Element | null;
      if (t && !t.closest("[data-panel], [data-panel-trigger], [data-menu]")) close();
    },
    panel === "quick" || panel === "clock",
  );

  return (
    <>
      <WindowLayer
        snapping
        insets={{ top: BAR_H, right: 0, bottom: 0, left: DOCK_W }}
        overviewInsets={{ top: BAR_H + 96, right: 48, bottom: 64, left: DOCK_W + 48 }}
      />
      <TopBar panel={panel} toggle={toggle} />
      <Dock panel={panel} toggle={toggle} />
      <Banner className="fixed left-1/2 w-[440px] max-w-[calc(100vw-24px)] -translate-x-1/2" style={{ top: BAR_H + 8 }} from={{ y: -50 }} />
      <AnimatePresence>
      </AnimatePresence>
    </>
  );
}

export default function UbuntuDesktop() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="ubuntu">
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
