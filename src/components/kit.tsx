"use client";

import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { profile } from "@/data/portfolio";

export function Page({ children, wide = false, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className={`os-page mx-auto w-full ${wide ? "max-w-[980px]" : "max-w-[720px]"} px-4 py-5 @min-[520px]:px-7 @min-[520px]:py-7 ${className}`}>
      {children}
    </div>
  );
}

export function Avatar({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`os-avatar inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        letterSpacing: "0.02em",
        background:
          "linear-gradient(140deg, color-mix(in srgb, var(--accent) 70%, #fff) 0%, var(--accent) 45%, color-mix(in srgb, var(--accent) 55%, #000) 100%)",
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.35), 0 2px 8px rgb(0 0 0 / 0.22)",
      }}
      role="img"
      aria-label={profile.name}
    >
      {profile.initials}
    </span>
  );
}

export function Heading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`os-heading mb-2.5 mt-7 first:mt-0 ${className}`}>{children}</h2>;
}

export function Fact({ icon: FactIcon, label, children }: { icon: Icon; label: string; children: ReactNode }) {
  return (
    <div className="k-row">
      <FactIcon size={18} className="shrink-0 text-accent" />
      <span className="w-[86px] shrink-0 text-[13px] text-fg2">{label}</span>
      <span className="selectable min-w-0 flex-1 text-[13px]">{children}</span>
    </div>
  );
}

export function Empty({ icon: EmptyIcon, title, children }: { icon: Icon; title: string; children?: ReactNode }) {
  return (
    <div className="grid h-full min-h-[220px] place-items-center p-6 text-center">
      <div className="max-w-[340px]">
        <EmptyIcon size={44} weight="duotone" className="mx-auto mb-3 text-fg3" />
        <div className="text-[15px] font-semibold">{title}</div>
        {children && <div className="mt-1.5 text-[13px] leading-relaxed text-fg2">{children}</div>}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="os-toggle"
      data-on={on}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  );
}

export function Slider({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      className="os-slider"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
      data-no-drag
    />
  );
}
