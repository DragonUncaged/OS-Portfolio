"use client";

import {
  Moon,
  Pause,
  Play,
  SkipForward,
  SpeakerHigh,
  Sun,
  SunDim,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { AppIcon } from "@/components/app-icon";
import { Slider } from "@/components/kit";
import { WifiGlyph } from "@/components/status-glyphs";
import { useDark } from "@/hooks/use-dark";
import { useOnline } from "@/hooks/use-online";
import { launch } from "@/lib/launch";
import { TRACKS } from "@/lib/synth";
import { usePlayer } from "@/stores/player";
import { useSettings } from "@/stores/settings";
import { MENU_H } from "./constants";

export function ControlCentre() {
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const player = usePlayer.getState();
  return (
    <motion.div
      className="mac-panel fixed right-2 z-[1800] w-[320px] max-w-[calc(100vw-16px)] p-2.5"
      style={{ top: MENU_H + 6 }}
      data-panel
      role="dialog"
      aria-label="Control Centre"
      initial={{ opacity: 0, scale: 0.96, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.16 }}
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="mac-cc-tile flex items-center gap-2.5">
          <span className="mac-cc-round" data-on={online}>
            <WifiGlyph size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">Wi-Fi</span>
            <span className="block truncate text-[11.5px] opacity-65">{online ? "Connected" : "Offline"}</span>
          </span>
        </div>
        <button
          type="button"
          className="mac-cc-tile flex items-center gap-2.5 text-left"
          aria-pressed={dark}
          onClick={() => settings.setTheme(dark ? "light" : "dark")}
        >
          <span className="mac-cc-round" data-on={dark}>
            {dark ? <Moon size={16} weight="fill" /> : <Sun size={16} weight="fill" />}
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">Dark Mode</span>
            <span className="block text-[11.5px] opacity-65">{dark ? "On" : "Off"}</span>
          </span>
        </button>
        <button
          type="button"
          className="mac-cc-tile col-span-2 flex items-center gap-2.5 text-left"
          aria-pressed={settings.nightLight}
          onClick={() => settings.setNightLight(!settings.nightLight)}
        >
          <span className="mac-cc-round" data-on={settings.nightLight}>
            <SunDim size={17} weight="fill" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">Night Shift</span>
            <span className="block text-[11.5px] opacity-65">{settings.nightLight ? "On, warmer colours" : "Off"}</span>
          </span>
        </button>
      </div>
      <div className="mac-cc-tile mt-2.5">
        <div className="mb-1.5 text-[12px] font-semibold">Display</div>
        <div className="flex items-center gap-2">
          <SunDim size={16} className="shrink-0 opacity-70" />
          <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
        </div>
      </div>
      <div className="mac-cc-tile mt-2.5">
        <div className="mb-1.5 text-[12px] font-semibold">Sound</div>
        <div className="flex items-center gap-2">
          <SpeakerHigh size={16} className="shrink-0 opacity-70" />
          <Slider label="Volume" value={settings.volume} onChange={settings.setVolume} />
        </div>
      </div>
      <div className="mac-cc-tile mt-2.5 flex items-center gap-2.5">
        <button type="button" className="shrink-0" aria-label="Open Music" onClick={() => launch("music")}>
          <AppIcon id="music" size={38} />
        </button>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{TRACKS[index].title}</span>
          <span className="block truncate text-[11.5px] opacity-65">{playing ? "Playing" : "Music"}</span>
        </span>
        <button type="button" className="k-icon-btn" aria-label={playing ? "Pause" : "Play"} onClick={player.toggle}>
          {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
        </button>
        <button type="button" className="k-icon-btn" aria-label="Next track" onClick={player.next}>
          <SkipForward size={18} weight="fill" />
        </button>
      </div>
    </motion.div>
  );
}
