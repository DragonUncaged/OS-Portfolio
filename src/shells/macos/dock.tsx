"use client";

import { useRef, useState } from "react";
import { appName } from "@/apps/registry";
import { AppIcon } from "@/components/app-icon";
import { showContextMenu, type MenuItem } from "@/components/menu";
import { launch } from "@/lib/launch";
import { useWM } from "@/stores/window-manager";
import type { AppId } from "@/types";
import type { Panel } from "./constants";
import { AppsIcon, TrashIcon } from "./glyphs";

const DOCK_APPS: AppId[] = ["files", "about", "projects", "experience", "skills", "resume", "contact", "browser", "terminal", "notes", "music", "settings"];

const ICON = 48;

function DockItem({
  id,
  label,
  running,
  bouncing,
  children,
  onOpen,
  onMenu,
}: {
  id: string;
  label: string;
  running: boolean;
  bouncing: boolean;
  children: React.ReactNode;
  onOpen: () => void;
  onMenu?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      className="mac-dock-item"
      data-dock={id}
      data-bounce={bouncing || undefined}
      aria-label={label}
      onClick={onOpen}
      onContextMenu={onMenu}
    >
      <span className="mac-dock-label">{label}</span>
      <span className="mac-dock-icon">{children}</span>
      <span className="mac-dock-dot" data-on={running} />
    </button>
  );
}

export function Dock({ toggle }: { toggle: (p: Panel) => void }) {
  const wins = useWM((s) => s.wins);
  const ref = useRef<HTMLDivElement>(null);
  const [bounce, setBounce] = useState<string | null>(null);
  const running = new Set(wins.map((w) => w.appId));
  const extra = [...running].filter((id) => !DOCK_APPS.includes(id));

  // written straight to the DOM, a render per mousemove is too slow
  const magnify = (x: number | null) => {
    if (x !== null && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current?.querySelectorAll<HTMLElement>(".mac-dock-item").forEach((el) => {
      if (x === null) return el.style.setProperty("--s", "1");
      const b = el.getBoundingClientRect();
      const d = Math.abs(x - (b.left + b.width / 2));
      el.style.setProperty("--s", String(1 + 0.5 * Math.max(0, 1 - d / 132) ** 2));
    });
  };

  const open = (id: AppId) => {
    const wm = useWM.getState();
    const existing = wm.wins.find((w) => w.appId === id);
    if (existing) return wm.focusWin(existing.id);
    setBounce(id);
    window.setTimeout(() => setBounce((b) => (b === id ? null : b)), 900);
    launch(id);
  };

  const menu = (id: AppId) => (e: React.MouseEvent) => {
    const wm = useWM.getState();
    const win = wm.wins.find((w) => w.appId === id);
    showContextMenu(e, [
      { label: win ? "Show" : "Open", onSelect: () => open(id) },
      ...(win
        ? ([
            { label: "Hide", onSelect: () => wm.minimize(win.id) },
            { type: "separator" },
            { label: "Quit", onSelect: () => wm.close(win.id) },
          ] satisfies MenuItem[])
        : []),
    ]);
  };

  const app = (id: AppId) => (
    <DockItem key={id} id={id} label={appName(id, "macos")} running={running.has(id)} bouncing={bounce === id} onOpen={() => open(id)} onMenu={menu(id)}>
      <AppIcon id={id} size={ICON} />
    </DockItem>
  );

  return (
    <div className="mac-dock-wrap pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex justify-center px-2 pb-2">
      <div
        ref={ref}
        className="mac-dock mac-glass pointer-events-auto flex max-w-full items-end"
        data-glass="clear"
        role="toolbar"
        aria-label="Dock"
        onMouseMove={(e) => magnify(e.clientX)}
        onMouseLeave={() => magnify(null)}
      >
        {app(DOCK_APPS[0])}
        <DockItem id="apps" label="Apps" running={false} bouncing={false} onOpen={() => toggle("apps")}>
          <AppsIcon size={ICON} />
        </DockItem>
        {DOCK_APPS.slice(1).map(app)}
        {extra.length > 0 && <span className="mac-dock-sep" />}
        {extra.map(app)}
        <span className="mac-dock-sep" />
        <DockItem id="trash" label="Trash" running={false} bouncing={false} onOpen={() => launch("files", { section: "trash" })}>
          <TrashIcon size={ICON} />
        </DockItem>
      </div>
    </div>
  );
}
