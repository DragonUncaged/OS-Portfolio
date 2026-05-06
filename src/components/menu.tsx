"use client";

import { Check, type Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { create } from "zustand";
import { useEscape, useOutsidePress } from "@/hooks/use-window-event";

export type MenuItem =
  | {
      type?: "item";
      label: string;
      icon?: Icon;
      shortcut?: string;
      onSelect: () => void;
      disabled?: boolean;
      checked?: boolean;
      danger?: boolean;
    }
  | { type: "separator" }
  | { type: "label"; label: string };

interface OpenMenu {
  key: string;
  x: number;
  y: number;
  items: MenuItem[];
  up: boolean;
  left: boolean;
  minWidth: number;
}

interface MenuState {
  menu: OpenMenu | null;
  show: (m: OpenMenu) => void;
  hide: () => void;
}

export const useMenu = create<MenuState>()((set) => ({
  menu: null,
  show: (menu) => set({ menu }),
  hide: () => set({ menu: null }),
}));

const ROW = 30;

function estimateHeight(items: MenuItem[]) {
  return items.reduce((h, i) => h + (i.type === "separator" ? 9 : ROW), 12);
}

export function showContextMenu(e: { clientX: number; clientY: number; preventDefault?: () => void }, items: MenuItem[]) {
  e.preventDefault?.();
  const h = estimateHeight(items);
  useMenu.getState().show({
    key: `ctx:${e.clientX},${e.clientY}`,
    x: e.clientX,
    y: e.clientY,
    items,
    up: e.clientY + h > window.innerHeight - 8,
    left: e.clientX + 240 > window.innerWidth - 8,
    minWidth: 200,
  });
}

export function toggleDropdown(
  el: Element,
  key: string,
  items: MenuItem[],
  opts: { align?: "start" | "end"; side?: "bottom" | "top"; gap?: number; minWidth?: number } = {},
) {
  const { menu, show, hide } = useMenu.getState();
  if (menu?.key === key) return hide();
  const r = el.getBoundingClientRect();
  const gap = opts.gap ?? 4;
  const top = opts.side === "top";
  const end = opts.align === "end";
  show({
    key,
    x: end ? r.right : r.left,
    y: top ? r.top - gap : r.bottom + gap,
    items,
    up: top,
    left: end,
    minWidth: opts.minWidth ?? 200,
  });
}

export function MenuHost() {
  const menu = useMenu((s) => s.menu);
  if (!menu) return null;
  return <MenuPanel key={menu.key} menu={menu} />;
}

function MenuPanel({ menu }: { menu: OpenMenu }) {
  const hide = useMenu((s) => s.hide);
  const [active, setActive] = useState(-1);
  useEscape(hide);
  useOutsidePress("[data-menu], [data-menu-trigger]", hide);

  const selectable = menu.items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => (item.type ?? "item") === "item" && !("disabled" in item && item.disabled));

  const move = (dir: 1 | -1) => {
    if (!selectable.length) return;
    const at = selectable.findIndex((s) => s.i === active);
    const next = selectable[(at + dir + selectable.length) % selectable.length];
    setActive(next.i);
  };

  return (
    <div
      data-menu
      role="menu"
      tabIndex={-1}
      ref={(el) => el?.focus({ preventScroll: true })}
      className="os-menu fixed z-[4000] outline-none"
      style={{
        minWidth: menu.minWidth,
        maxWidth: "min(320px, calc(100vw - 16px))",
        ...(menu.left ? { right: Math.max(8, window.innerWidth - menu.x) } : { left: Math.max(8, menu.x) }),
        ...(menu.up ? { bottom: Math.max(8, window.innerHeight - menu.y) } : { top: Math.max(8, menu.y) }),
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const item = menu.items[active];
          if (item && (item.type ?? "item") === "item" && "onSelect" in item) {
            hide();
            item.onSelect();
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          hide();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menu.items.map((item, i) => {
        if (item.type === "separator") return <div key={i} className="os-menu-sep" role="separator" />;
        if (item.type === "label")
          return (
            <div key={i} className="os-menu-label">
              {item.label}
            </div>
          );
        const ItemIcon = item.icon;
        return (
          <button
            key={i}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            data-active={active === i}
            data-danger={item.danger}
            className="os-menu-item"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(-1)}
            onClick={() => {
              hide();
              item.onSelect();
            }}
          >
            <span className="os-menu-icon">
              {item.checked ? <Check size={14} weight="bold" /> : ItemIcon ? <ItemIcon size={16} /> : null}
            </span>
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {item.shortcut && <span className="os-menu-key">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}
