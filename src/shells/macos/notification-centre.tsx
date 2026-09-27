"use client";

import { motion } from "motion/react";
import { NoticeList } from "@/components/notifications";
import { useSession } from "@/stores/session";
import { MENU_H } from "./constants";
import { CalendarWidget, ClockWidget, NowWidget } from "./widgets";

export function NotificationCentre({ onClose }: { onClose: () => void }) {
  const hasNotices = useSession((s) => s.notices.length > 0);
  return (
    <motion.div
      className="mac-nc fixed bottom-2 right-2 z-[1800] overflow-y-auto"
      style={{ top: MENU_H + 6 }}
      data-panel
      role="dialog"
      aria-label="Notification Centre"
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
    >
      {hasNotices && (
        <div className="mb-2 flex justify-end">
          <button type="button" className="mac-nc-clear mac-glass" data-glass="smoke" onClick={() => useSession.getState().clearNotices()}>
            Clear All
          </button>
        </div>
      )}
      <NoticeList empty="No Notifications" onOpen={onClose} />
      <div className="mac-nc-widgets">
        <CalendarWidget onOpen={onClose} />
        <ClockWidget onOpen={onClose} />
        <NowWidget onOpen={onClose} />
      </div>
    </motion.div>
  );
}
