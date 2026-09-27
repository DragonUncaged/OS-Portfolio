"use client";

import {
  Browsers,
  FastForward,
  LockSimple,
  Moon,
  Pause,
  Play,
  Rewind,
  SpeakerHigh,
  SpeakerLow,
  Sun,
  SunDim,
  SunHorizon,
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
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import { useWM } from "@/stores/window-manager";
import { MENU_H } from "./constants";

const pop = {
  hidden: { opacity: 0, scale: 0.86, y: -10 },
  shown: { opacity: 1, scale: 1, y: 0 },
};

function Tile({ className = "", children, ...rest }: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div className={`mac-cc-tile mac-glass ${className}`} data-glass="smoke" variants={pop} {...rest}>
      {children}
    </motion.div>
  );
}

function Toggle({
  label,
  detail,
  on,
  onClick,
  children,
}: {
  label: string;
  detail: string;
  on: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const body = (
    <>
      <span className="mac-cc-round" data-on={on}>
        {children}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold leading-tight">{label}</span>
        <span className="block truncate text-[12px] leading-tight opacity-70">{detail}</span>
      </span>
    </>
  );
  return (
    <Tile className="col-span-2">
      {onClick ? (
        <button type="button" className="mac-cc-toggle" aria-pressed={on} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className="mac-cc-toggle">{body}</div>
      )}
    </Tile>
  );
}

export function ControlCentre({ onClose }: { onClose: () => void }) {
  const dark = useDark();
  const online = useOnline();
  const settings = useSettings();
  const index = usePlayer((s) => s.index);
  const playing = usePlayer((s) => s.playing);
  const player = usePlayer.getState();
  return (
    <motion.div
      className="mac-cc fixed right-2.5 z-[1800]"
      style={{ top: MENU_H + 8 }}
      data-panel
      role="dialog"
      aria-label="Control Centre"
      initial="hidden"
      animate="shown"
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
      transition={{ staggerChildren: 0.018 }}
    >
      <Toggle label="Wi-Fi" detail={online ? "Connected" : "Offline"} on={online}>
        <WifiGlyph size={18} />
      </Toggle>
      <Tile className="mac-cc-playing col-span-2 row-span-2">
        <button type="button" className="shrink-0 self-start" aria-label="Open Music" onClick={() => (onClose(), launch("music"))}>
          <AppIcon id="music" size={40} />
        </button>
        <span className="mt-auto block min-w-0">
          <span className="block truncate text-[13px] font-semibold leading-tight">{playing ? TRACKS[index].title : "Not Playing"}</span>
          <span className="block truncate text-[12px] leading-tight opacity-70">{playing ? "Music" : TRACKS[index].title}</span>
        </span>
        <span className="mac-cc-transport">
          <button type="button" aria-label="Previous track" onClick={player.prev}>
            <Rewind size={18} weight="fill" />
          </button>
          <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={player.toggle}>
            {playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
          </button>
          <button type="button" aria-label="Next track" onClick={player.next}>
            <FastForward size={18} weight="fill" />
          </button>
        </span>
      </Tile>
      <Toggle label="Dark Mode" detail={dark ? "On" : "Off"} on={dark} onClick={() => settings.setTheme(dark ? "light" : "dark")}>
        {dark ? <Moon size={17} weight="fill" /> : <Sun size={17} weight="fill" />}
      </Toggle>
      <Toggle label="Night Shift" detail={settings.nightLight ? "On" : "Off"} on={settings.nightLight} onClick={() => settings.setNightLight(!settings.nightLight)}>
        <SunHorizon size={18} weight="fill" />
      </Toggle>
      <Tile className="mac-cc-circle">
        <button
          type="button"
          aria-label="Mission Control"
          title="Mission Control"
          onClick={() => {
            onClose();
            useWM.getState().setOverview(true);
          }}
        >
          <Browsers size={24} />
        </button>
      </Tile>
      <Tile className="mac-cc-circle">
        <button type="button" aria-label="Lock Screen" title="Lock Screen" onClick={() => useSession.getState().power("lock")}>
          <LockSimple size={23} weight="fill" />
        </button>
      </Tile>
      <Tile className="mac-cc-slider col-span-4">
        <span className="block text-[13px] font-semibold">Display</span>
        <span className="flex items-center gap-2.5">
          <SunDim size={17} weight="fill" className="shrink-0" />
          <Slider label="Brightness" value={settings.brightness} min={0.35} max={1} onChange={settings.setBrightness} />
          <Sun size={19} weight="fill" className="shrink-0" />
        </span>
      </Tile>
      <Tile className="mac-cc-slider col-span-4">
        <span className="block text-[13px] font-semibold">Sound</span>
        <span className="flex items-center gap-2.5">
          <SpeakerLow size={17} weight="fill" className="shrink-0" />
          <Slider label="Volume" value={settings.volume} onChange={settings.setVolume} />
          <SpeakerHigh size={19} weight="fill" className="shrink-0" />
        </span>
      </Tile>
    </motion.div>
  );
}
