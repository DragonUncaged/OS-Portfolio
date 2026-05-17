"use client";

import { Command, MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import { appName } from "@/apps/registry";
import { toggleDropdown, useMenu, type MenuItem } from "@/components/menu";
import { BatteryGlyph, WifiGlyph } from "@/components/status-glyphs";
import { profile } from "@/data/portfolio";
import { useDark } from "@/hooks/use-dark";
import { useNow } from "@/hooks/use-now";
import { dateShort, time12m } from "@/lib/format";
import { launch } from "@/lib/launch";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import { useActiveApp, useWM } from "@/stores/window-manager";
import { MENU_H, type Panel } from "./constants";

export function MenuBar({ panel, toggle }: { panel: Panel | null; toggle: (p: Panel) => void }) {
  const now = useNow(1000);
  const active = useActiveApp();
  const focus = useWM((s) => s.focus);
  const wins = useWM((s) => s.wins);
  const dark = useDark();
  const session = useSession.getState();
  const wm = useWM.getState();
  const appLabel = active ? appName(active, "macos") : "Finder";

  const menus: { id: string; label: React.ReactNode; bold?: boolean; items: MenuItem[] }[] = [
    {
      id: "system",
      label: <Command size={15} weight="bold" aria-label="System menu" />,
      items: [
        { label: "About This Mac", onSelect: () => launch("settings", { section: "system" }) },
        { type: "separator" },
        { label: "System Settings…", onSelect: () => launch("settings") },
        { label: "Startup Disk…", onSelect: () => launch("settings", { section: "system" }) },
        { type: "separator" },
        { label: "Lock Screen", onSelect: () => session.power("lock") },
        { label: "Restart…", onSelect: () => session.power("restart") },
        { label: "Shut Down…", onSelect: () => session.power("shutdown") },
        { type: "separator" },
        { label: `Log Out ${profile.name}…`, onSelect: () => session.power("logout") },
      ],
    },
    {
      id: "app",
      label: appLabel,
      bold: true,
      items: focus
        ? [
            { label: `Hide ${appLabel}`, shortcut: "⌥M", onSelect: () => wm.minimize(focus) },
            { type: "separator" },
            { label: `Quit ${appLabel}`, shortcut: "⌥W", onSelect: () => wm.close(focus) },
          ]
        : [
            { label: "New Finder Window", onSelect: () => launch("files") },
            { label: `About ${profile.firstName}`, onSelect: () => launch("about") },
          ],
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Finder Window", onSelect: () => launch("files") },
        { label: "New Terminal Window", onSelect: () => launch("terminal") },
        { label: "New Note", onSelect: () => launch("notes") },
        { type: "separator" },
        { label: "Close Window", shortcut: "⌥W", disabled: !focus, onSelect: () => focus && wm.close(focus) },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "Mission Control", shortcut: "⌃↑", onSelect: () => wm.setOverview(true) },
        { label: "Launchpad", shortcut: "F4", onSelect: () => toggle("launchpad") },
        { label: "Spotlight Search", shortcut: "⌘K", onSelect: () => toggle("spotlight") },
        { type: "separator" },
        {
          label: dark ? "Use Light Appearance" : "Use Dark Appearance",
          onSelect: () => useSettings.getState().setTheme(dark ? "light" : "dark"),
        },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimise", shortcut: "⌥M", disabled: !focus, onSelect: () => focus && wm.minimize(focus) },
        { label: "Zoom", shortcut: "⌥↩", disabled: !focus, onSelect: () => focus && wm.toggleMax(focus) },
        { label: "Cycle Through Windows", shortcut: "⌥`", disabled: wins.length < 2, onSelect: () => wm.cycle() },
        ...(wins.length ? [{ type: "separator" as const }] : []),
        ...wins.map(
          (w): MenuItem => ({
            label: appName(w.appId, "macos"),
            checked: w.id === focus,
            onSelect: () => wm.focusWin(w.id),
          }),
        ),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Tips & Keyboard Shortcuts", onSelect: () => launch("tips") },
        { label: `Contact ${profile.firstName}`, onSelect: () => launch("contact") },
      ],
    },
  ];

  const openMenu = (el: Element, m: (typeof menus)[number]) =>
    toggleDropdown(el, `mb:${m.id}`, m.items, { gap: 2, minWidth: 220 });

  return (
    <div className="mac-menubar fixed inset-x-0 top-0 z-[1000] flex items-center justify-between px-2.5" style={{ height: MENU_H }}>
      <div className="flex min-w-0 items-center">
        {menus.map((m, i) => (
          <button
            key={m.id}
            type="button"
            data-menu-trigger
            className={`mac-menu-title ${m.bold ? "font-bold" : ""} ${i > 2 ? "hidden md:block" : ""}`}
            onClick={(e) => openMenu(e.currentTarget, m)}
            onPointerEnter={(e) => {
              const open = useMenu.getState().menu?.key;
              if (open?.startsWith("mb:") && open !== `mb:${m.id}`) openMenu(e.currentTarget, m);
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center">
        <span className="mac-status hidden sm:inline-flex">
          <BatteryGlyph size={20} />
        </span>
        <span className="mac-status">
          <WifiGlyph size={16} />
        </span>
        <button type="button" className="mac-status" aria-label="Spotlight Search" data-panel-trigger onClick={() => toggle("spotlight")}>
          <MagnifyingGlass size={15} weight="bold" />
        </button>
        <button
          type="button"
          className="mac-status"
          aria-label="Control Centre"
          aria-expanded={panel === "control"}
          data-panel-trigger
          onClick={() => toggle("control")}
        >
          <SlidersHorizontal size={16} weight="bold" />
        </button>
        <button
          type="button"
          className="mac-status tabular-nums"
          aria-label="Notification Centre"
          aria-expanded={panel === "notifications"}
          data-panel-trigger
          onClick={() => toggle("notifications")}
        >
          {dateShort(now)}&nbsp;&nbsp;{time12m(now)}
        </button>
      </div>
    </div>
  );
}
