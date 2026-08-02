"use client";

import { ArrowBendDownLeft, Command, SquaresFour, TerminalWindow, type Icon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { DEFAULT_WALLPAPER, Wallpaper } from "@/components/wallpaper";
import { profile } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { isPhoneSize, useViewport } from "@/hooks/use-viewport";
import { useWindowEvent } from "@/hooks/use-window-event";
import { time24 } from "@/lib/format";
import { FAMILY_LABEL } from "@/lib/platform";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { Family } from "@/types";

const OPTIONS: { family: Family; glyph: Icon; blurb: string; tint: string }[] = [
  { family: "macos", glyph: Command, blurb: "Menu bar, Dock, Spotlight and Launchpad.", tint: "#b98cff" },
  { family: "windows", glyph: SquaresFour, blurb: "Taskbar, Start menu, snapping and live tiles.", tint: "#5aa9ff" },
  { family: "linux", glyph: TerminalWindow, blurb: "Ubuntu-style top bar, dock and Activities.", tint: "#ff8a5c" },
];

function DesktopMock({ family }: { family: Family }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[8px] ring-1 ring-white/15">
      <Wallpaper id={DEFAULT_WALLPAPER[family]} family={family} dark={family === "windows"} dim={false} />
      {family === "macos" && (
        <>
          <div className="absolute inset-x-0 top-0 h-[5%] bg-white/25 backdrop-blur-sm" />
          <div className="absolute left-[14%] top-[16%] h-[52%] w-[50%] rounded-[5px] bg-white/90 shadow-lg">
            <div className="flex gap-[3px] p-[5px]">
              <i className="size-[5px] rounded-full bg-[#ff5f57]" />
              <i className="size-[5px] rounded-full bg-[#febc2e]" />
              <i className="size-[5px] rounded-full bg-[#28c840]" />
            </div>
          </div>
          <div className="absolute bottom-[4%] left-1/2 flex -translate-x-1/2 gap-[4px] rounded-[7px] bg-white/30 p-[4px] backdrop-blur-sm">
            {["#5ac8fa", "#ff9f6b", "#5fe3a1", "#b08cff", "#ffe27a"].map((c) => (
              <i key={c} className="size-[11px] rounded-[3px]" style={{ background: c }} />
            ))}
          </div>
        </>
      )}
      {family === "windows" && (
        <>
          <div className="absolute left-[22%] top-[14%] h-[56%] w-[54%] rounded-[4px] bg-[#f3f3f3] shadow-lg">
            <div className="flex justify-end gap-[5px] p-[5px]">
              <i className="h-[2px] w-[6px] bg-black/50" />
              <i className="size-[5px] border border-black/50" />
              <i className="size-[5px] bg-[#e81123]" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-[9%] items-center justify-center gap-[5px] bg-[#1c1f2b]/80 backdrop-blur-sm">
            <i className="grid size-[9px] grid-cols-2 gap-px">
              <b className="bg-[#5aa9ff]" />
              <b className="bg-[#5aa9ff]" />
              <b className="bg-[#5aa9ff]" />
              <b className="bg-[#5aa9ff]" />
            </i>
            {["#ffd66b", "#6fd0ff", "#5fe3a1", "#ff6f91"].map((c) => (
              <i key={c} className="size-[9px] rounded-[2px]" style={{ background: c }} />
            ))}
          </div>
        </>
      )}
      {family === "linux" && (
        <>
          <div className="absolute inset-x-0 top-0 h-[5.5%] bg-black/70" />
          <div className="absolute bottom-0 left-0 top-[5.5%] flex w-[9%] flex-col items-center gap-[4px] bg-black/45 pt-[5px] backdrop-blur-sm">
            {["#e95420", "#6fd0ff", "#5fe3a1", "#b08cff", "#ffe27a"].map((c) => (
              <i key={c} className="size-[10px] rounded-[3px]" style={{ background: c }} />
            ))}
          </div>
          <div className="absolute left-[24%] top-[18%] h-[54%] w-[52%] overflow-hidden rounded-[6px] bg-[#fafafa] shadow-lg">
            <div className="flex h-[16%] items-center justify-end gap-[4px] bg-[#e4e4e4] px-[5px]">
              <i className="size-[5px] rounded-full bg-black/25" />
              <i className="size-[5px] rounded-full bg-black/25" />
              <i className="size-[5px] rounded-full bg-[#e95420]" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PhoneMock({ family, className = "" }: { family: Family; className?: string }) {
  return (
    <div className={`relative aspect-[9/18.5] overflow-hidden rounded-[9px] bg-black ring-2 ring-black/80 ${className}`}>
      {family !== "windows" && <Wallpaper id={DEFAULT_WALLPAPER[family]} family={family} dim={false} />}
      {family === "macos" && (
        <>
          <div className="absolute left-1/2 top-[3%] h-[3.5%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute inset-x-[10%] top-[13%] grid grid-cols-4 gap-[5%]">
            {["#5ac8fa", "#ff9f6b", "#5fe3a1", "#b08cff", "#ffe27a", "#ff6f91", "#63d4ff", "#b9bec8"].map((c) => (
              <i key={c} className="aspect-square rounded-[24%]" style={{ background: c }} />
            ))}
          </div>
          <div className="absolute inset-x-[7%] bottom-[4%] flex justify-around rounded-[5px] bg-white/30 p-[4%]">
            {["#5fe3a1", "#63d4ff", "#4fc3ff", "#ffe27a"].map((c) => (
              <i key={c} className="aspect-square w-[18%] rounded-[24%]" style={{ background: c }} />
            ))}
          </div>
        </>
      )}
      {family === "windows" && (
        <div className="absolute inset-x-[9%] top-[10%] grid grid-cols-4 gap-[4%]">
          <i className="col-span-2 aspect-square bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
          <i className="col-span-4 aspect-[4/1.9] bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
          <i className="col-span-2 aspect-square bg-[#3a6ff7]" />
          <i className="col-span-2 aspect-square bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
          <i className="aspect-square bg-[#3a6ff7]" />
        </div>
      )}
      {family === "linux" && (
        <>
          <div className="absolute inset-x-[10%] top-[40%] grid grid-cols-4 gap-[6%]">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} className="aspect-square rounded-full bg-white/75" />
            ))}
          </div>
          <div className="absolute inset-x-[8%] bottom-[9%] h-[6%] rounded-full bg-white/85" />
          <div className="absolute inset-x-0 bottom-[2%] flex justify-center gap-[14%]">
            <i className="size-[4px] rotate-45 border-b border-l border-white/80" />
            <i className="size-[4px] rounded-full border border-white/80" />
            <i className="size-[4px] border border-white/80" />
          </div>
        </>
      )}
    </div>
  );
}

export function Picker() {
  const { w, h } = useViewport();
  const small = isPhoneSize(w, h);
  const last = useSettings((s) => s.lastFamily);
  const [index, setIndex] = useState(() => Math.max(0, OPTIONS.findIndex((o) => o.family === last)));
  const [booting, setBooting] = useState<Family | null>(null);
  const now = useNow(1000);

  const boot = (family: Family) => {
    if (booting) return;
    setBooting(family);
    window.setTimeout(() => useSession.getState().start(family), 420);
  };

  useWindowEvent("keydown", (e) => {
    if (booting) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setIndex((i) => (i + 1) % OPTIONS.length);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setIndex((i) => (i + OPTIONS.length - 1) % OPTIONS.length);
    else if (e.key === "Enter") boot(OPTIONS[index].family);
    else if (["1", "2", "3"].includes(e.key)) boot(OPTIONS[Number(e.key) - 1].family);
    else return;
    e.preventDefault();
  });

  return (
    <div className="picker absolute inset-0 overflow-y-auto bg-[#06070a] text-white">
      <div className="picker-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-full w-full max-w-[1120px] flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between font-mono text-[11.5px] uppercase tracking-[0.18em] text-white/55">
          <span>
            {profile.name} <span className="text-white/30">/</span> portfolio
          </span>
          <span className="tabular-nums">{time24(now)}</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-7 sm:py-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">Startup manager</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-tight sm:text-[44px]">
            Choose an operating system
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-white/60 sm:text-[16px]">
            {profile.firstName}&apos;s portfolio runs on three of them. Each is a full desktop on a big screen and becomes its
            phone on a small one.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3.5 sm:mt-9 md:grid-cols-3 md:gap-4" role="listbox" aria-label="Operating systems">
            {OPTIONS.map((o, i) => {
              const Glyph = o.glyph;
              const on = i === index;
              const label = FAMILY_LABEL[o.family];
              return (
                <motion.button
                  key={o.family}
                  type="button"
                  role="option"
                  aria-selected={on}
                  aria-label={`${label.desktop}, becomes ${label.phone} on small screens`}
                  className="picker-card group relative flex items-center gap-4 rounded-[18px] p-3.5 text-left md:block md:p-4"
                  data-on={on}
                  style={{ ["--tint" as string]: o.tint }}
                  animate={booting ? { opacity: booting === o.family ? 1 : 0.25, scale: booting === o.family ? 1.02 : 0.98 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => boot(o.family)}
                  onPointerEnter={() => !booting && setIndex(i)}
                  onFocus={() => setIndex(i)}
                >
                  <div className="relative w-[112px] shrink-0 md:w-full">
                    {small ? (
                      <PhoneMock family={o.family} className="mx-auto w-[58px] md:w-[84px]" />
                    ) : (
                      <>
                        <DesktopMock family={o.family} />
                        <div className="absolute -bottom-2.5 right-2.5 w-[19%] drop-shadow-[0_6px_14px_rgb(0_0_0/0.55)]">
                          <PhoneMock family={o.family} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 md:mt-5">
                    <div className="flex items-center gap-2.5">
                      <span className="picker-glyph grid size-9 shrink-0 place-items-center rounded-[10px]">
                        <Glyph size={20} weight="fill" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[19px] font-semibold leading-tight">{small ? label.phone : label.desktop}</div>
                        <div className="truncate text-[12.5px] text-white/50">
                          {small ? `${label.desktop} on a big screen` : `becomes ${label.phone} on a phone`}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2.5 hidden text-[13.5px] leading-relaxed text-white/60 md:block">{o.blurb}</p>
                    <div className="picker-cta mt-3 hidden items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.14em] md:flex">
                      {booting === o.family ? "Starting…" : last === o.family ? "Last used · boot" : "Boot"}
                      <ArrowBendDownLeft size={13} weight="bold" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
          <span className="hidden md:inline">← → select · ↵ boot · 1 2 3 jump</span>
          <span>Your choice is remembered. Restart any system to come back here</span>
        </footer>
      </div>
    </div>
  );
}
