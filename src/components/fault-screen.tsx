import type { ReactNode } from "react";

export const FAULT_ACTION =
  "mt-7 inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-[14px] font-medium text-white/85 transition-colors hover:border-white/50 hover:text-white";

export function FaultScreen({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <main className="relative grid h-full place-items-center bg-[#06070a] px-6 text-white">
      <div className="picker-glow pointer-events-none absolute inset-0" />
      <div className="relative max-w-[440px] text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/45">{code}</p>
        <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}
