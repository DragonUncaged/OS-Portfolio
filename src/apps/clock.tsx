"use client";

import { Clock as ClockIcon, Hourglass, Timer } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { profile } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { dateLong } from "@/lib/format";
import { useSession } from "@/stores/session";

const SECTIONS = [
  { id: "clock", label: "Clock", icon: ClockIcon },
  { id: "stopwatch", label: "Stopwatch", icon: Timer },
  { id: "timer", label: "Timer", icon: Hourglass },
];

// UTC+5:30, no daylight saving
const IST_OFFSET_MIN = 330;

const pad = (n: number) => String(n).padStart(2, "0");

function Face({ ts }: { ts: number }) {
  const d = new Date(ts);
  const s = d.getSeconds();
  const m = d.getMinutes() + s / 60;
  const h = (d.getHours() % 12) + m / 60;
  return (
    <svg viewBox="0 0 200 200" className="os-clock-face mx-auto w-full max-w-[220px]" role="img" aria-label="Analog clock">
      <circle cx="100" cy="100" r="96" className="fill-bg3 stroke-line" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1="14"
          x2="100"
          y2={i % 3 === 0 ? 28 : 22}
          transform={`rotate(${i * 30} 100 100)`}
          className="stroke-fg2"
          strokeWidth={i % 3 === 0 ? 3 : 1.5}
          strokeLinecap="round"
        />
      ))}
      <line x1="100" y1="100" x2="100" y2="52" transform={`rotate(${h * 30} 100 100)`} className="stroke-fg" strokeWidth="5" strokeLinecap="round" />
      <line x1="100" y1="100" x2="100" y2="30" transform={`rotate(${m * 6} 100 100)`} className="stroke-fg" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1="114" x2="100" y2="24" transform={`rotate(${s * 6} 100 100)`} className="stroke-accent" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="4.5" className="fill-accent" />
    </svg>
  );
}

function World() {
  const now = useNow(1000);
  const d = new Date(now);
  const ist = new Date(now + (IST_OFFSET_MIN + d.getTimezoneOffset()) * 60_000);
  const diff = (IST_OFFSET_MIN + d.getTimezoneOffset()) / 60;
  return (
    <div className="flex flex-col gap-5 p-5">
      <Face ts={now} />
      <div className="text-center">
        <div className="text-[40px] font-light tabular-nums leading-none">
          {pad(d.getHours())}:{pad(d.getMinutes())}
          <span className="text-fg3">:{pad(d.getSeconds())}</span>
        </div>
        <div className="mt-1.5 text-[13px] text-fg2">{dateLong(now)} · your local time</div>
      </div>
      <div className="k-card flex items-center gap-3 p-3.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold">{profile.firstName}&apos;s time</span>
          <span className="block truncate text-[12.5px] text-fg2">
            {diff === 0 ? "same as you" : `${Math.abs(diff)}h ${diff > 0 ? "ahead of" : "behind"} you`}
          </span>
        </span>
        <span className="text-[24px] font-light tabular-nums">
          {pad(ist.getHours())}:{pad(ist.getMinutes())}
        </span>
      </div>
    </div>
  );
}

const fmt = (ms: number, tenths = true) => {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60_000);
  const s = Math.floor(total / 1000) % 60;
  return `${pad(m)}:${pad(s)}${tenths ? `.${Math.floor((total % 1000) / 100)}` : ""}`;
};

function useElapsed() {
  const [st, setSt] = useState<{ base: number; since: number | null; now: number }>({ base: 0, since: null, now: 0 });
  const running = st.since !== null;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSt((s) => ({ ...s, now: Date.now() })), 100);
    return () => window.clearInterval(id);
  }, [running]);
  return {
    running,
    elapsed: st.base + (st.since === null ? 0 : Math.max(0, st.now - st.since)),
    start: () => {
      const t = Date.now();
      setSt((s) => ({ ...s, since: t, now: t }));
    },
    stop: () => setSt((s) => ({ base: s.base + (s.since === null ? 0 : Date.now() - s.since), since: null, now: 0 })),
    reset: () => setSt({ base: 0, since: null, now: 0 }),
  };
}

function Stopwatch() {
  const sw = useElapsed();
  const [laps, setLaps] = useState<number[]>([]);
  return (
    <div className="flex h-full flex-col items-center gap-5 p-5">
      <div className="mt-4 text-[56px] font-light tabular-nums leading-none">{fmt(sw.elapsed)}</div>
      <div className="flex gap-2.5">
        <button
          type="button"
          className="k-btn min-w-[92px]"
          disabled={!sw.running && sw.elapsed === 0}
          onClick={() => {
            if (sw.running) setLaps((l) => [sw.elapsed, ...l]);
            else {
              sw.reset();
              setLaps([]);
            }
          }}
        >
          {sw.running ? "Lap" : "Reset"}
        </button>
        <button type="button" className="k-btn k-btn-primary min-w-[92px]" onClick={() => (sw.running ? sw.stop() : sw.start())}>
          {sw.running ? "Stop" : "Start"}
        </button>
      </div>
      {laps.length > 0 && (
        <div className="k-card w-full max-w-[320px] overflow-hidden">
          {laps.map((l, i) => (
            <div key={l} className="k-row !py-2 text-[13.5px] tabular-nums">
              <span className="flex-1 text-fg2">Lap {laps.length - i}</span>
              <span>{fmt(l - (laps[i + 1] ?? 0))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PRESETS = [1, 3, 5, 10, 25];

function TimerPane() {
  const [total, setTotal] = useState(5 * 60_000);
  const sw = useElapsed();
  const left = total - sw.elapsed;
  const done = left <= 0;
  const ringing = sw.running && done;

  useEffect(() => {
    if (ringing) {
      useSession.getState().notify({ app: "clock", title: "Timer", body: "Time is up.", open: { app: "clock" } });
    }
  }, [ringing]);

  return (
    <div className="flex h-full flex-col items-center gap-5 p-5">
      <div className="mt-4 text-[56px] font-light tabular-nums leading-none" style={{ color: done ? "var(--accent)" : undefined }}>
        {fmt(left, false)}
      </div>
      <div className="h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-ctl">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200"
          style={{ width: `${Math.max(0, Math.min(100, (left / total) * 100))}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            className={`k-btn ${total === m * 60_000 ? "k-btn-primary" : ""}`}
            aria-pressed={total === m * 60_000}
            disabled={sw.running && !done}
            onClick={() => {
              setTotal(m * 60_000);
              sw.reset();
            }}
          >
            {m} min
          </button>
        ))}
      </div>
      <div className="flex gap-2.5">
        <button type="button" className="k-btn min-w-[92px]" onClick={sw.reset}>
          Reset
        </button>
        <button
          type="button"
          className="k-btn k-btn-primary min-w-[92px]"
          disabled={done}
          onClick={() => (sw.running ? sw.stop() : sw.start())}
        >
          {sw.running ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}

export default function Clock() {
  const [section, setSection] = useState("clock");
  return (
    <AppFrame sections={SECTIONS} section={section} onSection={setSection} compact>
      {section === "clock" && <World />}
      {section === "stopwatch" && <Stopwatch />}
      {section === "timer" && <TimerPane />}
    </AppFrame>
  );
}
