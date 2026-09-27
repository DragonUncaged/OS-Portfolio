"use client";

import { currentJob } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { DAYS, MONTHS } from "@/lib/format";
import { launch } from "@/lib/launch";
import { useWM } from "@/stores/window-manager";

export function CalendarWidget({ onOpen }: { onOpen?: () => void }) {
  const now = useNow(60_000);
  const today = new Date(now);
  const first = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const count = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return (
    <button type="button" className="mac-widget" data-widget="calendar" aria-label="Calendar" onClick={() => (onOpen?.(), launch("calendar"))}>
      <span className="flex items-baseline justify-between gap-2">
        <span className="mac-widget-kicker truncate">{DAYS[today.getDay()]}</span>
        <span className="mac-widget-kicker" data-tone="quiet">
          {MONTHS[today.getMonth()].slice(0, 3)}
        </span>
      </span>
      <span className="mac-widget-date">{today.getDate()}</span>
      <span className="mac-widget-month">
        {Array.from({ length: first }, (_, i) => (
          <i key={`b${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => (
          <i key={i} data-today={i + 1 === today.getDate() || undefined}>
            {i + 1}
          </i>
        ))}
      </span>
    </button>
  );
}

export function ClockWidget({ onOpen }: { onOpen?: () => void }) {
  const now = new Date(useNow(1000));
  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  return (
    <button type="button" className="mac-widget" data-widget="clock" aria-label="Clock" onClick={() => (onOpen?.(), launch("clock"))}>
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <circle cx="50" cy="50" r="46" className="mac-clock-face" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="9" x2="50" y2={i % 3 === 0 ? 17 : 14} className="mac-clock-tick" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line x1="50" y1="54" x2="50" y2="27" className="mac-clock-hand" strokeWidth="4.2" transform={`rotate(${h * 30} 50 50)`} />
        <line x1="50" y1="54" x2="50" y2="15" className="mac-clock-hand" strokeWidth="3" transform={`rotate(${m * 6} 50 50)`} />
        <line x1="50" y1="60" x2="50" y2="12" className="mac-clock-second" strokeWidth="1.2" transform={`rotate(${s * 6} 50 50)`} />
        <circle cx="50" cy="50" r="2.6" className="mac-clock-pin" />
      </svg>
    </button>
  );
}

export function NowWidget({ onOpen }: { onOpen?: () => void }) {
  return (
    <button type="button" className="mac-widget" data-widget="now" aria-label="Current role" onClick={() => (onOpen?.(), launch("experience"))}>
      <span className="mac-widget-kicker" data-tone="quiet">
        Currently
      </span>
      <span className="mac-widget-title">{currentJob.role}</span>
      <span className="mac-widget-sub">{currentJob.company}</span>
      <span className="mac-widget-foot">{currentJob.period}</span>
    </button>
  );
}

export function DesktopWidgets() {
  const busy = useWM((s) => s.wins.some((w) => !w.minimized));
  return (
    <div className="mac-desk-widgets" data-dim={busy || undefined}>
      <CalendarWidget />
      <ClockWidget />
    </div>
  );
}
