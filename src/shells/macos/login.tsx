"use client";

import { ArrowRight, Command } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Avatar } from "@/components/kit";
import { ShellWallpaper } from "@/components/shell-root";
import { profile } from "@/data/portfolio";
import { useBootTimer } from "@/hooks/use-boot-timer";
import { useNow } from "@/hooks/use-now";
import { dateLong, time12 } from "@/lib/format";
import { useSession } from "@/stores/session";

export function Boot() {
  const skip = useBootTimer(2300);
  return (
    <motion.button
      type="button"
      className="mac-boot fixed inset-0 z-[5000] grid cursor-default place-items-center bg-black text-white"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Starting up. Click to skip"
      onClick={skip}
    >
      <div className="flex flex-col items-center gap-12">
        <Command size={84} weight="regular" />
        <div className="h-[5px] w-[190px] overflow-hidden rounded-full bg-white/20">
          <div className="mac-boot-bar h-full rounded-full bg-white" />
        </div>
      </div>
    </motion.button>
  );
}

export function Login() {
  const now = useNow(1000);
  const loggedIn = useSession((s) => s.loggedIn);
  const { login, power } = useSession.getState();
  return (
    <motion.div
      className="mac-login fixed inset-0 z-[4500] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45 }}
    >
      <ShellWallpaper />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl" />
      <div className="relative flex h-full flex-col items-center justify-between px-6 py-[7vh]">
        <div className="text-center drop-shadow-[0_2px_12px_rgb(0_0_0/0.3)]">
          <div className="text-[22px] font-medium opacity-90">{dateLong(now)}</div>
          <div className="mt-1 text-[96px] font-semibold leading-none tracking-tight">{time12(now)}</div>
        </div>
        <form
          className="flex flex-col items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <Avatar size={84} />
          <div className="text-center">
            <div className="text-[19px] font-semibold">{profile.name}</div>
            <div className="text-[13px] opacity-75">{profile.role}</div>
          </div>
          <div className="relative mt-1">
            <input
              type="password"
              autoFocus
              autoComplete="off"
              placeholder="Enter Password"
              aria-label="Password (any or none)"
              className="mac-login-field h-8 w-[196px] rounded-full pl-3.5 pr-9 text-[13px] text-white placeholder:text-white/60"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-white/25 hover:bg-white/40"
              aria-label={loggedIn ? "Unlock" : "Log in"}
            >
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>
          <p className="text-[12px] opacity-70">No password needed, just press Return</p>
        </form>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-[12px]">
          <button type="button" className="mac-login-power" onClick={() => power("restart")}>
            Restart
          </button>
          <button type="button" className="mac-login-power" onClick={() => power("shutdown")}>
            Shut Down
          </button>
        </div>
      </div>
    </motion.div>
  );
}
