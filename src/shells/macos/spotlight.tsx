"use client";

import {
  ArrowBendDownLeft,
  Browsers,
  DotsThree,
  FileText,
  Folder,
  GearSix,
  ImageSquare,
  Lightning,
  LockSimple,
  MagnifyingGlass,
  Moon,
  Power,
  ArrowClockwise,
  SquaresFour,
  Sun,
  type Icon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { APPS, appName, launchable, type AppCategory } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { toggleDropdown } from "@/components/menu";
import { launch, openExternal } from "@/lib/launch";
import { KIND_LABEL, search, type HitKind } from "@/lib/search";
import { walk } from "@/lib/vfs";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import { useWM } from "@/stores/window-manager";
import type { AppId } from "@/types";
import { SIRI_SUGGESTIONS, looksLikeQuestion } from "./answers";
import { SiriOrb } from "./glyphs";

export type SpotlightMode = "all" | "apps" | "files" | "actions";

interface Row {
  id: string;
  group: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  ask?: boolean;
  run: () => void;
}

const MODES: { id: Exclude<SpotlightMode, "all">; label: string; key: string; icon: Icon }[] = [
  { id: "apps", label: "Apps", key: "1", icon: SquaresFour },
  { id: "files", label: "Files", key: "2", icon: Folder },
  { id: "actions", label: "Actions", key: "3", icon: Lightning },
];

const CATEGORIES: { id: AppCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "portfolio", label: "Portfolio" },
  { id: "system", label: "System" },
  { id: "utility", label: "Utilities" },
  { id: "game", label: "Games" },
];

const SUGGESTED: AppId[] = ["about", "projects", "resume", "contact"];

function ActionIcon({ icon: Glyph }: { icon: Icon }) {
  return (
    <span className="mac-spot-glyph">
      <Glyph size={17} weight="fill" />
    </span>
  );
}

function actionRows(close: () => void): Row[] {
  const settings = useSettings.getState();
  const session = useSession.getState();
  const make = (id: string, title: string, subtitle: string, icon: Icon, run: () => void): Row => ({
    id: `action:${id}`,
    group: "Actions",
    icon: <ActionIcon icon={icon} />,
    title,
    subtitle,
    run: () => {
      close();
      run();
    },
  });
  return [
    make("dark", "Dark Appearance", "Switch to dark mode", Moon, () => settings.setTheme("dark")),
    make("light", "Light Appearance", "Switch to light mode", Sun, () => settings.setTheme("light")),
    make("wallpaper", "Change Wallpaper", "Open Wallpaper settings", ImageSquare, () => launch("settings", { section: "wallpaper" })),
    make("glass", "Adjust Liquid Glass", "Open Appearance settings", GearSix, () => launch("settings", { section: "appearance" })),
    make("mission", "Mission Control", "Show every open window", Browsers, () => useWM.getState().setOverview(true)),
    make("lock", "Lock Screen", "Lock this session", LockSimple, () => session.power("lock")),
    make("restart", "Restart", "Choose another operating system", ArrowClockwise, () => session.power("restart")),
    make("shutdown", "Shut Down", "Power off", Power, () => session.power("shutdown")),
  ];
}

function fileRows(close: () => void): Row[] {
  return walk()
    .filter((e) => !e.node.hidden)
    .map((e) => {
      const { node } = e;
      const path = e.path.join("/");
      return {
        id: `file:${path}`,
        group: "Files",
        icon: (
          <span className="mac-spot-glyph" data-kind={node.type}>
            {node.type === "dir" ? <Folder size={18} weight="fill" /> : <FileText size={18} weight="fill" />}
          </span>
        ),
        title: node.name,
        subtitle: ["~", ...e.path.slice(0, -1)].join("/"),
        run: () => {
          close();
          if (node.type === "dir") launch("files", { path });
          else if (node.kind === "link" && node.href) {
            if (node.href.startsWith("mailto:")) openExternal(node.href);
            else launch("browser", { url: node.href });
          } else launch("viewer", { path });
        },
      };
    });
}

export function Spotlight({
  initial,
  onClose,
  onAsk,
}: {
  initial: SpotlightMode;
  onClose: () => void;
  onAsk: (question: string) => void;
}) {
  const [mode, setModeRaw] = useState<SpotlightMode>(initial);
  const [query, setQueryRaw] = useState("");
  const [index, setIndex] = useState(0);
  const [category, setCategory] = useState<AppCategory | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const input = useRef<HTMLInputElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  const setQuery = (v: string) => {
    setQueryRaw(v);
    setIndex(0);
  };
  const setMode = (m: SpotlightMode) => {
    setModeRaw(m);
    setQueryRaw("");
    setIndex(0);
    input.current?.focus();
  };

  const apps = useMemo(
    () =>
      launchable("macos").filter(
        (id) =>
          (category === "all" || APPS[id].category === category) &&
          `${appName(id, "macos")} ${APPS[id].name} ${APPS[id].keywords ?? ""}`.toLowerCase().includes(q),
      ),
    [category, q],
  );

  const rows = useMemo<Row[]>(() => {
    const ask = (text: string): Row => ({
      id: `ask:${text}`,
      group: "Siri",
      icon: <SiriOrb size={28} />,
      title: text,
      subtitle: "Ask Siri",
      ask: true,
      run: () => onAsk(text),
    });
    if (mode === "files") return fileRows(onClose).filter((r) => r.title.toLowerCase().includes(q)).slice(0, 9);
    if (mode === "actions") return actionRows(onClose).filter((r) => `${r.title} ${r.subtitle}`.toLowerCase().includes(q));
    if (mode === "apps") return [];
    if (!q) {
      return [
        ...SUGGESTED.map(
          (id): Row => ({
            id: `app:${id}`,
            group: "Suggestions",
            icon: <AppIcon id={id} size={28} />,
            title: appName(id, "macos"),
            subtitle: "App",
            run: () => {
              onClose();
              launch(id);
            },
          }),
        ),
        ...SIRI_SUGGESTIONS.slice(0, 2).map(ask),
      ];
    }
    const hits = search(query, "macos", 7);
    const found: Row[] = [];
    const kinds: HitKind[] = [];
    for (const h of hits) if (!kinds.includes(h.kind)) kinds.push(h.kind);
    for (const kind of kinds) {
      for (const h of hits.filter((x) => x.kind === kind)) {
        found.push({
          id: h.id,
          group: KIND_LABEL[kind],
          icon: <AppIcon id={h.app} size={28} />,
          title: h.title,
          subtitle: h.subtitle,
          run: () => {
            onClose();
            h.run();
          },
        });
      }
    }
    const siri = ask(query.trim());
    return looksLikeQuestion(query) || !found.length ? [siri, ...found] : [...found, siri];
  }, [mode, q, query, onAsk, onClose]);

  const count = mode === "apps" ? apps.length : rows.length;
  const at = Math.min(index, Math.max(0, count - 1));
  const current = mode === "apps" ? null : rows[at];
  const asking = Boolean(current?.ask && q);

  const runCurrent = () => {
    if (mode === "apps") {
      const id = apps[at];
      if (!id) return;
      onClose();
      launch(id);
    } else current?.run();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = (by: number) => {
      e.preventDefault();
      setIndex(Math.min(count - 1, Math.max(0, at + by)));
    };
    if ((e.metaKey || e.ctrlKey) && ["1", "2", "3"].includes(e.key)) {
      e.preventDefault();
      setMode(MODES[Number(e.key) - 1].id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      runCurrent();
    } else if (e.key === "Backspace" && !query && mode !== "all") {
      e.preventDefault();
      setMode("all");
    } else if (mode === "apps" && view === "grid") {
      const cols = grid.current ? getComputedStyle(grid.current).gridTemplateColumns.split(" ").length : 6;
      if (e.key === "ArrowDown") step(cols);
      else if (e.key === "ArrowUp") step(-cols);
      else if (e.key === "ArrowRight" && !query) step(1);
      else if (e.key === "ArrowLeft" && !query) step(-1);
    } else if (e.key === "ArrowDown") step(1);
    else if (e.key === "ArrowUp") step(-1);
  };

  const modeDef = MODES.find((m) => m.id === mode);
  const LeadIcon = modeDef?.icon ?? MagnifyingGlass;

  return (
    <motion.div
      className="mac-spot-layer fixed inset-0 z-[2000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="mac-spot mac-glass mx-auto"
        data-mode={mode}
        data-ask={asking || undefined}
        role="dialog"
        aria-label={mode === "apps" ? "Apps" : "Spotlight"}
        initial={{ scale: 0.96, y: -8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.98, y: -4 }}
        transition={{ type: "spring", stiffness: 520, damping: 36 }}
      >
        <label className="mac-spot-field">
          <span className="mac-spot-lead">{asking ? <SiriOrb size={24} /> : <LeadIcon size={22} weight={modeDef ? "fill" : "regular"} />}</span>
          {modeDef && <span className="mac-spot-token">{modeDef.label}</span>}
          <span className="relative min-w-0 flex-1">
            <input
              ref={input}
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={mode === "apps" ? "Search apps" : mode === "files" ? "Search files" : mode === "actions" ? "Search actions" : "Search or Ask Siri"}
              aria-label={mode === "all" ? "Spotlight: search or ask Siri" : `Search ${mode}`}
              className="mac-spot-input"
              autoComplete="off"
              spellCheck={false}
            />
            {asking && (
              <span className="mac-spot-ghost" aria-hidden="true">
                <span className="invisible">{query}</span>
                <span className="mac-spot-suffix"> — Ask Siri</span>
              </span>
            )}
          </span>
          {mode === "all" && !query && (
            <span className="mac-spot-modes">
              {MODES.map((m) => {
                const ModeIcon = m.icon;
                return (
                  <button key={m.id} type="button" className="mac-spot-mode" aria-label={`${m.label} (⌘${m.key})`} title={`${m.label}  ⌘${m.key}`} onClick={() => setMode(m.id)}>
                    <ModeIcon size={17} weight="fill" />
                  </button>
                );
              })}
            </span>
          )}
          {mode === "apps" && (
            <button
              type="button"
              className="mac-spot-mode"
              aria-label="View options"
              data-menu-trigger
              onClick={(e) =>
                toggleDropdown(
                  e.currentTarget,
                  "spot:view",
                  [
                    { label: "Grid", checked: view === "grid", onSelect: () => setView("grid") },
                    { label: "List", checked: view === "list", onSelect: () => setView("list") },
                  ],
                  { align: "end", minWidth: 150 },
                )
              }
            >
              <DotsThree size={20} weight="bold" />
            </button>
          )}
          {asking && (
            <span className="mac-spot-return" aria-hidden="true">
              <ArrowBendDownLeft size={15} weight="bold" />
            </span>
          )}
        </label>

        {mode === "apps" ? (
          <div className="mac-spot-body">
            <div className="mac-apps-cats" role="tablist" aria-label="App categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  data-on={category === c.id}
                  className="mac-apps-cat"
                  onClick={() => {
                    setCategory(c.id);
                    setIndex(0);
                    input.current?.focus();
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div ref={grid} className="mac-apps-grid" data-view={view}>
              {apps.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  className="mac-apps-item"
                  data-on={i === at}
                  onPointerMove={() => i !== at && setIndex(i)}
                  onClick={() => {
                    onClose();
                    launch(id);
                  }}
                >
                  <AppIcon id={id} size={view === "grid" ? 56 : 28} />
                  <span className="mac-apps-name">{appName(id, "macos")}</span>
                </button>
              ))}
            </div>
            {apps.length === 0 && <p className="mac-spot-empty">No apps match &quot;{query.trim()}&quot;</p>}
          </div>
        ) : (
          <div className="mac-spot-body mac-spot-list">
            {rows.length === 0 && <p className="mac-spot-empty">No results for &quot;{query.trim()}&quot;</p>}
            {rows.map((r, i) => {
              const head = i === 0 || rows[i - 1].group !== r.group ? r.group : null;
              return (
                <div key={r.id}>
                  {head && <div className="mac-spot-head">{head}</div>}
                  <button type="button" className="mac-spot-row" data-on={i === at} data-ask={r.ask || undefined} onPointerMove={() => i !== at && setIndex(i)} onClick={r.run}>
                    <span className="mac-spot-icon">{r.icon}</span>
                    <span className="min-w-0 flex-1 truncate">{r.title}</span>
                    <span className="mac-spot-sub">{r.subtitle}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
