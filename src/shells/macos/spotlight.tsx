"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { appName } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { useLauncher } from "@/hooks/use-launcher";
import { launch } from "@/lib/launch";
import { KIND_LABEL, grouped } from "@/lib/search";
import type { AppId } from "@/types";

export function Spotlight({ onClose }: { onClose: () => void }) {
  const l = useLauncher(onClose);
  const suggestions: AppId[] = ["about", "projects", "resume", "contact", "terminal"];
  return (
    <motion.div
      className="fixed inset-0 z-[2000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="mac-spotlight mx-auto mt-[18vh] w-[min(640px,calc(100vw-32px))]"
        role="dialog"
        aria-label="Spotlight Search"
        initial={{ scale: 0.97, y: -6 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      >
        <label className="flex h-14 items-center gap-3 px-4">
          <MagnifyingGlass size={22} className="shrink-0 opacity-60" />
          <input
            autoFocus
            value={l.query}
            onChange={(e) => l.setQuery(e.target.value)}
            onKeyDown={l.onKeyDown}
            placeholder="Spotlight Search"
            aria-label="Spotlight Search"
            className="h-full min-w-0 flex-1 bg-transparent text-[22px] font-light outline-none placeholder:opacity-45"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {l.query.trim() ? (
          <div className="mac-spotlight-results max-h-[46vh] overflow-y-auto p-2">
            {l.hits.length === 0 && <p className="px-3 py-5 text-center text-[13px] opacity-60">No results for &quot;{l.query}&quot;</p>}
            {grouped(l.hits).map((g) => (
              <div key={g.kind}>
                <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold opacity-55">{KIND_LABEL[g.kind]}</div>
                {g.hits.map((h) => {
                  const i = l.hits.indexOf(h);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className="mac-spotlight-row"
                      data-on={i === l.index}
                      onPointerEnter={() => l.setIndex(i)}
                      onClick={() => l.run(h)}
                    >
                      <AppIcon id={h.app} size={26} />
                      <span className="min-w-0 flex-1 truncate">{h.title}</span>
                      <span className="max-w-[45%] shrink-0 truncate text-[12px] opacity-60">{h.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="mac-spotlight-results flex flex-wrap gap-1.5 p-3">
            {suggestions.map((id) => (
              <button
                key={id}
                type="button"
                className="mac-spotlight-chip"
                onClick={() => {
                  onClose();
                  launch(id);
                }}
              >
                <AppIcon id={id} size={20} />
                {appName(id, "macos")}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
