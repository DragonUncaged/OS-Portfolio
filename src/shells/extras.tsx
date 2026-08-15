"use client";

import { Command, Power } from "@phosphor-icons/react";
import { useEffect } from "react";
import { profile } from "@/data/portfolio";
import { useWindowEvent } from "@/hooks/use-window-event";
import { useSession } from "@/stores/session";
import type { Family } from "@/types";

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

export function Panic({ family }: { family: Family }) {
  const reboot = () => useSession.getState().start(family);
  useWindowEvent("keydown", reboot);
  useEffect(() => {
    const id = window.setTimeout(() => useSession.getState().start(family), 9000);
    return () => window.clearTimeout(id);
  }, [family]);

  if (family === "windows") {
    return (
      <button type="button" className="block h-full w-full cursor-default bg-[#0a5fd1] p-[8vmin] text-left text-white" onClick={reboot}>
        <div className="text-[18vmin] font-light leading-none">:(</div>
        <p className="mt-[5vmin] max-w-[70ch] text-[3.2vmin] font-light leading-snug">
          Your device ran into a problem and needs to restart. Someone tried to delete the entire portfolio.
        </p>
        <p className="mt-[4vmin] text-[2.6vmin] font-light">100% complete</p>
        <div className="mt-[5vmin] flex items-start gap-[3vmin]">
          <div
            className="size-[14vmin] shrink-0 bg-white p-[1vmin]"
            style={{
              backgroundImage:
                "conic-gradient(#0a5fd1 25%, transparent 0 50%, #0a5fd1 0 75%, transparent 0), conic-gradient(transparent 25%, #0a5fd1 0 50%, transparent 0 75%, #0a5fd1 0)",
              backgroundSize: "3.1vmin 3.1vmin, 4.7vmin 4.7vmin",
              backgroundClip: "content-box",
            }}
          />
          <div className="text-[1.9vmin] font-light leading-relaxed">
            <p>For more information about this issue and possible fixes, do not run rm -rf /</p>
            <p className="mt-[1.5vmin]">Stop code: PORTFOLIO_FILES_ARE_LOAD_BEARING</p>
            <p>Click or press any key to restart</p>
          </div>
        </div>
      </button>
    );
  }

  if (family === "linux") {
    const lines = [
      "[    4.812356] rm: cannot remove '/': the portfolio is load-bearing",
      "[    4.812401] Kernel panic - not syncing: Attempted to kill the portfolio!",
      `[    4.812455] CPU: 0 PID: 1 Comm: guest Tainted: G        W  web-${profile.handle}`,
      "[    4.812502] Call Trace:",
      "[    4.812533]  <TASK>",
      "[    4.812561]  dump_stack_lvl+0x48/0x70",
      "[    4.812598]  panic+0x1a2/0x350",
      "[    4.812631]  do_exit.cold+0x15/0x15",
      "[    4.812667]  sudo_hire_me+0x2a/0x40",
      "[    4.812701]  </TASK>",
      "[    4.812744] ---[ end Kernel panic - not syncing: Attempted to kill the portfolio! ]---",
      "",
      "Click or press any key to reboot_",
    ];
    return (
      <button
        type="button"
        className="block h-full w-full cursor-default overflow-hidden bg-black p-5 text-left font-mono text-[12.5px] leading-relaxed text-[#d7d7d7]"
        onClick={reboot}
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap" style={{ animation: `k-fade-in 0.01s linear ${i * 0.07}s both` }}>
            {l || " "}
          </div>
        ))}
      </button>
    );
  }

  return (
    <button type="button" className="grid h-full w-full cursor-default place-items-center bg-[#1b1b1d] p-6 text-center text-white" onClick={reboot}>
      <div className="max-w-[520px]">
        <Command size={54} className="mx-auto mb-6 text-white/50" />
        <p className="text-[19px] font-medium leading-snug">Your computer restarted because of a problem.</p>
        <p className="mt-2 text-[14px] leading-relaxed text-white/60">
          Something tried to remove every file on this portfolio. Click or press any key to start up again.
        </p>
      </div>
    </button>
  );
}

export function DragonOverlay() {
  const dragon = useSession((s) => s.dragon);
  if (!dragon) return null;
  return (
    <div key={dragon} className="dragon-overlay pointer-events-none fixed inset-0 z-[9500] overflow-hidden" aria-hidden="true">
      <div className="dragon-flight absolute left-0 top-[28%] flex items-center gap-1 whitespace-nowrap text-[72px]">
        <span className="dragon-fire text-[40px]">🔥🔥🔥</span>
        <span className="dragon-body">🐉</span>
      </div>
      <div className="dragon-caption absolute inset-x-0 top-[52%] text-center text-[22px] font-semibold tracking-wide text-white">
        @{profile.handle}, the dragon is uncaged
      </div>
    </div>
  );
}
