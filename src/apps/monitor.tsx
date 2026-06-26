"use client";

import { AppWindow, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { AppIcon } from "@/components/app-icon";
import { Empty } from "@/components/kit";
import { usePlatform } from "@/stores/session";
import { frameOf, useWM } from "@/stores/window-manager";
import { appName } from "./registry";

interface Sample {
  fps: number;
  heap: number | null;
}

function useSamples(): Sample[] {
  const [samples, setSamples] = useState<Sample[]>([]);
  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const loop = (t: number) => {
      frames += 1;
      if (t - last >= 500) {
        const fps = Math.round((frames * 1000) / (t - last));
        // Chromium only
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        const heap = memory ? Math.round(memory.usedJSHeapSize / 1048576) : null;
        setSamples((s) => [...s.slice(-39), { fps, heap }]);
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return samples;
}

function Spark({ values, max }: { values: number[]; max: number }) {
  const points = values.map((v, i) => `${(i / 39) * 100},${30 - (Math.min(v, max) / max) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-full" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export default function Monitor() {
  const platform = usePlatform();
  const wins = useWM((s) => s.wins);
  const focus = useWM((s) => s.focus);
  const area = useWM((s) => s.area);
  const samples = useSamples();
  const latest = samples[samples.length - 1];
  const heapMax = Math.max(64, ...samples.map((s) => s.heap ?? 0)) * 1.2;

  return (
    <AppFrame subtitle={`${wins.length} ${wins.length === 1 ? "process" : "processes"}`} compact>
      <div className="grid grid-cols-2 gap-2.5 p-3">
        <div className="k-card px-3 pb-1 pt-2.5">
          <div className="flex items-baseline justify-between">
            <span className="k-label">Frame rate</span>
            <span className="text-[15px] font-semibold tabular-nums">{latest ? `${latest.fps} fps` : "…"}</span>
          </div>
          <Spark values={samples.map((s) => s.fps)} max={130} />
        </div>
        <div className="k-card px-3 pb-1 pt-2.5">
          <div className="flex items-baseline justify-between">
            <span className="k-label">Memory</span>
            <span className="text-[15px] font-semibold tabular-nums">{latest?.heap != null ? `${latest.heap} MB` : "n/a"}</span>
          </div>
          {latest?.heap != null ? (
            <Spark values={samples.map((s) => s.heap ?? 0)} max={heapMax} />
          ) : (
            <div className="grid h-9 place-items-center text-[11.5px] text-fg3">Not reported by this browser</div>
          )}
        </div>
      </div>

      {wins.length === 0 ? (
        <Empty icon={AppWindow} title="No apps running" />
      ) : (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-[1fr_84px_92px_36px] gap-x-2 px-2.5 pb-1.5 text-[11.5px] text-fg3">
            <span>Name</span>
            <span>Status</span>
            <span className="text-right">Window</span>
            <span />
          </div>
          <div className="k-card overflow-hidden">
            {[...wins]
              .sort((a, b) => b.z - a.z)
              .map((w) => {
                const f = frameOf(w, area);
                const name = appName(w.appId, platform);
                return (
                  <div key={w.id} className="k-row !grid grid-cols-[1fr_84px_92px_36px] !gap-x-2 !py-1.5" data-on={w.id === focus}>
                    <button
                      type="button"
                      className="flex min-w-0 items-center gap-2 text-left text-[13px]"
                      onClick={() => useWM.getState().focusWin(w.id)}
                    >
                      <AppIcon id={w.appId} size={22} />
                      <span className="truncate">{name}</span>
                    </button>
                    <span className="text-[12.5px] text-fg2">{w.minimized ? "Minimised" : w.id === focus ? "Active" : "Running"}</span>
                    <span className="text-right text-[12.5px] tabular-nums text-fg2">
                      {Math.round(f.w)}×{Math.round(f.h)}
                    </span>
                    <button
                      type="button"
                      className="k-icon-btn !size-7"
                      aria-label={`Quit ${name}`}
                      title={`Quit ${name}`}
                      onClick={() => useWM.getState().close(w.id)}
                    >
                      <X size={13} weight="bold" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </AppFrame>
  );
}
