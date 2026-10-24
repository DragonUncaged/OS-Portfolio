"use client";

import { ArrowClockwise, ArrowRight, Command, Power } from "@phosphor-icons/react";
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
      <div className="flex flex-col items-center gap-14">
        <Command size={78} weight="regular" />
        <div className="mac-boot-track">
          <div className="mac-boot-bar" />
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
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <ShellWallpaper className="mac-wallpaper" />
      <div className="mac-login-shade absolute inset-0" />
      <div className="relative flex h-full flex-col items-center justify-between px-6 pb-[4.5vh] pt-[8vh]">
        <div className="text-center">
          <div className="mac-login-date">{dateLong(now)}</div>
          <div className="mac-login-time tabular-nums">{time12(now)}</div>
        </div>
        <form
          className="flex flex-col items-center"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <Avatar size={64} />
          <div className="mt-2.5 text-center">
            <div className="text-[17px] font-semibold">{profile.name}</div>
            <div className="text-[12.5px] opacity-75">{profile.role}</div>
          </div>
          <div className="relative mt-3">
            <input
              type="password"
              name="password"
              autoFocus
              autoComplete="off"
              placeholder="Enter Password"
              aria-label="Password (any or none)"
              className="mac-login-field mac-glass"
              data-glass="smoke"
            />
            <button type="submit" className="mac-login-go" aria-label={loggedIn ? "Unlock" : "Log in"}>
              <ArrowRight size={13} weight="bold" />
            </button>
          </div>
          <p className="mt-2.5 text-[12px] opacity-80">No password needed, just press Return</p>
          <div className="mt-7 flex justify-center gap-7">
            <button type="button" className="mac-login-power" onClick={() => power("restart")}>
              <span className="mac-glass" data-glass="smoke">
                <ArrowClockwise size={17} weight="bold" />
              </span>
              Restart
            </button>
            <button type="button" className="mac-login-power" onClick={() => power("shutdown")}>
              <span className="mac-glass" data-glass="smoke">
                <Power size={17} weight="bold" />
              </span>
              Shut Down
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
