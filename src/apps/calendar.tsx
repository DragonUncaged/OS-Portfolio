"use client";

import { Briefcase, CalendarCheck, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { experience } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { DAYS, MONTHS } from "@/lib/format";

const MILESTONES = experience.flatMap((j) => [
  { ym: j.start, text: `Joined ${j.company} as ${j.role}` },
  ...(j.end ? [{ ym: j.end, text: `Wrapped up at ${j.company}` }] : []),
]);

const ymOf = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

export default function Calendar() {
  const now = useNow(60_000);
  const today = new Date(now);
  const [view, setView] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [picked, setPicked] = useState<number | null>(null);

  const first = new Date(view.y, view.m, 1).getDay();
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((first + count) / 7) * 7 }, (_, i) => {
    const d = i - first + 1;
    return d >= 1 && d <= count ? d : null;
  });
  const isThisMonth = view.y === today.getFullYear() && view.m === today.getMonth();
  const step = (delta: number) => {
    setPicked(null);
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const milestones = MILESTONES.filter((e) => e.ym === ymOf(view.y, view.m));
  const pickedDate = picked ? new Date(view.y, view.m, picked) : isThisMonth ? today : null;

  return (
    <AppFrame
      title={`${MONTHS[view.m]} ${view.y}`}
      compact
      actions={[
        { id: "prev", label: "Previous month", icon: CaretLeft, onClick: () => step(-1) },
        {
          id: "today",
          label: "Today",
          icon: CalendarCheck,
          disabled: isThisMonth,
          onClick: () => {
            setPicked(null);
            setView({ y: today.getFullYear(), m: today.getMonth() });
          },
        },
        { id: "next", label: "Next month", icon: CaretRight, onClick: () => step(1) },
      ]}
    >
      <div className="flex min-h-full flex-col gap-4 p-3 @min-[640px]:flex-row @min-[640px]:p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 grid grid-cols-7 text-center text-[11.5px] font-semibold uppercase tracking-wide text-fg3">
            {DAYS.map((d) => (
              <span key={d} className="py-1.5">
                {d.slice(0, 3)}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  className="os-day grid aspect-square max-h-[64px] w-full place-items-center rounded-ctl text-[14px] tabular-nums"
                  data-today={isThisMonth && d === today.getDate()}
                  data-on={picked === d}
                  aria-label={`${MONTHS[view.m]} ${d}, ${view.y}`}
                  aria-pressed={picked === d}
                  onClick={() => setPicked(d)}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </div>
        <aside className="shrink-0 @min-[640px]:w-[230px]">
          <div className="k-card p-3.5">
            <div className="k-label">{pickedDate ? DAYS[pickedDate.getDay()] : MONTHS[view.m]}</div>
            <div className="mt-0.5 text-[22px] font-semibold leading-tight">
              {pickedDate ? `${MONTHS[pickedDate.getMonth()]} ${pickedDate.getDate()}` : view.y}
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <div className="k-label mb-2">This month in my career</div>
              {milestones.length ? (
                <ul className="space-y-2">
                  {milestones.map((e) => (
                    <li key={e.text} className="flex gap-2 text-[13px] leading-snug">
                      <Briefcase size={15} weight="fill" className="mt-0.5 shrink-0 text-accent" />
                      {e.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-fg3">Nothing recorded for this month.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AppFrame>
  );
}
