"use client";

import {
  ArrowClockwise,
  Check,
  CircleHalf,
  Desktop,
  HardDrives,
  ImageSquare,
  Info,
  LockSimple,
  Moon,
  PaintBrush,
  Power,
  SpeakerHigh,
  Sun,
  SunDim,
} from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Avatar, Heading, Page, Slider, Toggle } from "@/components/kit";
import { Wallpaper } from "@/components/wallpaper";
import { currentJob, profile, projects, skills } from "@/data/portfolio";
import { useDark } from "@/hooks/use-dark";
import { useInstance, useRelaunch } from "@/hooks/use-instance";
import { FAMILY_LABEL } from "@/lib/platform";
import { WALLPAPERS } from "@/lib/wallpapers";
import { useFamily, usePlatform, useSession } from "@/stores/session";
import { ACCENTS, useSettings } from "@/stores/settings";
import type { Family, Theme } from "@/types";

const SECTIONS = [
  { id: "appearance", label: "Appearance", icon: PaintBrush },
  { id: "wallpaper", label: "Wallpaper", icon: ImageSquare },
  { id: "display", label: "Display & Sound", icon: Desktop },
  { id: "system", label: "System", icon: Info },
];

const THEMES: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "auto", label: "Auto", icon: CircleHalf },
];

const FAMILIES: Family[] = ["macos", "windows", "linux"];

function Appearance() {
  const family = useFamily();
  const theme = useSettings((s) => s.theme);
  const accent = useSettings((s) => s.prefs[family].accent);
  const { setTheme, setAccent } = useSettings.getState();
  return (
    <>
      <Heading>Appearance</Heading>
      <div className="grid grid-cols-3 gap-2.5">
        {THEMES.map((t) => {
          const ThemeIcon = t.icon;
          const on = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className="os-choice k-card flex flex-col items-center gap-2 p-3"
              data-on={on}
              aria-pressed={on}
              onClick={() => setTheme(t.id)}
            >
              <span
                className="grid h-14 w-full place-items-center rounded-[6px] border border-line"
                style={{
                  background:
                    t.id === "light" ? "#f4f5f7" : t.id === "dark" ? "#1d1e22" : "linear-gradient(105deg, #f4f5f7 50%, #1d1e22 50%)",
                  color: t.id === "dark" ? "#f4f5f7" : t.id === "light" ? "#1d1e22" : "#8b8f98",
                }}
              >
                <ThemeIcon size={22} weight="fill" />
              </span>
              <span className="text-[13px] font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>

      <Heading>Accent colour</Heading>
      <div className="k-card flex flex-wrap gap-3 p-4">
        {ACCENTS[family].map((a) => (
          <button
            key={a.id}
            type="button"
            className="grid size-8 place-items-center rounded-full transition-transform hover:scale-110"
            style={{ background: a.hex, color: a.fg, boxShadow: accent === a.id ? `0 0 0 2px var(--bg-3), 0 0 0 4px ${a.hex}` : undefined }}
            aria-label={a.name}
            aria-pressed={accent === a.id}
            title={a.name}
            onClick={() => setAccent(family, a.id)}
          >
            {accent === a.id && <Check size={15} weight="bold" />}
          </button>
        ))}
      </div>
    </>
  );
}

function WallpaperPicker() {
  const family = useFamily();
  const dark = useDark();
  const current = useSettings((s) => s.prefs[family].wallpaper);
  const setWallpaper = useSettings((s) => s.setWallpaper);
  return (
    <>
      <Heading>Wallpaper</Heading>
      <div className="grid grid-cols-2 gap-3 @min-[620px]:grid-cols-3">
        {WALLPAPERS[family].map((w) => {
          const on = current === w.id;
          return (
            <button
              key={w.id}
              type="button"
              className="os-choice group text-left"
              data-on={on}
              aria-pressed={on}
              onClick={() => setWallpaper(family, w.id)}
            >
              <span className="os-choice-frame relative block aspect-[16/10] overflow-hidden rounded-card">
                <Wallpaper id={w.id} family={family} dark={dark} />
                {on && (
                  <span className="absolute bottom-2 right-2 grid size-6 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check size={14} weight="bold" />
                  </span>
                )}
              </span>
              <span className="mt-1.5 block text-[13px] font-medium">{w.name}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[12.5px] text-fg3">Every wallpaper is drawn in code, so it stays sharp on any screen.</p>
    </>
  );
}

function Display() {
  const brightness = useSettings((s) => s.brightness);
  const volume = useSettings((s) => s.volume);
  const nightLight = useSettings((s) => s.nightLight);
  const { setBrightness, setVolume, setNightLight } = useSettings.getState();
  return (
    <>
      <Heading>Display</Heading>
      <div className="k-card overflow-hidden">
        <div className="k-row">
          <SunDim size={18} className="shrink-0 text-fg2" />
          <span className="w-[92px] shrink-0 text-[13.5px]">Brightness</span>
          <Slider label="Brightness" value={brightness} min={0.35} max={1} onChange={setBrightness} />
        </div>
        <div className="k-row">
          <Moon size={18} className="shrink-0 text-fg2" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px]">Night light</span>
            <span className="block text-[12px] text-fg3">Warmer colours for late-night browsing</span>
          </span>
          <Toggle label="Night light" on={nightLight} onChange={setNightLight} />
        </div>
      </div>
      <Heading>Sound</Heading>
      <div className="k-card overflow-hidden">
        <div className="k-row">
          <SpeakerHigh size={18} className="shrink-0 text-fg2" />
          <span className="w-[92px] shrink-0 text-[13.5px]">Volume</span>
          <Slider label="Volume" value={volume} onChange={setVolume} />
        </div>
      </div>
    </>
  );
}

function System() {
  const family = useFamily();
  const platform = usePlatform();
  const form = useSession((s) => s.form);
  const { start, power } = useSession.getState();
  const rows: [string, string][] = [
    ["Name", `${profile.firstName}'s ${FAMILY_LABEL[family][form]}`],
    ["Owner", `${profile.name}, ${profile.role}`],
    ["Currently", `${currentJob.role} at ${currentJob.company}`],
    ["Processor", skills.slice(0, 4).map((s) => s.name.split(" ")[0]).join(" · ")],
    ["Storage", `${projects.length} live projects`],
    ["Location", profile.location],
  ];
  return (
    <>
      <div className="mt-1 flex flex-col items-center gap-2 pb-2 text-center">
        <Avatar size={76} />
        <div className="text-[19px] font-semibold">{rows[0][1]}</div>
        <div className="text-[12.5px] text-fg3">
          {FAMILY_LABEL[family][form]}-style shell · web edition{platform === "wp" ? " · 8.1" : ""}
        </div>
      </div>
      <div className="k-card overflow-hidden">
        {rows.slice(1).map(([k, v]) => (
          <div key={k} className="k-row">
            <span className="w-[92px] shrink-0 text-[13px] text-fg2">{k}</span>
            <span className="selectable min-w-0 flex-1 text-[13.5px]">{v}</span>
          </div>
        ))}
      </div>

      <Heading>Startup disk</Heading>
      <p className="mb-2.5 text-[13px] text-fg2">Restart into another operating system. Each one becomes a phone on small screens.</p>
      <div className="grid grid-cols-1 gap-2.5 @min-[520px]:grid-cols-3">
        {FAMILIES.map((f) => (
          <button
            key={f}
            type="button"
            className="os-choice k-card flex items-center gap-3 p-3 text-left"
            data-on={f === family}
            aria-pressed={f === family}
            onClick={() => f !== family && start(f)}
          >
            <HardDrives size={26} weight="duotone" className={f === family ? "text-accent" : "text-fg2"} />
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold">{FAMILY_LABEL[f].desktop}</span>
              <span className="block text-[12px] text-fg3">{f === family ? "Running now" : `Phone: ${FAMILY_LABEL[f].phone}`}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="k-btn" onClick={() => power("restart")}>
          <ArrowClockwise size={15} />
          Restart…
        </button>
        <button type="button" className="k-btn" onClick={() => power("lock")}>
          <LockSimple size={15} />
          Lock
        </button>
        <button type="button" className="k-btn" onClick={() => power("shutdown")}>
          <Power size={15} />
          Shut down
        </button>
      </div>
    </>
  );
}

export default function Settings() {
  const { args } = useInstance();
  const valid = (id?: string) => (SECTIONS.some((s) => s.id === id) ? (id as string) : "appearance");
  const [section, setSection] = useState(() => valid(args.section));
  useRelaunch((a) => a.section && setSection(valid(a.section)));
  return (
    <AppFrame sections={SECTIONS} section={section} onSection={setSection}>
      <Page>
        {section === "appearance" && <Appearance />}
        {section === "wallpaper" && <WallpaperPicker />}
        {section === "display" && <Display />}
        {section === "system" && <System />}
      </Page>
    </AppFrame>
  );
}
