"use client";

import "@fontsource-variable/open-sans";
import "./wp.css";
import { ArrowClockwise, ArrowLeft, ArrowRight, GearSix, MagnifyingGlass, Moon, Power, SunDim } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { APPS, appName, launchable } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Banner, NoticeList } from "@/components/notifications";
import { PhoneHost } from "@/components/phone-host";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { currentJob, profile, projects, skills } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useDark } from "@/hooks/use-dark";
import { useLauncher } from "@/hooks/use-launcher";
import { useLongPress } from "@/hooks/use-long-press";
import { useNow } from "@/hooks/use-now";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { DAYS, MONTHS, time12 } from "@/lib/format";
import { launch, originOf, phoneBack } from "@/lib/launch";
import { TRACKS } from "@/lib/synth";
import { usePhone } from "@/stores/phone";
import { usePlayer } from "@/stores/player";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId } from "@/types";
import { WinLogo } from "./win-logo";

type Panel = "action" | "search";
type Size = "small" | "medium" | "wide";

function open(id: AppId, el: Element | null) {
  launch(id, {}, { origin: originOf(el) });
}

function Boot() {
  const skip = useBootTimer(1900);
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-[5000] grid cursor-default place-items-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Starting up. Tap to skip"
      onClick={skip}
    >
      <span style={{ animation: "k-fade-in 0.7s ease-out both" }}>
        <WinLogo size={78} />
      </span>
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
      className="fixed inset-0 z-[2500] cursor-default text-left text-white outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: "-100%", transition: { duration: 0.34, ease: [0.3, 0, 0.2, 1] } }}
      aria-label="Lock screen. Tap or swipe up to unlock"
      onClick={unlock}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 50) unlock();
        start.current = null;
      }}
    >
      <ShellWallpaper />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute bottom-[11%] left-6 block">
        <span className="block text-[98px] font-light leading-[0.95] tracking-tight">{time12(now)}</span>
        <span className="mt-2 block text-[26px] font-light leading-tight">{DAYS[d.getDay()]}</span>
        <span className="block text-[26px] font-light leading-tight">
          {MONTHS[d.getMonth()]} {d.getDate()}
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-5 text-center text-[13px] opacity-70">swipe up or tap to unlock</span>
    </motion.button>
  );
}

function StatusBar({ onOpen }: { onOpen: () => void }) {
  const now = useNow(1000);
  return (
    <button type="button" className="wp-status fixed inset-x-0 top-0 z-[3000] flex items-center justify-between px-3.5" aria-label="Open action centre" data-panel-trigger onClick={onOpen}>
      <span className="flex items-center gap-2">
        <WifiGlyph size={14} />
      </span>
      <span className="flex items-center gap-2 tabular-nums">
        <BatteryGlyph size={17} />
        {time12(now)}
      </span>
    </button>
  );
}

function LiveTile({
  id,
  size,
  back,
  delay = 0,
  children,
}: {
  id: AppId;
  size: Size;
  back?: ReactNode;
  delay?: number;
  children?: ReactNode;
}) {
  const Glyph = APPS[id].glyphs?.wp ?? APPS[id].glyph;
  const label = appName(id, "wp");
  return (
    <button type="button" className="wp-tile" data-size={size} data-live={back ? true : undefined} aria-label={label} onClick={(e) => open(id, e.currentTarget)}>
      <span className="wp-tile-flip" style={{ animationDelay: `${delay}s` }}>
        <span className="wp-tile-face">
          {children ?? <Glyph size={size === "small" ? 30 : 46} weight="regular" />}
          {size !== "small" && <span className="wp-tile-label">{label}</span>}
        </span>
        {back && (
          <span className="wp-tile-face wp-tile-back">
            {back}
            <span className="wp-tile-label">{label}</span>
          </span>
        )}
      </span>
    </button>
  );
}

function Start({ toggle }: { toggle: (p: Panel) => void }) {
  const now = useNow(60_000);
  const d = new Date(now);
  const scroller = useRef<HTMLDivElement>(null);
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const apps = launchable("wp")
    .map((id) => ({ id, name: appName(id, "wp") }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const letters = [...new Set(apps.map((a) => a.name[0].toLowerCase()))];
  const goTo = (page: number) => scroller.current?.scrollTo({ left: page * scroller.current.clientWidth, behavior: "smooth" });

  return (
    <div
      ref={scroller}
      className="wp-start absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
      style={{ paddingTop: "var(--sb-h)", paddingBottom: "var(--nav-h)" }}
    >
      <section className="wp-page" aria-label="Start screen">
        <div className="wp-tiles">
          <LiveTile id="about" size="medium" delay={1}
            back={<span className="wp-tile-text"><b>{profile.name}</b>{profile.role}</span>}
          >
            <span className="text-[44px] font-light leading-none">{profile.initials}</span>
          </LiveTile>
          <LiveTile id="projects" size="medium" delay={4}
            back={<span className="wp-tile-text"><b>{projects.length} live</b>{projects.map((p) => p.name).join(" · ")}</span>}
          />
          <LiveTile id="experience" size="wide" delay={7}
            back={<span className="wp-tile-text"><b>{currentJob.company}</b>{currentJob.role}<br />{currentJob.period}</span>}
          />
          <LiveTile id="contact" size="small" />
          <LiveTile id="browser" size="small" />
          <LiveTile id="skills" size="medium" delay={2.5}
            back={<span className="wp-tile-text"><b>{skills.length} skills</b>{skills.slice(0, 5).map((s) => s.name.split(" ")[0]).join(" · ")}</span>}
          />
          <LiveTile id="resume" size="small" />
          <LiveTile id="terminal" size="small" />
          <LiveTile id="calendar" size="medium">
            <span className="block text-left">
              <span className="block text-[15px] lowercase">{DAYS[d.getDay()].slice(0, 3)}</span>
              <span className="block text-[52px] font-light leading-none">{d.getDate()}</span>
            </span>
          </LiveTile>
          <LiveTile id="files" size="small" />
          <LiveTile id="settings" size="small" />
          <LiveTile id="notes" size="small" />
          <LiveTile id="clock" size="small" />
          <LiveTile id="music" size="wide" delay={5.5}
            back={<span className="wp-tile-text"><b>{playing ? "now playing" : "music"}</b>{TRACKS[index].title}<br />{TRACKS[index].mood}</span>}
          />
          <LiveTile id="photos" size="medium" />
          <LiveTile id="calculator" size="small" />
          <LiveTile id="paint" size="small" />
          <LiveTile id="mines" size="small" />
          <LiveTile id="snake" size="small" />
          <LiveTile id="tips" size="wide" />
        </div>
        <div className="flex justify-end px-1 pb-6 pt-4">
          <button type="button" className="wp-round" aria-label="All apps" onClick={() => goTo(1)}>
            <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </section>

      <section className="wp-page" aria-label="All apps">
        <div className="flex items-center gap-3 pb-3 pt-1">
          <button type="button" className="wp-round" aria-label="Back to Start" onClick={() => goTo(0)}>
            <ArrowLeft size={20} weight="bold" />
          </button>
          <button type="button" className="wp-round" aria-label="Search" data-panel-trigger onClick={() => toggle("search")}>
            <MagnifyingGlass size={20} weight="bold" />
          </button>
        </div>
        {letters.map((letter) => (
          <div key={letter}>
            <div className="wp-letter">{letter}</div>
            {apps
              .filter((a) => a.name[0].toLowerCase() === letter)
              .map((a) => (
                <button key={a.id} type="button" className="wp-app-row" onClick={(e) => open(a.id, e.currentTarget.firstElementChild)}>
                  <AppIcon id={a.id} size={48} />
                  <span className="truncate text-[22px] font-light">{a.name}</span>
                </button>
              ))}
          </div>
        ))}
        <div className="h-8" />
      </section>
    </div>
  );
}

function Search({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose, 8);
  return (
    <motion.div
      className="wp-sheet fixed inset-0 z-[2800] flex flex-col"
      style={{ paddingTop: "var(--sb-h)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="Search"
      data-panel
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <div className="px-5 pt-4">
        <div className="text-[13px] font-semibold uppercase tracking-[0.04em]">{profile.name}</div>
        <h1 className="-ml-0.5 text-[44px] font-light lowercase leading-[1.15]">search</h1>
        <input
          autoFocus
          value={l.query}
          onChange={(e) => l.setQuery(e.target.value)}
          onKeyDown={l.onKeyDown}
          placeholder="apps, projects, files, settings"
          aria-label="Search"
          className="wp-input mt-2 h-11 w-full px-3 text-[17px] outline-none"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
        {l.query.trim() && l.hits.length === 0 && <p className="pt-4 text-[17px] text-fg2">no results for &quot;{l.query}&quot;</p>}
        {!l.query.trim() && <p className="pt-4 text-[17px] text-fg2">type to search everything on this phone.</p>}
        {l.hits.map((h, i) => (
          <button key={h.id} type="button" className="wp-app-row" data-on={i === l.index} onClick={() => l.run(h)}>
            <AppIcon id={h.app} size={48} />
            <span className="min-w-0 text-left">
              <span className="block truncate text-[20px] font-light leading-tight">{h.title}</span>
              <span className="block truncate text-[13px] text-fg2">{h.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ActionCentre({ onClose }: { onClose: () => void }) {
  const dark = useDark();
  const settings = useSettings();
  const has = useSession((s) => s.notices.length > 0);
  const { power } = useSession.getState();
  const quick = [
    { label: dark ? "dark" : "light", icon: Moon, on: dark, run: () => settings.setTheme(dark ? "light" : "dark") },
    { label: "night light", icon: SunDim, on: settings.nightLight, run: () => settings.setNightLight(!settings.nightLight) },
    { label: "restart", icon: ArrowClockwise, on: false, run: () => power("restart") },
    { label: "power off", icon: Power, on: false, run: () => power("shutdown") },
  ];
  return (
    <motion.div
      className="wp-sheet fixed inset-x-0 top-0 z-[2900] flex max-h-full flex-col"
      style={{ paddingTop: "var(--sb-h)", height: "calc(100% - var(--nav-h))" }}
      role="dialog"
      aria-label="Action centre"
      data-panel
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.28, ease: [0.1, 0.9, 0.2, 1] }}
    >
      <div className="grid shrink-0 grid-cols-4 gap-1 px-1 pt-1">
        {quick.map((q) => {
          const QuickIcon = q.icon;
          return (
            <button key={q.label} type="button" className="wp-quick" data-on={q.on} aria-pressed={q.on} onClick={q.run}>
              <QuickIcon size={24} />
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-[13px] uppercase tracking-[0.04em]">
        <button
          type="button"
          className="flex items-center gap-1.5"
          onClick={() => {
            onClose();
            launch("settings");
          }}
        >
          <GearSix size={15} />
          all settings
        </button>
        {has && (
          <button type="button" onClick={() => useSession.getState().clearNotices()}>
            clear all
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <NoticeList empty="no notifications" onOpen={onClose} />
      </div>
      <button type="button" className="wp-grabber shrink-0" aria-label="Close action centre" onClick={onClose}>
        <span />
      </button>
    </motion.div>
  );
}

function NavBar({ panel, toggle, close }: { panel: Panel | null; toggle: (p: Panel) => void; close: () => void }) {
  const back = useLongPress(
    () => {
      close();
      usePhone.getState().setSwitcher(true);
    },
    () => {
      if (panel) close();
      else phoneBack();
    },
  );
  return (
    <div className="wp-nav fixed inset-x-0 bottom-0 z-[3100] flex items-center justify-around" role="toolbar" aria-label="Navigation">
      <button type="button" className="wp-nav-key" aria-label="Back, hold for the app switcher" {...back}>
        <ArrowLeft size={22} weight="bold" />
      </button>
      <button
        type="button"
        className="wp-nav-key"
        aria-label="Start"
        onClick={() => {
          close();
          usePhone.getState().home();
        }}
      >
        <WinLogo size={22} />
      </button>
      <button type="button" className="wp-nav-key" aria-label="Search" data-panel-trigger onClick={() => toggle("search")}>
        <MagnifyingGlass size={22} weight="bold" />
      </button>
    </div>
  );
}

function Phone() {
  const { panel, toggle, close } = usePanel<Panel>();
  useWelcome("Tiles open apps. The back key steps back, and holding it opens the app switcher. Tap the status bar for the action centre.");
  useWindowEvent("keydown", (e) => {
    if (e.key === "Escape" && panel) close();
  });
  return (
    <>
      <Start toggle={toggle} />
      <PhoneHost variant="wp" />
      <StatusBar onOpen={() => toggle("action")} />
      <Banner className="fixed inset-x-0 !rounded-none" style={{ top: 0 }} from={{ y: -80 }} />
      <AnimatePresence>
        {panel === "search" && <Search key="search" onClose={close} />}
        {panel === "action" && <ActionCentre key="action" onClose={close} />}
      </AnimatePresence>
      <NavBar panel={panel} toggle={toggle} close={close} />
    </>
  );
}

export default function WindowsPhone() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="wp">
      <div className="absolute inset-0 bg-bg" />
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
