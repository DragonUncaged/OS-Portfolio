"use client";

import "@fontsource-variable/open-sans";
import "./windows.css";
import {
  ArrowClockwise,
  ArrowRight,
  Cards,
  Desktop as DesktopGlyph,
  FileText,
  Folder,
  GearSix,
  LockSimple,
  MagnifyingGlass,
  Moon,
  Power,
  SpeakerHigh,
  SunDim,
  Trash,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { appName, launchable } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Avatar, Slider } from "@/components/kit";
import { showContextMenu, toggleDropdown, type MenuItem } from "@/components/menu";
import { Banner, NoticeList } from "@/components/notifications";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { WindowLayer } from "@/components/window-layer";
import { profile, projects } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useDark } from "@/hooks/use-dark";
import { useLauncher } from "@/hooks/use-launcher";
import { useNow } from "@/hooks/use-now";
import { useOnline } from "@/hooks/use-online";
import { usePanel } from "@/hooks/use-panel";
import { useSuperKey } from "@/hooks/use-super-key";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { DAYS, MONTHS, dateLong, dateNumeric, time12m } from "@/lib/format";
import { launch } from "@/lib/launch";
import { KIND_LABEL, grouped } from "@/lib/search";
import { WALLPAPERS } from "@/lib/wallpapers";
import { useFamily, useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
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

function StartMenu({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose, 8);
  const pinned = launchable("windows");
  const recommended = [
    { label: "Resume", note: "Document", icon: <AppIcon id="resume" size={30} />, open: () => launch("resume") },
    { label: "about.md", note: "Markdown document", icon: <FileText size={28} weight="duotone" className="text-accent" />, open: () => launch("viewer", { path: "about.md" }) },
    ...projects.slice(0, 4).map((p) => ({
      label: p.name,
      note: p.tech.join(" · "),
      icon: <AppIcon id="projects" size={30} />,
      open: () => launch("projects", { project: p.slug }),
    })),
  ];
  return (
    <motion.div
      className="win-flyout win-start fixed left-1/2 z-[1800] flex w-[640px] max-w-[calc(100vw-16px)] flex-col"
      style={{ bottom: TASKBAR_H + 12, maxHeight: `calc(100vh - ${TASKBAR_H + 24}px)` }}
      data-panel
      role="dialog"
      aria-label="Start"
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 30, x: "-50%" }}
      transition={{ duration: 0.2, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <label className="win-start-search m-6 mb-2 flex h-9 shrink-0 items-center gap-2.5 px-3.5">
        <MagnifyingGlass size={16} className="shrink-0 text-accent" />
        <input
          autoFocus
          value={l.query}
          onChange={(e) => l.setQuery(e.target.value)}
          onKeyDown={l.onKeyDown}
          placeholder="Search for apps, projects, files and settings"
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-fg3"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-3">
        {l.query.trim() ? (
          <div className="pb-2 pt-2">
            {l.hits.length === 0 && <p className="py-10 text-center text-[13.5px] text-fg2">No results for &quot;{l.query}&quot;</p>}
            {grouped(l.hits).map((g) => (
              <div key={g.kind}>
                <div className="px-2 pb-1 pt-2.5 text-[12.5px] font-semibold">{KIND_LABEL[g.kind]}</div>
                {g.hits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="win-result"
                    data-on={l.hits.indexOf(h) === l.index}
                    onPointerEnter={() => l.setIndex(l.hits.indexOf(h))}
                    onClick={() => l.run(h)}
                  >
                    <AppIcon id={h.app} size={26} />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[13.5px]">{h.title}</span>
                      <span className="block truncate text-[12px] text-fg2">{h.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-2 pb-2 pt-3">
              <span className="text-[14px] font-semibold">Pinned</span>
              <span className="text-[12px] text-fg2">{pinned.length} apps</span>
            </div>
            <div className="grid grid-cols-4 gap-y-1 sm:grid-cols-6">
              {pinned.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="win-pin"
                  onClick={() => {
                    onClose();
                    launch(id);
                  }}
                >
                  <AppIcon id={id} size={32} />
                  <span className="line-clamp-2 max-w-full text-[12px] leading-tight">{appName(id, "windows")}</span>
                </button>
              ))}
            </div>
            <div className="px-2 pb-2 pt-5 text-[14px] font-semibold">Recommended</div>
            <div className="grid grid-cols-1 gap-x-2 sm:grid-cols-2">
              {recommended.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className="win-result"
                  onClick={() => {
                    onClose();
                    r.open();
                  }}
                >
                  {r.icon}
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-[13px]">{r.label}</span>
                    <span className="block truncate text-[12px] text-fg2">{r.note}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="win-start-foot flex h-16 shrink-0 items-center justify-between px-10">
        <button
          type="button"
          className="win-result !w-auto !pr-4"
          onClick={() => {
            onClose();
            launch("about");
          }}
        >
          <Avatar size={32} />
          <span className="text-[13px]">{profile.name}</span>
        </button>
        <button
          type="button"
          className="k-icon-btn !size-10"
          aria-label="Power"
          data-menu-trigger
          onClick={(e) => toggleDropdown(e.currentTarget, "start-power", powerItems(), { side: "top", align: "end", gap: 8 })}
        >
          <Power size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function QuickSettings({ onClose }: { onClose: () => void }) {
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  return (
    <motion.div
      className="win-flyout fixed right-3 z-[1800] w-[360px] max-w-[calc(100vw-24px)]"
      style={{ bottom: TASKBAR_H + 12 }}
      data-panel
      role="dialog"
      aria-label="Quick settings"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.18, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <div className="grid grid-cols-3 gap-2 p-5 pb-3">
        <div className="text-center">
          <div className="win-quick" data-on={online}>
            <WifiGlyph size={18} />
          </div>
          <div className="mt-1.5 text-[12px]">{online ? "Connected" : "Offline"}</div>
        </div>
        <div className="text-center">
          <button type="button" className="win-quick" data-on={dark} aria-pressed={dark} aria-label="Dark mode" onClick={() => settings.setTheme(dark ? "light" : "dark")}>
            <Moon size={18} weight={dark ? "fill" : "regular"} />
          </button>
          <div className="mt-1.5 text-[12px]">Dark mode</div>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="win-quick"
            data-on={settings.nightLight}
            aria-pressed={settings.nightLight}
            aria-label="Night light"
            onClick={() => settings.setNightLight(!settings.nightLight)}
          >
            <SunDim size={19} weight={settings.nightLight ? "fill" : "regular"} />
          </button>
          <div className="mt-1.5 text-[12px]">Night light</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-2">
        <SunDim size={18} className="shrink-0" />
        <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
      </div>
      <div className="flex items-center gap-3 px-6 pb-4 pt-2">
        <SpeakerHigh size={18} className="shrink-0" />
        <Slider label="Volume" value={settings.volume} onChange={settings.setVolume} />
      </div>
      <div className="win-start-foot flex h-12 items-center justify-between px-5 text-[12.5px]">
        <BatteryGlyph size={20} showPercent />
        <span className="flex-1" />
        <button
          type="button"
          className="k-icon-btn"
          aria-label="All settings"
          title="All settings"
          onClick={() => {
            onClose();
            launch("settings");
          }}
        >
          <GearSix size={17} />
        </button>
      </div>
    </motion.div>
  );
}

function CalendarFlyout({ onClose }: { onClose: () => void }) {
  const now = useNow(60_000);
  const today = new Date(now);
  const first = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const count = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const has = useSession((s) => s.notices.length > 0);
  return (
    <motion.div
      className="fixed right-3 z-[1800] flex w-[340px] max-w-[calc(100vw-24px)] flex-col gap-3"
      style={{ bottom: TASKBAR_H + 12, maxHeight: `calc(100vh - ${TASKBAR_H + 24}px)` }}
      data-panel
      role="dialog"
      aria-label="Notifications and calendar"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.2, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <div className="win-flyout flex min-h-0 flex-col p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[14px] font-semibold">Notifications</span>
          {has && (
            <button type="button" className="k-btn !min-h-7 !px-2.5 !text-[12px]" onClick={() => useSession.getState().clearNotices()}>
              Clear all
            </button>
          )}
        </div>
        <div className="min-h-0 overflow-y-auto">
          <NoticeList empty="No new notifications" onOpen={onClose} />
        </div>
      </div>
      <div className="win-flyout shrink-0 p-4">
        <button type="button" className="mb-3 block text-left text-[14px] font-semibold" onClick={() => (onClose(), launch("calendar"))}>
          {dateLong(now)}
        </button>
        <div className="mb-1 text-[13px] font-semibold">
          {MONTHS[today.getMonth()]} {today.getFullYear()}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-[12px]">
          {DAYS.map((d) => (
            <span key={d} className="py-1 font-semibold">
              {d.slice(0, 2)}
            </span>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={`mx-auto grid size-8 place-items-center rounded-full ${i + 1 === today.getDate() ? "bg-accent font-semibold text-accent-fg" : ""}`}>
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DesktopIcons() {
  const family = useFamily();
  const [selected, setSelected] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const items = [
    { id: "pc", label: "This PC", icon: <DesktopGlyph size={44} weight="duotone" className="text-[#7cc4ff]" />, open: () => launch("files") },
    { id: "bin", label: "Recycle Bin", icon: <Trash size={44} weight="duotone" className="text-white" />, open: () => launch("files", { section: "trash" }) },
    { id: "projects", label: "Projects", icon: <Folder size={46} weight="fill" className="text-[#f8c84a]" />, open: () => launch("files", { path: "Projects" }) },
    { id: "resume", label: "Resume", icon: <AppIcon id="resume" size={42} />, open: () => launch("resume") },
    { id: "about", label: "About me", icon: <AppIcon id="about" size={42} />, open: () => launch("about") },
  ];
  return (
    <div
      className="absolute inset-0 z-[1]"
      style={{ bottom: TASKBAR_H }}
      onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      onContextMenu={(e) =>
        showContextMenu(e, [
          {
            label: "Refresh",
            icon: ArrowClockwise,
            onSelect: () => {
              setRefreshing(true);
              window.setTimeout(() => setRefreshing(false), 160);
            },
          },
          {
            label: "Next desktop background",
            onSelect: () => {
              const list = WALLPAPERS[family];
              const settings = useSettings.getState();
              const at = list.findIndex((w) => w.id === settings.prefs[family].wallpaper);
              settings.setWallpaper(family, list[(at + 1) % list.length].id);
            },
          },
          { type: "separator" },
          { label: "Open in Terminal", onSelect: () => launch("terminal") },
          { type: "separator" },
          { label: "Display settings", onSelect: () => launch("settings", { section: "display" }) },
          { label: "Personalize", onSelect: () => launch("settings", { section: "appearance" }) },
        ])
      }
    >
      <div
        className="pointer-events-none absolute left-1.5 top-1.5 flex max-h-full flex-col flex-wrap content-start gap-1"
        style={{ visibility: refreshing ? "hidden" : "visible" }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="win-desktop-icon pointer-events-auto"
            data-on={selected === item.id}
            onClick={() => setSelected(item.id)}
            onDoubleClick={item.open}
            onKeyDown={(e) => e.key === "Enter" && item.open()}
          >
            <span className="grid h-[48px] place-items-center drop-shadow-[0_2px_3px_rgb(0_0_0/0.4)]">{item.icon}</span>
            <span className="win-desktop-label">{item.label}</span>
          </button>
        ))}
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
      <DesktopIcons />
      <AnimatePresence>
        {overview && (
          <motion.button
            type="button"
            key="taskview"
            aria-label="Leave task view"
            className="win-taskview fixed inset-0 z-[9] cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => useWM.getState().setOverview(false)}
          >
            <span className="win-taskview-desk absolute left-1/2 -translate-x-1/2" style={{ bottom: TASKBAR_H + 18 }}>
              Desktop 1
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <WindowLayer
        snapping
        insets={{ top: 0, right: 0, bottom: TASKBAR_H, left: 0 }}
        overviewInsets={{ top: 56, right: 56, bottom: TASKBAR_H + 96, left: 56 }}
      />
      <Taskbar panel={panel} toggle={toggle} />
      <Banner className="fixed right-3 w-[364px] max-w-[calc(100vw-24px)]" style={{ bottom: TASKBAR_H + 12 }} from={{ x: 80 }} />
      <AnimatePresence>
        {panel === "start" && <StartMenu key="start" onClose={close} />}
        {panel === "quick" && <QuickSettings key="quick" onClose={close} />}
        {panel === "calendar" && <CalendarFlyout key="calendar" onClose={close} />}
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
