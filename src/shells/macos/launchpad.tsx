"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { APPS, appName, launchable } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { launch } from "@/lib/launch";

export function Launchpad({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const apps = launchable("macos").filter((id) =>
    `${appName(id, "macos")} ${APPS[id].keywords ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <motion.div
      className="mac-launchpad fixed inset-0 z-[1500] overflow-y-auto"
      role="dialog"
      aria-label="Launchpad"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto flex min-h-full max-w-[980px] flex-col px-6 pb-28 pt-14" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <label className="mac-launchpad-search mx-auto flex h-8 w-[240px] items-center gap-2 rounded-lg px-2.5">
          <MagnifyingGlass size={14} className="opacity-70" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && apps[0]) {
                onClose();
                launch(apps[0]);
              }
            }}
            placeholder="Search"
            aria-label="Search apps"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/60"
          />
        </label>
        <div
          className="mt-10 grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-5 md:grid-cols-7"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {apps.map((id, i) => (
            <motion.button
              key={id}
              type="button"
              className="mac-launchpad-app flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.012, 0.2) }}
              onClick={() => {
                onClose();
                launch(id);
              }}
            >
              <AppIcon id={id} size={72} />
              <span className="max-w-full truncate text-[12.5px] text-white">{appName(id, "macos")}</span>
            </motion.button>
          ))}
        </div>
        {apps.length === 0 && <p className="mt-16 text-center text-[14px] text-white/70">No apps match &quot;{query}&quot;</p>}
      </div>
    </motion.div>
  );
}
