"use client";

import { motion } from "motion/react";
import { NoticeList } from "@/components/notifications";
import { currentJob } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { DAYS, MONTHS } from "@/lib/format";
import { launch } from "@/lib/launch";
import { useSession } from "@/stores/session";
import { MENU_H } from "./constants";

export function NotificationCentre({ onClose }: { onClose: () => void }) {
  const now = useNow(60_000);
  const today = new Date(now);
  const first = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const count = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const hasNotices = useSession((s) => s.notices.length > 0);
  return (
    <motion.div
      className="mac-nc fixed bottom-2 right-2 z-[1800] w-[340px] max-w-[calc(100vw-16px)] overflow-y-auto p-1"
      style={{ top: MENU_H + 6 }}
      data-panel
      role="dialog"
      aria-label="Notification Centre"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    >
      <div className="mb-2 flex items-center justify-between px-2 text-white drop-shadow">
        <span className="text-[13px] font-semibold">Notifications</span>
        {hasNotices && (
          <button type="button" className="mac-nc-clear" onClick={() => useSession.getState().clearNotices()}>
            Clear All
          </button>
        )}
      </div>
      <NoticeList onOpen={onClose} />
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button type="button" className="mac-widget text-left" onClick={() => (onClose(), launch("calendar"))}>
          <div className="text-[11px] font-bold uppercase text-[#ff453a]">{DAYS[today.getDay()]}</div>
          <div className="text-[34px] font-light leading-none">{today.getDate()}</div>
          <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center text-[8.5px]">
            {Array.from({ length: first }, (_, i) => (
              <span key={`b${i}`} />
            ))}
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className={i + 1 === today.getDate() ? "rounded-full bg-[#ff453a] font-bold text-white" : "opacity-70"}>
                {i + 1}
              </span>
            ))}
          </div>
          <div className="mt-1 text-[10px] opacity-55">{MONTHS[today.getMonth()]}</div>
        </button>
        <button type="button" className="mac-widget flex flex-col text-left" onClick={() => (onClose(), launch("experience"))}>
          <div className="text-[11px] font-bold uppercase opacity-60">Currently</div>
          <div className="mt-1 text-[15px] font-semibold leading-tight">{currentJob.role}</div>
          <div className="text-[13px] opacity-75">{currentJob.company}</div>
          <div className="mt-auto pt-2 text-[11px] opacity-55">{currentJob.period}</div>
        </button>
      </div>
    </motion.div>
  );
}
