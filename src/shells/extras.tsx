"use client";

import { Power } from "@phosphor-icons/react";
import { useSession } from "@/stores/session";

export function OffScreen() {
  const on = () => useSession.getState().setPhase("picker");
  return (
    <div className="grid h-full place-items-center bg-black text-white">
      <div className="flex flex-col items-center gap-4" style={{ animation: "k-fade-in 1.2s ease-out 0.6s both" }}>
        <button
          type="button"
          autoFocus
          className="grid size-16 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
          aria-label="Power on"
          onClick={on}
        >
          <Power size={28} />
        </button>
        <p className="text-[13px] text-white/45">Press to power on</p>
      </div>
    </div>
  );
}
