"use client";

import "@fontsource-variable/google-sans-flex/rond.css";
import "./android.css";
import {
  ArrowClockwise,
  ArrowLeft,
  BellSimpleSlash,
  CaretUp,
  Fingerprint,
  Flashlight,
  GearSix,
  ImageSquare,
  LockSimple,
  MagnifyingGlass,
  Moon,
  MoonStars,
  Pause,
  Play,
  Power,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  SunDim,
  TerminalWindow,
  WifiHigh,
  WifiSlash,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { appName, launchable } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Slider } from "@/components/kit";
import { Banner, NoticeList } from "@/components/notifications";
import { PhoneHost } from "@/components/phone-host";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { profile } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useDark } from "@/hooks/use-dark";
import { useLauncher } from "@/hooks/use-launcher";
import { useNow } from "@/hooks/use-now";
import { useOnline } from "@/hooks/use-online";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { DAYS, MONTHS } from "@/lib/format";
import { launch, originOf, phoneBack, phoneCanGoBack } from "@/lib/launch";
import { TRACKS } from "@/lib/synth";
import { WALLPAPERS } from "@/lib/wallpapers";
import { usePhone } from "@/stores/phone";
import { usePlayer } from "@/stores/player";
import { useFamily, useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId } from "@/types";

type Panel = "drawer" | "shade" | "search" | "power";

const DOCK: AppId[] = ["about", "projects", "browser", "contact"];
const FAVOURITES: AppId[] = ["experience", "skills", "resume", "terminal", "files", "music", "settings", "tips"];
const SUGGESTED: AppId[] = ["about", "projects", "resume", "contact"];

const SPRING = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

const pad = (n: number) => String(n).padStart(2, "0");
const shortDate = (ts: number) => {
  const d = new Date(ts);
  return `${DAYS[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};

function glance(ts: number): { text: string; icon: Icon } {
  const h = new Date(ts).getHours();
  if (h < 5) return { text: "Good night", icon: MoonStars };
  if (h < 12) return { text: "Good morning", icon: Sun };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  if (h < 21) return { text: "Good evening", icon: Moon };
  return { text: "Good night", icon: MoonStars };
}

function open(id: AppId, el: Element | null) {
  launch(id, {}, { origin: originOf(el) });
}

function toggleMute() {
  const s = useSettings.getState();
  s.setVolume(s.volume === 0 ? 0.6 : 0);
}

function ScreenShape() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9800]" aria-hidden="true">
      <div className="px-corners absolute inset-0" />
      <div className="px-camera absolute left-1/2 top-[11px] -translate-x-1/2" />
    </div>
  );
}

function Boot() {
  const skip = useBootTimer(2000);
  return (
    <motion.button
      type="button"
      className="fixed inset-0 z-[5000] flex cursor-default flex-col items-center justify-center gap-9 bg-black text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Starting up. Tap to skip"
      onClick={skip}
    >
      <TerminalWindow size={72} weight="fill" style={{ animation: "k-fade-in 0.6s ease-out both" }} />
      <span className="px-boot-bar" aria-hidden="true">
        <i />
      </span>
      <span className="absolute bottom-12 text-[13px] lowercase tracking-wide text-white/50">{profile.name}</span>
    </motion.button>
  );
}

function AtAGlance({ now, className = "" }: { now: number; className?: string }) {
  const g = glance(now);
  const GlanceIcon = g.icon;
  return (
    <span className={`block text-left ${className}`}>
      <span className="block text-[22px] leading-7">{shortDate(now)}</span>
      <span className="mt-0.5 flex items-center gap-1.5 text-[14px] leading-5 opacity-90">
        <GlanceIcon size={16} weight="fill" />
        {g.text}
      </span>
    </span>
  );
}

function Lock() {
  const now = useNow(1000);
  const d = new Date(now);
  const hasNotices = useSession((s) => s.notices.length > 0);
  const muted = useSettings((s) => s.volume === 0);
  const [torch, setTorch] = useState(false);
  const start = useRef<number | null>(null);
  const unlock = () => useSession.getState().login();
  const hours = pad(d.getHours() % 12 || 12);
  const minutes = pad(d.getMinutes());
  return (
    <motion.div
      className="px-lock fixed inset-0 z-[2500] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.26 } }}
      onClick={unlock}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 50) unlock();
        start.current = null;
      }}
    >
      <ShellWallpaper />
      <div className="absolute inset-0 bg-black/30" />
      {torch && <div className="pointer-events-none absolute inset-0 bg-white/35 mix-blend-screen" />}
      <div className="relative flex h-full flex-col px-6" style={{ paddingTop: "calc(var(--sb-h) + 14px)", paddingBottom: "calc(var(--nav-h) + 12px)" }}>
        {hasNotices ? (
          <>
            <div className="flex items-center gap-4">
              <span className="px-clock text-[58px] leading-none">
                {hours}:{minutes}
              </span>
              <AtAGlance now={now} />
            </div>
            <div className="px-lock-notices mt-5 min-h-0 flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <NoticeList />
            </div>
          </>
        ) : (
          <>
            <AtAGlance now={now} />
            <div className="px-clock px-clock-big mt-[5vh] self-center text-center" aria-label={`${hours}:${minutes}`}>
              <span className="block">{hours}</span>
              <span className="block">{minutes}</span>
            </div>
            <div className="flex-1" />
          </>
        )}
        <div className="flex shrink-0 items-end justify-between pt-4">
          <button
            type="button"
            className="px-lock-shortcut"
            data-on={torch}
            aria-label="Flashlight"
            aria-pressed={torch}
            onClick={(e) => {
              e.stopPropagation();
              setTorch((v) => !v);
            }}
          >
            <Flashlight size={24} weight={torch ? "fill" : "regular"} />
          </button>
          <div className="flex flex-col items-center gap-2.5">
            <button type="button" autoFocus className="px-fingerprint outline-none" aria-label="Unlock">
              <Fingerprint size={34} />
            </button>
            <span className="text-[13.5px] opacity-80">Swipe up or tap to unlock</span>
          </div>
          <button
            type="button"
            className="px-lock-shortcut"
            data-on={muted}
            aria-label="Mute"
            aria-pressed={muted}
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {muted ? <SpeakerSlash size={24} weight="fill" /> : <SpeakerHigh size={24} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBar({ tone, onOpen }: { tone: "light" | "auto"; onOpen: () => void }) {
  const now = useNow(1000);
  const d = new Date(now);
  const from = useRef<number | null>(null);
  return (
    <button
      type="button"
      className="px-status fixed inset-x-0 top-0 z-[3000] flex touch-none items-center justify-between pl-7 pr-6"
      data-tone={tone}
      aria-label="Open notifications and quick settings"
      data-panel-trigger
      onClick={onOpen}
      onPointerDown={(e) => (from.current = e.clientY)}
      onPointerLeave={(e) => {
        if (from.current !== null && e.clientY - from.current > 12) onOpen();
        from.current = null;
      }}
      onPointerUp={() => (from.current = null)}
    >
      <span className="text-[15px] font-medium tabular-nums">
        {d.getHours() % 12 || 12}:{pad(d.getMinutes())}
      </span>
      <span className="flex items-center gap-1.5">
        <WifiGlyph size={17} />
        <BatteryGlyph size={21} />
      </span>
    </button>
  );
}

function AppButton({ id, size = 58, label = true, onOpen }: { id: AppId; size?: number; label?: boolean; onOpen?: () => void }) {
  return (
    <button
      type="button"
      className="px-app"
      aria-label={appName(id, "android")}
      onClick={(e) => {
        onOpen?.();
        open(id, e.currentTarget.firstElementChild);
      }}
    >
      <AppIcon id={id} size={size} />
      {label && <span className="px-app-label">{appName(id, "android")}</span>}
    </button>
  );
}

function Home({ openPanel }: { openPanel: (p: Panel) => void }) {
  const now = useNow(60_000);
  const start = useRef<number | null>(null);
  return (
    <div
      className="px-home absolute inset-0 flex flex-col text-white"
      style={{ paddingTop: "calc(var(--sb-h) + 18px)", paddingBottom: "calc(var(--nav-h) + 8px)" }}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 70) openPanel("drawer");
        start.current = null;
      }}
    >
      <button type="button" className="mx-6 self-start drop-shadow-[0_1px_6px_rgb(0_0_0/0.35)]" aria-label="At a Glance, open Calendar" onClick={(e) => open("calendar", e.currentTarget)}>
        <AtAGlance now={now} />
      </button>
      <div className="min-h-4 flex-1" />
      <div className="px-grid">
        {FAVOURITES.map((id) => (
          <AppButton key={id} id={id} />
        ))}
      </div>
      <button type="button" className="mx-auto mt-2 grid h-7 w-16 shrink-0 place-items-center opacity-80" aria-label="All apps" onClick={() => openPanel("drawer")}>
        <CaretUp size={18} weight="bold" />
      </button>
      <div className="px-grid px-dock shrink-0">
        {DOCK.map((id) => (
          <AppButton key={id} id={id} label={false} />
        ))}
      </div>
      <button type="button" className="px-searchbar mx-4 flex shrink-0 items-center gap-3 px-5" data-panel-trigger onClick={() => openPanel("search")}>
        <MagnifyingGlass size={21} weight="bold" className="text-accent" />
        <span className="text-[16px]">Search</span>
      </button>
    </div>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const apps = launchable("android")
    .map((id) => ({ id, name: appName(id, "android") }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((a) => a.name.toLowerCase().includes(q));
  return (
    <motion.div
      className="px-sheet px-blur fixed inset-0 z-[2700] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 10px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="All apps"
      data-panel
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%", transition: { duration: 0.22, ease: [0.3, 0, 0.8, 0.15] } }}
      transition={SPRING}
    >
      <label className="px-field mx-4 flex h-14 shrink-0 items-center gap-3 px-5">
        <MagnifyingGlass size={21} className="shrink-0 text-fg2" />
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
      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-5">
        {!q && (
          <>
            <div className="px-grid">
              {SUGGESTED.map((id) => (
                <AppButton key={id} id={id} onOpen={onClose} />
              ))}
            </div>
            <div className="mx-6 my-5 h-px bg-line" />
          </>
        )}
        <div className="px-grid gap-y-6">
          {apps.map((a) => (
            <AppButton key={a.id} id={a.id} onOpen={onClose} />
          ))}
        </div>
        {apps.length === 0 && <p className="py-10 text-center text-[15px] text-fg2">No apps match &quot;{query}&quot;</p>}
      </div>
    </motion.div>
  );
}

function Search({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose, 8);
  return (
    <motion.div
      className="px-sheet px-blur fixed inset-0 z-[2800] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 10px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="Search"
      data-panel
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30, transition: { duration: 0.16 } }}
      transition={SPRING}
    >
      <label className="px-field mx-4 flex h-14 shrink-0 items-center gap-3 px-5">
        <MagnifyingGlass size={21} className="shrink-0 text-accent" />
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
          <button key={h.id} type="button" className="px-result" data-on={i === l.index} onClick={() => l.run(h)}>
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

function Tile({
  wide = false,
  on,
  icon: TileIcon,
  label,
  sub,
  onClick,
}: {
  wide?: boolean;
  on: boolean;
  icon: Icon;
  label: string;
  sub?: string;
  onClick?: () => void;
}) {
  const body: ReactNode = (
    <>
      <TileIcon size={22} weight={on ? "fill" : "regular"} className="shrink-0" />
      {wide && (
        <span className="min-w-0 text-left">
          <span className="block truncate text-[14px] font-medium leading-5">{label}</span>
          {sub && <span className="block truncate text-[12px] leading-4 opacity-75">{sub}</span>}
        </span>
      )}
    </>
  );
  const props = { className: "px-tile", "data-on": on, "data-wide": wide || undefined };
  return onClick ? (
    <button type="button" {...props} aria-pressed={on} aria-label={wide ? undefined : label} title={label} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div {...props} role="status" aria-label={`${label}: ${sub ?? (on ? "on" : "off")}`}>
      {body}
    </div>
  );
}

function Shade({ onClose, onPower }: { onClose: () => void; onPower: () => void }) {
  const family = useFamily();
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  const hasNotices = useSession((s) => s.notices.length > 0);
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const now = useNow(60_000);
  const from = useRef<number | null>(null);
  const [torch, setTorch] = useState(false);
  const muted = settings.volume === 0;

  const nextWallpaper = () => {
    const list = WALLPAPERS[family];
    const at = list.findIndex((w) => w.id === settings.prefs[family].wallpaper);
    settings.setWallpaper(family, list[(at + 1) % list.length].id);
  };

  return (
    <motion.div
      className="px-sheet px-shade px-blur fixed inset-0 z-[2900] flex flex-col"
      style={{ paddingTop: "calc(var(--sb-h) + 4px)", paddingBottom: "var(--nav-h)" }}
      role="dialog"
      aria-label="Notifications and quick settings"
      data-panel
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.22, ease: [0.3, 0, 0.8, 0.15] } }}
      transition={SPRING}
      onPointerDown={(e) => (from.current = e.clientY)}
      onPointerUp={(e) => {
        if (from.current !== null && from.current - e.clientY > 90 && !(e.target as Element).closest("input")) onClose();
        from.current = null;
      }}
    >
      {torch && <div className="pointer-events-none fixed inset-0 z-[1] bg-white/25 mix-blend-screen" />}
      <div className="shrink-0 px-5 pb-2 text-[14px] text-fg2">{shortDate(now)}</div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <div className="grid grid-cols-4 gap-2">
          <Tile wide on={online} icon={online ? WifiHigh : WifiSlash} label="Internet" sub={online ? "Connected" : "Offline"} />
          <Tile wide on={dark} icon={Moon} label="Dark theme" sub={dark ? "On" : "Off"} onClick={() => settings.setTheme(dark ? "light" : "dark")} />
          <Tile on={settings.nightLight} icon={MoonStars} label="Night Light" onClick={() => settings.setNightLight(!settings.nightLight)} />
          <Tile on={torch} icon={Flashlight} label="Flashlight" onClick={() => setTorch((v) => !v)} />
          <Tile on={muted} icon={muted ? SpeakerSlash : BellSimpleSlash} label="Mute" onClick={toggleMute} />
          <Tile on={false} icon={ImageSquare} label="Next wallpaper" onClick={nextWallpaper} />
        </div>

        <div className="px-brightness mt-3 flex items-center gap-3">
          <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
          <SunDim size={20} weight="fill" className="pointer-events-none absolute left-4 text-accent-fg" />
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            className="px-chip"
            aria-label="Settings"
            onClick={() => {
              onClose();
              launch("settings");
            }}
          >
            <GearSix size={19} weight="fill" />
          </button>
          <button type="button" className="px-chip" aria-label="Power" onClick={onPower}>
            <Power size={19} weight="bold" />
          </button>
        </div>

        <div className="px-media mt-3 flex items-center gap-3">
          <button
            type="button"
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-white"
            style={{ background: `linear-gradient(140deg, ${TRACKS[index].color[0]}, ${TRACKS[index].color[1]})` }}
            aria-label="Open Music"
            onClick={() => {
              onClose();
              launch("music");
            }}
          >
            <SpeakerHigh size={20} weight="fill" />
          </button>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium">{TRACKS[index].title}</span>
            <span className="block truncate text-[12.5px] text-fg2">{playing ? "Playing" : "Music"}</span>
          </span>
          <button type="button" className="px-play" aria-label={playing ? "Pause" : "Play"} onClick={usePlayer.getState().toggle}>
            {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
          </button>
          <button type="button" className="md-icon-btn" aria-label="Next track" onClick={usePlayer.getState().next}>
            <SkipForward size={20} weight="fill" />
          </button>
        </div>

        <div className="mt-4">
          <NoticeList empty="No notifications" onOpen={onClose} />
        </div>
        {hasNotices && (
          <div className="mt-3 flex justify-end">
            <button type="button" className="px-pill" onClick={() => useSession.getState().clearNotices()}>
              Clear all
            </button>
          </div>
        )}
      </div>
      <button type="button" className="mx-auto grid h-6 w-24 shrink-0 place-items-center" aria-label="Close" onClick={onClose}>
        <span className="h-1 w-10 rounded-full bg-fg3" />
      </button>
    </motion.div>
  );
}

function PowerMenu({ onClose }: { onClose: () => void }) {
  const { power } = useSession.getState();
  const items: { label: string; icon: Icon; run: () => void }[] = [
    { label: "Lock", icon: LockSimple, run: () => power("lock") },
    { label: "Restart", icon: ArrowClockwise, run: () => power("restart") },
    { label: "Power off", icon: Power, run: () => power("shutdown") },
  ];
  return (
    <motion.div
      className="fixed inset-0 z-[3200] grid place-items-center bg-black/55 p-6"
      role="dialog"
      aria-label="Power menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div className="px-power w-full max-w-[330px] p-5" data-panel initial={{ scale: 0.86 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} transition={SPRING}>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <button key={item.label} type="button" autoFocus={i === 1} className="px-power-btn" onClick={item.run}>
                <span>
                  <ItemIcon size={26} weight="bold" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[13px] text-fg2">Restart to choose another operating system.</p>
      </motion.div>
    </motion.div>
  );
}

function GestureBar({ panel, close, openDrawer, light }: { panel: Panel | null; close: () => void; openDrawer: () => void; light: boolean }) {
  const down = useRef<{ y: number; t: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const recents = () => {
    close();
    usePhone.getState().setSwitcher(true);
  };
  const up = (dy: number) => {
    const phone = usePhone.getState();
    if (panel) close();
    else if (phone.switcher || phone.current) phone.home();
    else if (dy > 24) openDrawer();
  };
  return (
    <button
      type="button"
      className="px-gesture fixed bottom-0 left-1/2 z-[3100] -translate-x-1/2 touch-none"
      data-light={light || undefined}
      aria-label="Home, hold for recent apps"
      onPointerDown={(e) => {
        down.current = { y: e.clientY, t: e.timeStamp };
        e.currentTarget.setPointerCapture(e.pointerId);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          down.current = null;
          recents();
        }, 480);
      }}
      onPointerUp={(e) => {
        window.clearTimeout(timer.current);
        const d = down.current;
        down.current = null;
        if (!d) return;
        const dy = d.y - e.clientY;
        if (dy > 70 && e.timeStamp - d.t > 260) recents();
        else up(dy);
      }}
      onPointerCancel={() => {
        window.clearTimeout(timer.current);
        down.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          up(0);
        }
      }}
    >
      <span />
    </button>
  );
}

function BackEdges({ onBack }: { onBack: () => void }) {
  const [pull, setPull] = useState<{ side: "left" | "right"; dx: number; y: number } | null>(null);
  const from = useRef<number | null>(null);
  const edge = (side: "left" | "right") => (
    <div
      className={`fixed bottom-[12%] top-[16%] z-[3050] w-3.5 touch-none ${side === "left" ? "left-0" : "right-0"}`}
      data-back-edge={side}
      onPointerDown={(e) => {
        from.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
        setPull({ side, dx: 0, y: e.clientY });
      }}
      onPointerMove={(e) => {
        if (from.current === null) return;
        const dx = Math.max(0, side === "left" ? e.clientX - from.current : from.current - e.clientX);
        setPull({ side, dx, y: e.clientY });
      }}
      onPointerUp={() => {
        if (pull && pull.dx > 36) onBack();
        from.current = null;
        setPull(null);
      }}
      onPointerCancel={() => {
        from.current = null;
        setPull(null);
      }}
    />
  );
  return (
    <>
      {edge("left")}
      {edge("right")}
      {pull && pull.dx > 4 && (
        <div
          className="px-back-arrow pointer-events-none fixed z-[3060] grid place-items-center"
          data-armed={pull.dx > 36}
          style={{
            top: pull.y - 20,
            [pull.side]: Math.min(22, pull.dx * 0.35) - 8,
            opacity: Math.min(1, pull.dx / 30),
            transform: `scale(${0.7 + Math.min(0.3, pull.dx / 120)})`,
          }}
        >
          <ArrowLeft size={18} weight="bold" style={{ transform: pull.side === "right" ? "scaleX(-1)" : undefined }} />
        </div>
      )}
    </>
  );
}

function Phone() {
  const { panel, toggle, close, open: openPanel } = usePanel<Panel>();
  const current = usePhone((s) => s.current);
  const switcher = usePhone((s) => s.switcher);
  const running = usePhone((s) => s.apps.length);
  useWelcome("Flick up on the home screen for every app. Tap the bar at the bottom to go home, hold it for recents, and drag in from a screen edge to go back.");

  const back = () => {
    if (panel) close();
    else phoneBack();
  };
  useWindowEvent("keydown", (e) => {
    if (e.key === "Escape" && (panel || switcher)) back();
    else if (e.altKey && e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    }
  });

  const overWallpaper = (!current && panel === null) || switcher || current === "terminal";
  const canBack = Boolean(panel) || switcher || Boolean(current) || phoneCanGoBack();
  return (
    <>
      <Home openPanel={openPanel} />
      <PhoneHost variant="android" />
      {switcher && running > 0 && (
        <button type="button" className="px-pill px-clear-all fixed left-1/2 z-[3040] -translate-x-1/2" onClick={() => usePhone.getState().closeAll()}>
          Clear all
        </button>
      )}
      <StatusBar tone={overWallpaper ? "light" : "auto"} onOpen={() => toggle("shade")} />
      <Banner className="fixed inset-x-3" style={{ top: "calc(var(--sb-h) + 4px)" }} from={{ y: -70 }} />
      <AnimatePresence>
        {panel === "drawer" && <Drawer key="drawer" onClose={close} />}
        {panel === "search" && <Search key="search" onClose={close} />}
        {panel === "shade" && <Shade key="shade" onClose={close} onPower={() => openPanel("power")} />}
        {panel === "power" && <PowerMenu key="power" onClose={close} />}
      </AnimatePresence>
      {canBack && <BackEdges onBack={back} />}
      <GestureBar panel={panel} close={close} openDrawer={() => openPanel("drawer")} light={overWallpaper} />
    </>
  );
}

export default function PixelPhone() {
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
      <ScreenShape />
    </ShellRoot>
  );
}
