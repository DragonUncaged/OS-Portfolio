"use client";

import "@fontsource-variable/google-sans-flex/rond.css";
import "./android.css";
import {
  CaretUp,
  Fingerprint,
  Flashlight,
  MagnifyingGlass,
  Moon,
  MoonStars,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  TerminalWindow,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { appName } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { Banner, NoticeList } from "@/components/notifications";
import { PhoneHost } from "@/components/phone-host";
import { ShellRoot, ShellWallpaper } from "@/components/shell-root";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { profile } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useNow } from "@/hooks/use-now";
import { usePanel } from "@/hooks/use-panel";
import { useWelcome } from "@/hooks/use-welcome";
import { useWindowEvent } from "@/hooks/use-window-event";
import { DAYS, MONTHS } from "@/lib/format";
import { launch, originOf, phoneBack, phoneCanGoBack } from "@/lib/launch";
import { usePhone } from "@/stores/phone";
import { useSession } from "@/stores/session";
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
      </AnimatePresence>
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
