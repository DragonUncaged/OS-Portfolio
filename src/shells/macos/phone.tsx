"use client";

import "./ios.css";
import {
  ArrowClockwise,
  Command,
  Flashlight,
  MagnifyingGlass,
  Moon,
  Pause,
  Play,
  Power,
  SkipForward,
  SpeakerHigh,
  Sun,
  SunDim,
  Waveform,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { APPS, appName, launchable, type AppCategory } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Avatar, Slider } from "@/components/kit";
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
import { DAYS, MONTHS, dateLong, time12 } from "@/lib/format";
import { launch, originOf, phoneBack } from "@/lib/launch";
import { TRACKS } from "@/lib/synth";
import { usePhone } from "@/stores/phone";
import { usePlayer } from "@/stores/player";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId } from "@/types";

type Panel = "control" | "notifications" | "search" | "power";

const DOCK: AppId[] = ["about", "projects", "browser", "contact"];
const PAGE_ONE: AppId[] = ["experience", "skills", "resume", "terminal", "files", "settings", "notes", "calendar", "clock", "music", "photos", "tips"];
const CATEGORY_LABEL: Record<AppCategory, string> = { portfolio: "Portfolio", system: "System", utility: "Utilities", game: "Games" };

function open(id: AppId, el: Element | null) {
  launch(id, {}, { origin: originOf(el) });
}

function Boot() {
  const skip = useBootTimer(1900);
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-[5000] grid cursor-default place-items-center bg-black text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Starting up. Tap to skip"
      onClick={skip}
    >
      <Command size={72} style={{ animation: "k-fade-in 0.8s ease-out both" }} />
    </motion.button>
  );
}

function StatusBar({ tone, toggle }: { tone: "light" | "auto"; toggle: (p: Panel) => void }) {
  const now = useNow(1000);
  const playing = usePlayer((s) => s.playing);
  return (
    <div className="ios-status fixed inset-x-0 top-0 z-[3000] flex items-center justify-between px-7" data-tone={tone}>
      <button type="button" className="ios-status-side justify-start" aria-label="Notifications" data-panel-trigger onClick={() => toggle("notifications")}>
        <span className="text-[16px] font-semibold tabular-nums">{time12(now)}</span>
      </button>
      <div className="ios-island" data-live={playing || undefined} aria-hidden="true">
        {playing && <Waveform size={15} weight="bold" className="text-[#ff7ab8]" />}
      </div>
      <button type="button" className="ios-status-side justify-end gap-1.5" aria-label="Control Centre" data-panel-trigger onClick={() => toggle("control")}>
        <WifiGlyph size={17} />
        <BatteryGlyph size={25} />
      </button>
    </div>
  );
}

function Lock() {
  const now = useNow(1000);
  const [torch, setTorch] = useState(false);
  const start = useRef<number | null>(null);
  const unlock = () => useSession.getState().login();
  return (
    <motion.div
      className="fixed inset-0 z-[2500] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: "-100%", transition: { duration: 0.38, ease: [0.3, 0, 0.2, 1] } }}
      onClick={unlock}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 60) unlock();
        start.current = null;
      }}
    >
      <ShellWallpaper />
      <div className="absolute inset-0 bg-black/15" />
      {torch && <div className="pointer-events-none absolute inset-0 bg-white/35 mix-blend-screen" />}
      <div className="relative flex h-full flex-col items-center px-6" style={{ paddingTop: "calc(var(--sb-h) + 34px)" }}>
        <div className="text-[21px] font-medium opacity-90">{dateLong(now)}</div>
        <div className="ios-lock-time">{time12(now)}</div>
        <div className="mt-auto flex w-full items-end justify-between pb-12">
          <button
            type="button"
            className="ios-lock-btn"
            data-on={torch}
            aria-label="Torch"
            aria-pressed={torch}
            onClick={(e) => {
              e.stopPropagation();
              setTorch((v) => !v);
            }}
          >
            <Flashlight size={24} weight="fill" />
          </button>
          <button type="button" autoFocus className="pb-1 text-[15px] font-medium outline-none">
            <span className="ios-unlock block">Swipe up or tap to unlock</span>
          </button>
          <span className="size-[50px]" />
        </div>
      </div>
      <div className="ios-home-bar absolute bottom-2 left-1/2 -translate-x-1/2 bg-white" />
    </motion.div>
  );
}

function Tile({ id, size = 62 }: { id: AppId; size?: number }) {
  return (
    <button type="button" className="ios-app" onClick={(e) => open(id, e.currentTarget.firstElementChild)}>
      <AppIcon id={id} size={size} />
      <span className="ios-app-label">{appName(id, "ios")}</span>
    </button>
  );
}

function Home({ toggle }: { toggle: (p: Panel) => void }) {
  const now = useNow(60_000);
  const today = new Date(now);
  const [page, setPage] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const rest = launchable("ios").filter((id) => !DOCK.includes(id) && !PAGE_ONE.includes(id));
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const byCategory = (Object.keys(CATEGORY_LABEL) as AppCategory[]).map((c) => ({
    category: c,
    apps: launchable("ios").filter((id) => APPS[id].category === c),
  }));
  const pages = 3;

  return (
    <div className="ios-home absolute inset-0 flex flex-col text-white" style={{ paddingTop: "calc(var(--sb-h) + 8px)" }}>
      <div
        ref={scroller}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        <section className="ios-page" aria-label="Home screen page 1">
          <div className="ios-grid">
            <button type="button" className="ios-widget col-span-2 row-span-2" onClick={(e) => open("about", e.currentTarget)}>
              <Avatar size={44} />
              <span className="mt-auto block text-[16px] font-semibold leading-tight">{profile.name}</span>
              <span className="block text-[12.5px] opacity-75">{profile.role}</span>
              <span className="mt-0.5 block truncate text-[11.5px] opacity-60">@ {currentJob.company}</span>
            </button>
            <button type="button" className="ios-widget col-span-2 row-span-2" onClick={(e) => open("calendar", e.currentTarget)}>
              <span className="block text-[12px] font-bold uppercase text-[#ff453a]">{DAYS[today.getDay()]}</span>
              <span className="block text-[44px] font-light leading-none">{today.getDate()}</span>
              <span className="mt-auto block text-[12.5px] opacity-75">{MONTHS[today.getMonth()]}</span>
              <span className="block text-[11.5px] opacity-60">Tap for calendar</span>
            </button>
            {PAGE_ONE.map((id) => (
              <Tile key={id} id={id} />
            ))}
          </div>
        </section>
        <section className="ios-page" aria-label="Home screen page 2">
          <div className="ios-grid">
            <button type="button" className="ios-widget col-span-4 row-span-2 !flex-row !items-center gap-3.5" onClick={(e) => open("music", e.currentTarget)}>
              <span
                className="grid aspect-square h-full max-h-[104px] shrink-0 place-items-center rounded-[14px]"
                style={{ background: `linear-gradient(140deg, ${TRACKS[index].color[0]}, ${TRACKS[index].color[1]})` }}
              >
                <Waveform size={34} weight="bold" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[11.5px] font-bold uppercase opacity-60">{playing ? "Now playing" : "Music"}</span>
                <span className="block truncate text-[18px] font-semibold">{TRACKS[index].title}</span>
                <span className="block truncate text-[12.5px] opacity-70">{TRACKS[index].mood}</span>
              </span>
            </button>
            {rest.map((id) => (
              <Tile key={id} id={id} />
            ))}
          </div>
        </section>
        <section className="ios-page" aria-label="App Library">
          <button type="button" className="ios-search-field mx-1 mb-4 flex h-10 w-[calc(100%-8px)] items-center gap-2 px-3.5 text-[16px]" onClick={() => toggle("search")}>
            <MagnifyingGlass size={17} />
            App Library
          </button>
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 px-1">
            {byCategory.map((g) => (
              <div key={g.category}>
                <div className="ios-pod grid grid-cols-2 gap-2.5 p-3">
                  {g.apps.slice(0, 4).map((id) => (
                    <button key={id} type="button" aria-label={appName(id, "ios")} onClick={(e) => open(id, e.currentTarget)}>
                      <AppIcon id={id} size={54} className="mx-auto" />
                    </button>
                  ))}
                </div>
                <div className="mt-1.5 text-center text-[12.5px]">{CATEGORY_LABEL[g.category]}</div>
                {g.apps.length > 4 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {g.apps.slice(4).map((id) => (
                      <button key={id} type="button" aria-label={appName(id, "ios")} onClick={(e) => open(id, e.currentTarget)}>
                        <AppIcon id={id} size={34} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2.5 pb-2.5 pt-1">
        <button type="button" className="ios-search-pill" data-panel-trigger onClick={() => toggle("search")}>
          <MagnifyingGlass size={12} weight="bold" />
          Search
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Home screen pages">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={i === pages - 1 ? "App Library" : `Page ${i + 1}`}
              className="ios-dot"
              data-on={i === page}
              onClick={() => scroller.current?.scrollTo({ left: i * scroller.current.clientWidth, behavior: "smooth" })}
            />
          ))}
        </div>
      </div>
      <div className="ios-dock mx-3 mb-3 flex shrink-0 justify-around px-2 py-3.5">
        {DOCK.map((id) => (
          <button key={id} type="button" aria-label={appName(id, "ios")} onClick={(e) => open(id, e.currentTarget)}>
            <AppIcon id={id} size={62} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Search({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose, 8);
  const apps = launchable("ios").slice(0, 8);
  return (
    <motion.div
      className="ios-sheet-bg fixed inset-0 z-[2800] flex flex-col text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 6px)" }}
      role="dialog"
      aria-label="Search"
      data-panel
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-2.5 px-4">
        <label className="ios-search-field flex h-10 min-w-0 flex-1 items-center gap-2 px-3">
          <MagnifyingGlass size={17} className="shrink-0 opacity-70" />
          <input
            autoFocus
            value={l.query}
            onChange={(e) => l.setQuery(e.target.value)}
            onKeyDown={l.onKeyDown}
            placeholder="Search"
            aria-label="Search"
            className="min-w-0 flex-1 bg-transparent text-[17px] text-white outline-none placeholder:text-white/55"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </label>
        <button type="button" className="text-[17px]" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4">
        {l.query.trim() ? (
          <div className="ios-search-results overflow-hidden">
            {l.hits.length === 0 && <p className="p-5 text-center text-[15px] opacity-70">No results</p>}
            {l.hits.map((h, i) => (
              <button key={h.id} type="button" className="ios-search-row" data-on={i === l.index} onClick={() => l.run(h)}>
                <AppIcon id={h.app} size={34} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[16px]">{h.title}</span>
                  <span className="block truncate text-[12.5px] opacity-60">{h.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-2 text-[13px] font-semibold opacity-70">Suggestions</div>
            <div className="ios-search-results grid grid-cols-4 gap-y-4 p-4">
              {apps.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="ios-app"
                  onClick={(e) => {
                    onClose();
                    open(id, e.currentTarget);
                  }}
                >
                  <AppIcon id={id} size={52} />
                  <span className="ios-app-label">{appName(id, "ios")}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function ControlCentre({ onPower }: { onPower: () => void }) {
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const player = usePlayer.getState();
  return (
    <motion.div
      className="ios-sheet-bg fixed inset-0 z-[2800] overflow-y-auto text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 14px)" }}
      role="dialog"
      aria-label="Control Centre"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="mx-auto grid w-full max-w-[360px] grid-cols-4 gap-3 px-5 pb-12"
        data-panel
        initial={{ scale: 0.86, y: -30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <div className="ios-cc col-span-2 flex flex-col justify-between gap-3 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="ios-cc-round" data-on={online}>
              <WifiGlyph size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">Wi-Fi</span>
              <span className="block text-[11.5px] opacity-65">{online ? "Connected" : "Offline"}</span>
            </span>
          </div>
          <button type="button" className="flex items-center gap-2.5 text-left" aria-pressed={dark} onClick={() => settings.setTheme(dark ? "light" : "dark")}>
            <span className="ios-cc-round" data-on={dark}>
              {dark ? <Moon size={19} weight="fill" /> : <Sun size={19} weight="fill" />}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">Dark Mode</span>
              <span className="block text-[11.5px] opacity-65">{dark ? "On" : "Off"}</span>
            </span>
          </button>
        </div>
        <div className="ios-cc col-span-2 flex flex-col justify-between p-3.5">
          <button type="button" className="flex items-center gap-2.5 text-left" onClick={() => launch("music")}>
            <AppIcon id="music" size={34} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{TRACKS[index].title}</span>
              <span className="block text-[11.5px] opacity-65">{playing ? "Playing" : "Not playing"}</span>
            </span>
          </button>
          <div className="mt-3 flex justify-center gap-5">
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={player.toggle}>
              {playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
            </button>
            <button type="button" aria-label="Next track" onClick={player.next}>
              <SkipForward size={24} weight="fill" />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="ios-cc col-span-2 flex items-center gap-2.5 p-3.5 text-left"
          aria-pressed={settings.nightLight}
          onClick={() => settings.setNightLight(!settings.nightLight)}
        >
          <span className="ios-cc-round" data-on={settings.nightLight}>
            <SunDim size={20} weight="fill" />
          </span>
          <span className="text-[13px] font-semibold">Night Shift</span>
        </button>
        <button type="button" className="ios-cc col-span-2 flex items-center gap-2.5 p-3.5 text-left" onClick={onPower}>
          <span className="ios-cc-round">
            <Power size={19} weight="bold" />
          </span>
          <span className="text-[13px] font-semibold">Power</span>
        </button>
        <div className="ios-cc col-span-4 p-3.5">
          <div className="flex items-center gap-2.5">
            <SunDim size={20} className="shrink-0" />
            <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <SpeakerHigh size={20} className="shrink-0" />
            <Slider label="Volume" value={settings.volume} onChange={settings.setVolume} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NotificationCentre({ onClose }: { onClose: () => void }) {
  const now = useNow(1000);
  const has = useSession((s) => s.notices.length > 0);
  return (
    <motion.div
      className="ios-sheet-bg fixed inset-0 z-[2800] overflow-y-auto text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 20px)" }}
      role="dialog"
      aria-label="Notification Centre"
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4 pb-16" data-panel>
        <div className="text-center">
          <div className="text-[19px] font-medium opacity-90">{dateLong(now)}</div>
          <div className="text-[70px] font-semibold leading-none tracking-tight">{time12(now)}</div>
        </div>
        <div className="mb-2 mt-6 flex items-center justify-between">
          <span className="text-[19px] font-semibold">Notification Centre</span>
          {has && (
            <button type="button" className="ios-clear" aria-label="Clear all notifications" onClick={() => useSession.getState().clearNotices()}>
              <X size={13} weight="bold" />
            </button>
          )}
        </div>
        <NoticeList empty="No Older Notifications" onOpen={onClose} />
      </div>
    </motion.div>
  );
}

function PowerSheet({ onClose }: { onClose: () => void }) {
  const [x, setX] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const from = useRef<number | null>(null);
  const max = () => (track.current?.clientWidth ?? 280) - 64;
  return (
    <motion.div
      className="ios-sheet-bg fixed inset-0 z-[2900] flex flex-col items-center justify-between px-8 pb-14 text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 60px)" }}
      role="dialog"
      aria-label="Power"
      data-panel
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-[320px]">
        <div ref={track} className="ios-slide relative h-[64px] w-full overflow-hidden rounded-full">
          <span className="absolute inset-0 grid place-items-center pl-10 text-[17px] opacity-80" style={{ opacity: 0.8 - x / 200 }}>
            slide to power off
          </span>
          <button
            type="button"
            aria-label="Slide to power off (or press Enter)"
            className="absolute left-1 top-1 grid size-14 touch-none place-items-center rounded-full bg-white text-[#ff3b30]"
            style={{ transform: `translateX(${x}px)` }}
            onPointerDown={(e) => {
              from.current = e.clientX - x;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => from.current !== null && setX(Math.max(0, Math.min(max(), e.clientX - from.current)))}
            onPointerUp={() => {
              from.current = null;
              if (x > max() * 0.85) useSession.getState().power("shutdown");
              else setX(0);
            }}
            onKeyDown={(e) => e.key === "Enter" && useSession.getState().power("shutdown")}
          >
            <Power size={26} weight="bold" />
          </button>
        </div>
        <button type="button" className="ios-slide mt-5 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-full text-[17px]" onClick={() => useSession.getState().power("restart")}>
          <ArrowClockwise size={20} weight="bold" />
          Restart and choose another system
        </button>
      </div>
      <button type="button" className="flex flex-col items-center gap-2 text-[13px]" onClick={onClose}>
        <span className="ios-cc-round !size-14">
          <X size={24} weight="bold" />
        </span>
        Cancel
      </button>
    </motion.div>
  );
}

function HomeBar() {
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  const down = useRef<{ y: number; t: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  if (!current && !switcher) return null;
  return (
    <button
      type="button"
      className="ios-home-hit fixed bottom-0 left-1/2 z-[2400] flex h-[26px] w-[220px] -translate-x-1/2 touch-none items-center justify-center"
      data-light={switcher || current === "terminal" || undefined}
      aria-label="Home, hold for the app switcher"
      onPointerDown={(e) => {
        down.current = { y: e.clientY, t: e.timeStamp };
        e.currentTarget.setPointerCapture(e.pointerId);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          down.current = null;
          usePhone.getState().setSwitcher(true);
        }, 480);
      }}
      onPointerUp={(e) => {
        window.clearTimeout(timer.current);
        const d = down.current;
        down.current = null;
        if (!d) return;
        const phone = usePhone.getState();
        if (d.y - e.clientY > 70 && e.timeStamp - d.t > 260) phone.setSwitcher(true);
        else phone.home();
      }}
      onPointerCancel={() => {
        window.clearTimeout(timer.current);
        down.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          usePhone.getState().home();
        }
      }}
    >
      <span className="ios-home-bar" />
    </button>
  );
}

function BackEdge() {
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  const from = useRef<number | null>(null);
  if (!current || switcher) return null;
  return (
    <div
      className="fixed bottom-24 left-0 top-24 z-[2300] w-3 touch-none"
      onPointerDown={(e) => {
        from.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        if (from.current !== null && e.clientX - from.current > 56) phoneBack();
        from.current = null;
      }}
    />
  );
}

function Phone() {
  const { panel, toggle, close, open: openPanel } = usePanel<Panel>();
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  useWelcome("Tap the bar at the bottom to go home; hold it for the app switcher. Control Centre is at the top right.");
  const overlay = panel !== null || switcher || !current || current === "terminal";
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
      <Home toggle={toggle} />
      <PhoneHost variant="ios" />
      <HomeBar />
      <BackEdge />
      <StatusBar tone={overlay ? "light" : "auto"} toggle={toggle} />
      <Banner className="fixed inset-x-2.5" style={{ top: "calc(var(--sb-h) + 2px)" }} from={{ y: -70 }} />
      <AnimatePresence>
        {panel === "search" && <Search key="search" onClose={close} />}
        {panel === "control" && <ControlCentre key="cc" onPower={() => openPanel("power")} />}
        {panel === "notifications" && <NotificationCentre key="nc" onClose={close} />}
        {panel === "power" && <PowerSheet key="power" onClose={close} />}
      </AnimatePresence>
      {(panel === "control" || panel === "notifications") && (
        <button
          type="button"
          aria-label="Close"
          className="ios-home-hit fixed bottom-0 left-1/2 z-[2950] flex h-[30px] w-[220px] -translate-x-1/2 items-center justify-center"
          onClick={close}
        >
          <span className="ios-home-bar !bg-white" />
        </button>
      )}
    </>
  );
}

export default function IPhone() {
  const phase = useSession((s) => s.phase);
  return (
    <ShellRoot platform="ios">
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
