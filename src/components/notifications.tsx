"use client";

import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion, type TargetAndTransition } from "motion/react";
import type { CSSProperties } from "react";
import { appName } from "@/apps/registry";
import { useBanner } from "@/hooks/use-banner";
import { useNow } from "@/hooks/use-now";
import { ago } from "@/lib/format";
import { launch } from "@/lib/launch";
import { usePlatform, useSession, type Notice } from "@/stores/session";
import { AppIcon } from "./app-icon";

function openNotice(n: Notice) {
  useSession.getState().hideBanner();
  if (n.open) launch(n.open.app, n.open.args);
}

export function Banner({
  className,
  style,
  from,
}: {
  className: string;
  style?: CSSProperties;
  from: TargetAndTransition;
}) {
  const notice = useBanner();
  const platform = usePlatform();
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          key={notice.id}
          className={`os-banner z-[3500] ${className}`}
          style={style}
          role="status"
          initial={{ opacity: 0, ...from }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, ...from }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => openNotice(notice)}>
            <AppIcon id={notice.app} size={36} />
            <span className="min-w-0 flex-1">
              <span className="os-banner-app block truncate">{appName(notice.app, platform)}</span>
              <span className="block truncate text-[13.5px] font-semibold">{notice.title}</span>
              <span className="line-clamp-2 block text-[13px] opacity-80">{notice.body}</span>
            </span>
          </button>
          <button
            type="button"
            className="os-banner-close"
            aria-label="Dismiss notification"
            onClick={() => useSession.getState().hideBanner()}
          >
            <X size={12} weight="bold" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NoticeList({ empty = "No notifications", onOpen }: { empty?: string; onOpen?: () => void }) {
  const notices = useSession((s) => s.notices);
  const platform = usePlatform();
  const now = useNow(30_000);
  if (!notices.length) return <p className="os-notice-empty py-6 text-center text-[13px] opacity-60">{empty}</p>;
  return (
    <div className="flex flex-col gap-2">
      {notices.map((n) => (
        <div key={n.id} className="os-notice relative">
          <button
            type="button"
            className="flex w-full items-start gap-2.5 text-left"
            onClick={() => {
              openNotice(n);
              useSession.getState().dismiss(n.id);
              onOpen?.();
            }}
          >
            <AppIcon id={n.app} size={30} />
            <span className="min-w-0 flex-1 pr-5">
              <span className="flex items-baseline justify-between gap-2 text-[11.5px] opacity-65">
                <span className="truncate">{appName(n.app, platform)}</span>
                <span className="shrink-0">{ago(n.at, now)}</span>
              </span>
              <span className="block truncate text-[13px] font-semibold">{n.title}</span>
              <span className="line-clamp-3 block text-[12.5px] opacity-80">{n.body}</span>
            </span>
          </button>
          <button
            type="button"
            className="os-notice-close absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full opacity-60 hover:opacity-100"
            aria-label={`Dismiss ${n.title}`}
            onClick={() => useSession.getState().dismiss(n.id)}
          >
            <X size={11} weight="bold" />
          </button>
        </div>
      ))}
    </div>
  );
}
