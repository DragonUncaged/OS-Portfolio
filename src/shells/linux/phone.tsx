"use client";

import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./android.css";
import {
  ArrowClockwise,
  CaretUp,
  Circle,
  GearSix,
  LockSimple,
  MagnifyingGlass,
  Moon,
  Play,
  Pause,
  Power,
  Square,
  SunDim,
  TerminalWindow,
  Triangle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { appName, launchable } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Slider } from "@/components/kit";
import { Banner, NoticeList } from "@/components/notifications";
import { PhoneHost } from "@/components/phone-host";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { currentJob, profile } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useDark } from "@/hooks/use-dark";
import { useLauncher } from "@/hooks/use-launcher";
import { useNow } from "@/hooks/use-now";
import { useOnline } from "@/hooks/use-online";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { DAYS, MONTHS } from "@/lib/format";
import { launch, originOf, phoneBack } from "@/lib/launch";
import { TRACKS } from "@/lib/synth";
import { usePhone } from "@/stores/phone";
import { usePlayer } from "@/stores/player";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId } from "@/types";

type Panel = "drawer" | "shade" | "search" | "power";

const DOCK: AppId[] = ["about", "projects", "browser", "contact"];
const FAVOURITES: AppId[] = ["experience", "skills", "resume", "terminal", "files", "music", "settings", "tips"];

const pad = (n: number) => String(n).padStart(2, "0");
const shortDate = (ts: number) => {
  const d = new Date(ts);
  return `${DAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};

function open(id: AppId, el: Element | null) {
  launch(id, {}, { origin: originOf(el) });
}

function Boot() {
  const skip = useBootTimer(2000);
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-[5000] flex cursor-default flex-col items-center justify-center gap-10 bg-black text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Starting up. Tap to skip"
      onClick={skip}
    >
      <TerminalWindow size={70} weight="fill" className="text-[#e95420]" />
      <span className="md-dots" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="absolute bottom-12 text-[13px] lowercase tracking-wide text-white/55">{profile.name}</span>
    </motion.button>
  );
}

function Lock() {
  const now = useNow(1000);
  const d = new Date(now);
  const start = useRef<number | null>(null);
  const unlock = () => useSession.getState().login();
  return (
    <motion.button
      type="button"
      autoFocus
      className="fixed inset-0 z-[2500] cursor-default text-white outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.28 } }}
      aria-label="Lock screen. Tap or swipe up to unlock"
      onClick={unlock}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 50) unlock();
        start.current = null;
      }}
    >
      <ShellWallpaper />
      <span className="absolute inset-0 bg-black/25" />
      <span className="absolute left-7 block text-left" style={{ top: "calc(var(--sb-h) + 34px)" }}>
        <span className="block text-[17px] font-medium opacity-90">{shortDate(now)}</span>
      </span>
      <span className="md-lock-clock absolute inset-x-0 top-[24%] block text-center">
        <span className="block">{pad(d.getHours() % 12 || 12)}</span>
        <span className="block">{pad(d.getMinutes())}</span>
      </span>
      <span className="absolute inset-x-0 bottom-[calc(var(--nav-h)+26px)] flex flex-col items-center gap-2 text-[14px] opacity-85">
        <LockSimple size={20} weight="fill" />
        Swipe up or tap to unlock
      </span>
    </motion.button>
  );
}

function StatusBar({ tone, onOpen }: { tone: "light" | "auto"; onOpen: () => void }) {
  const now = useNow(1000);
  const d = new Date(now);
  return (
    <button type="button" className="md-status fixed inset-x-0 top-0 z-[3000] flex items-center justify-between px-5" data-tone={tone} aria-label="Open notifications and quick settings" data-panel-trigger onClick={onOpen}>
      <span className="text-[14px] font-medium tabular-nums">
        {d.getHours() % 12 || 12}:{pad(d.getMinutes())}
      </span>
      <span className="flex items-center gap-1.5">
        <WifiGlyph size={16} />
        <BatteryGlyph size={20} />
      </span>
    </button>
  );
}

function AppButton({ id, size = 58, label = true, onOpen }: { id: AppId; size?: number; label?: boolean; onOpen?: () => void }) {
  return (
    <button
      type="button"
      className="md-app"
      aria-label={appName(id, "android")}
      onClick={(e) => {
        onOpen?.();
        open(id, e.currentTarget.firstElementChild);
      }}
    >
      <AppIcon id={id} size={size} />
      {label && <span className="md-app-label">{appName(id, "android")}</span>}
    </button>
  );
}

function Home({ openPanel }: { openPanel: (p: Panel) => void }) {
  const now = useNow(60_000);
  const start = useRef<number | null>(null);
  return (
    <div
      className="md-home absolute inset-0 flex flex-col text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 22px)", paddingBottom: "calc(var(--nav-h) + 10px)" }}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 70) openPanel("drawer");
        start.current = null;
      }}
    >
      <button type="button" className="mx-6 block text-left drop-shadow-[0_1px_6px_rgb(0_0_0/0.35)]" onClick={(e) => open("calendar", e.currentTarget)}>
        <span className="block text-[24px] leading-tight">{shortDate(now)}</span>
        <span className="mt-0.5 block text-[14px] opacity-90">
          {currentJob.role} at {currentJob.company}
        </span>
      </button>
      <div className="min-h-4 flex-1" />
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-4 gap-y-5 px-4">
        {FAVOURITES.map((id) => (
          <AppButton key={id} id={id} />
        ))}
      </div>
      <button type="button" className="mx-auto mt-3 grid h-7 w-16 place-items-center opacity-80" aria-label="All apps" onClick={() => openPanel("drawer")}>
        <CaretUp size={18} weight="bold" />
      </button>
      <div className="mx-auto grid w-full max-w-[420px] grid-cols-4 px-4 pb-4">
        {DOCK.map((id) => (
          <AppButton key={id} id={id} label={false} />
        ))}
      </div>
      <button type="button" className="md-searchbar mx-4 flex h-[52px] shrink-0 items-center gap-3 px-5" data-panel-trigger onClick={() => openPanel("search")}>
        <MagnifyingGlass size={20} weight="bold" />
        <span className="text-[16px]">Search apps and more</span>
      </button>
    </div>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const apps = launchable("android")
    .map((id) => ({ id, name: appName(id, "android") }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <motion.div
      className="md-sheet fixed inset-0 z-[2700] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 8px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="All apps"
      data-panel
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <button type="button" className="mx-auto mb-2 grid h-5 w-20 shrink-0 place-items-center" aria-label="Close app drawer" onClick={onClose}>
        <span className="h-1 w-9 rounded-full bg-fg3" />
      </button>
      <label className="md-field mx-4 flex h-[52px] shrink-0 items-center gap-3 px-5">
        <MagnifyingGlass size={20} className="shrink-0 text-fg2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps"
          aria-label="Search apps"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-fg2"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="mx-auto grid min-h-0 w-full max-w-[440px] flex-1 grid-cols-4 content-start gap-y-5 overflow-y-auto px-3 py-6">
        {apps.map((a) => (
          <AppButton key={a.id} id={a.id} onOpen={onClose} />
        ))}
        {apps.length === 0 && <p className="col-span-4 py-10 text-center text-[15px] text-fg2">No apps match &quot;{query}&quot;</p>}
      </div>
    </motion.div>
  );
}

function Search({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose, 8);
  return (
    <motion.div
      className="md-sheet fixed inset-0 z-[2800] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 10px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="Search"
      data-panel
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
    >
      <label className="md-field mx-4 flex h-[52px] shrink-0 items-center gap-3 px-5">
        <MagnifyingGlass size={20} className="shrink-0 text-fg2" />
        <input
          autoFocus
          value={l.query}
          onChange={(e) => l.setQuery(e.target.value)}
          onKeyDown={l.onKeyDown}
          placeholder="Search apps and more"
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-fg2"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </label>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {!l.query.trim() && <p className="px-5 py-6 text-[15px] text-fg2">Search apps, projects, skills, files and settings.</p>}
        {l.query.trim() && l.hits.length === 0 && <p className="px-5 py-6 text-[15px] text-fg2">No results for &quot;{l.query}&quot;</p>}
        {l.hits.map((h, i) => (
          <button key={h.id} type="button" className="md-result" data-on={i === l.index} onClick={() => l.run(h)}>
            <AppIcon id={h.app} size={42} />
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[16px]">{h.title}</span>
              <span className="block truncate text-[13px] text-fg2">{h.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Shade({ onClose, onPower }: { onClose: () => void; onPower: () => void }) {
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  const has = useSession((s) => s.notices.length > 0);
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const now = useNow(60_000);
  return (
    <motion.div
      className="md-sheet md-shade fixed inset-0 z-[2900] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 6px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="Notifications and quick settings"
      data-panel
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <div className="shrink-0 px-4 pb-1 pt-1 text-[15px] text-fg2">{shortDate(now)}</div>
      <div className="grid shrink-0 grid-cols-2 gap-2.5 px-4 py-2">
        <div className="md-qs" data-on={online}>
          <WifiGlyph size={20} />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">Internet</span>
            <span className="block text-[12px] opacity-75">{online ? "Connected" : "Offline"}</span>
          </span>
        </div>
        <button type="button" className="md-qs" data-on={dark} aria-pressed={dark} onClick={() => settings.setTheme(dark ? "light" : "dark")}>
          <Moon size={20} weight="fill" />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">Dark theme</span>
            <span className="block text-[12px] opacity-75">{dark ? "On" : "Off"}</span>
          </span>
        </button>
        <button type="button" className="md-qs" data-on={settings.nightLight} aria-pressed={settings.nightLight} onClick={() => settings.setNightLight(!settings.nightLight)}>
          <SunDim size={21} weight="fill" />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">Night Light</span>
            <span className="block text-[12px] opacity-75">{settings.nightLight ? "On" : "Off"}</span>
          </span>
        </button>
        <button type="button" className="md-qs" data-on={playing} aria-pressed={playing} onClick={usePlayer.getState().toggle}>
          {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">{TRACKS[index].title}</span>
            <span className="block text-[12px] opacity-75">{playing ? "Playing" : "Music"}</span>
          </span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-3 px-5 py-2">
        <SunDim size={20} weight="fill" className="shrink-0 text-fg2" />
        <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
      </div>
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-3">
        <span className="text-[14px] font-medium">Notifications</span>
        {has && (
          <button type="button" className="md-text-btn" onClick={() => useSession.getState().clearNotices()}>
            Clear all
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <NoticeList empty="No notifications" onOpen={onClose} />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 px-4 pb-2">
        <button
          type="button"
          className="md-icon-btn"
          aria-label="Settings"
          onClick={() => {
            onClose();
            launch("settings");
          }}
        >
          <GearSix size={22} weight="fill" />
        </button>
        <button type="button" className="md-icon-btn" aria-label="Power" onClick={onPower}>
          <Power size={22} weight="bold" />
        </button>
      </div>
      <button type="button" className="mx-auto mb-1 grid h-5 w-20 shrink-0 place-items-center" aria-label="Close" onClick={onClose}>
        <span className="h-1 w-9 rounded-full bg-fg3" />
      </button>
    </motion.div>
  );
}

function PowerMenu({ onClose }: { onClose: () => void }) {
  const { power } = useSession.getState();
  return (
    <motion.div
      className="fixed inset-0 z-[3200] grid place-items-center bg-black/55 p-8"
      role="dialog"
      aria-label="Power menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div className="md-power grid w-full max-w-[300px] grid-cols-2 gap-3 p-4" data-panel initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}>
        <button type="button" autoFocus className="md-power-btn" onClick={() => power("shutdown")}>
          <Power size={28} weight="bold" />
          Power off
        </button>
        <button type="button" className="md-power-btn" onClick={() => power("restart")}>
          <ArrowClockwise size={28} weight="bold" />
          Restart
        </button>
        <button type="button" className="md-power-btn col-span-2 !h-12 !flex-row" onClick={() => power("lock")}>
          <LockSimple size={20} weight="fill" />
          Lock
        </button>
        <p className="col-span-2 text-center text-[12.5px] text-fg2">Restart to choose another operating system.</p>
      </motion.div>
    </motion.div>
  );
}

function NavBar({ panel, close, tone }: { panel: Panel | null; close: () => void; tone: "light" | "auto" }) {
  return (
    <div className="md-nav fixed inset-x-0 bottom-0 z-[3100] flex items-center justify-around px-10" data-tone={tone} role="toolbar" aria-label="Navigation">
      <button type="button" className="md-nav-key" aria-label="Back" onClick={() => (panel ? close() : phoneBack())}>
        <Triangle size={17} weight="fill" className="-rotate-90" />
      </button>
      <button
        type="button"
        className="md-nav-key"
        aria-label="Home"
        onClick={() => {
          close();
          usePhone.getState().home();
        }}
      >
        <Circle size={17} weight="fill" />
      </button>
      <button
        type="button"
        className="md-nav-key"
        aria-label="Recent apps"
        onClick={() => {
          close();
          usePhone.getState().setSwitcher(!usePhone.getState().switcher);
        }}
      >
        <Square size={15} weight="fill" />
      </button>
    </div>
  );
}

function Phone() {
  const { panel, toggle, close, open: openPanel } = usePanel<Panel>();
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  useWelcome("Swipe up on the home screen for every app. Pull the status bar down for quick settings; the power button there restarts into another system.");
  useWindowEvent("keydown", (e) => {
    if (e.key === "Escape" && panel) close();
  });
  const overWallpaper = (!current && panel === null) || switcher || current === "terminal";
  return (
    <>
      <Home openPanel={openPanel} />
      <PhoneHost variant="android" />
      <StatusBar tone={overWallpaper ? "light" : "auto"} onOpen={() => toggle("shade")} />
      <Banner className="fixed inset-x-3" style={{ top: "calc(var(--sb-h) + 4px)" }} from={{ y: -70 }} />
      <AnimatePresence>
        {panel === "drawer" && <Drawer key="drawer" onClose={close} />}
        {panel === "search" && <Search key="search" onClose={close} />}
        {panel === "shade" && <Shade key="shade" onClose={close} onPower={() => openPanel("power")} />}
        {panel === "power" && <PowerMenu key="power" onClose={close} />}
      </AnimatePresence>
      <NavBar panel={panel} close={close} tone={overWallpaper ? "light" : "auto"} />
    </>
  );
}

export default function AndroidPhone() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="android">
      <ShellWallpaper />
      {phase !== "boot" && (
        <div className="absolute inset-0" inert={phase !== "desktop"}>
          <Phone />
        </div>
      )}
      <AnimatePresence>
        {phase === "login" && <Lock key="lock" />}
        {phase === "boot" && <Boot key="boot" />}
      </AnimatePresence>
    </ShellRoot>
  );
}
