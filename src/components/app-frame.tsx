"use client";

import { CaretLeft, MagnifyingGlass, X, type Icon } from "@phosphor-icons/react";
import { useEffect, type ReactNode } from "react";
import { appName } from "@/apps/registry";
import { useInstance } from "@/hooks/use-instance";
import { registerBack } from "@/lib/launch";
import { usePlatform } from "@/stores/session";

export interface FrameSection {
  id: string;
  label: string;
  icon: Icon;
}

export interface FrameAction {
  id: string;
  label: string;
  icon: Icon;
  onClick: () => void;
  on?: boolean;
  disabled?: boolean;
}

export interface FrameSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FrameProps {
  title?: string;
  subtitle?: string;
  sections?: FrameSection[];
  section?: string;
  onSection?: (id: string) => void;
  onBack?: (() => void) | null;
  actions?: FrameAction[];
  search?: FrameSearch;
  tone?: "dark";
  flush?: boolean;
  compact?: boolean;
  center?: ReactNode;
  children: ReactNode;
}

function SearchField({ search, className = "" }: { search: FrameSearch; className?: string }) {
  return (
    <label className={`os-search relative flex items-center ${className}`}>
      <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 text-fg3" />
      <input
        type="search"
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
        placeholder={search.placeholder ?? "Search"}
        aria-label={search.placeholder ?? "Search"}
        className="k-input !pl-8 !pr-7 [&::-webkit-search-cancel-button]:hidden"
        data-no-drag
      />
      {search.value && (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute right-1.5 grid size-5 place-items-center rounded-full text-fg3 hover:text-fg"
          onClick={() => search.onChange("")}
        >
          <X size={12} weight="bold" />
        </button>
      )}
    </label>
  );
}

function Actions({ actions, size = 18, cls = "k-icon-btn" }: { actions?: FrameAction[]; size?: number; cls?: string }) {
  if (!actions?.length) return null;
  return (
    <>
      {actions.map((a) => {
        const ActionIcon = a.icon;
        return (
          <button
            key={a.id}
            type="button"
            className={cls}
            title={a.label}
            aria-label={a.label}
            aria-pressed={a.on}
            data-on={a.on}
            disabled={a.disabled}
            onClick={a.onClick}
          >
            <ActionIcon size={size} />
          </button>
        );
      })}
    </>
  );
}

function Strip({
  sections,
  section,
  onSection,
  className = "",
  itemClass,
}: Pick<FrameProps, "sections" | "section" | "onSection"> & { className?: string; itemClass: string }) {
  if (!sections) return null;
  return (
    <div className={`flex shrink-0 overflow-x-auto [scrollbar-width:none] ${className}`} role="tablist">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          aria-selected={s.id === section}
          data-on={s.id === section}
          className={itemClass}
          onClick={() => onSection?.(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function AppFrame(props: FrameProps) {
  const platform = usePlatform();
  const instance = useInstance();
  const { sections, section, onSection, onBack, actions, search, tone, flush, compact, center, children } = props;
  const name = appName(instance.appId, platform);
  const title = props.title ?? name;
  const subtitle = props.subtitle;

  useEffect(() => {
    registerBack(instance.id, onBack ?? null);
    return () => registerBack(instance.id, null);
  }, [instance.id, onBack]);

  const body = (
    <div
      className={`os-body relative min-h-0 min-w-0 flex-1 ${flush ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden"}`}
    >
      {children}
    </div>
  );

  const nav = (cls: string, iconSize: number, weightOn: "fill" | "regular" = "regular") =>
    sections?.map((s) => {
      const SectionIcon = s.icon;
      const on = s.id === section;
      return (
        <button
          key={s.id}
          type="button"
          className={cls}
          data-on={on}
          aria-current={on ? "page" : undefined}
          onClick={() => onSection?.(s.id)}
        >
          <SectionIcon size={iconSize} weight={on ? weightOn : "regular"} />
          <span className="truncate">{s.label}</span>
        </button>
      );
    });

  if (platform === "macos") {
    return (
      <div className="@container flex h-full bg-bg text-fg" data-theme={tone}>
        {sections && (
          <aside className="mac-sidebar hidden w-[196px] shrink-0 flex-col gap-px px-2.5 pt-[52px] @min-[620px]:flex" data-wm-drag>
            {nav("mac-side-item", 16, "fill")}
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header
            data-wm-drag
            className={`mac-toolbar flex h-[52px] shrink-0 items-center gap-1.5 pr-3 ${sections ? "pl-[78px] @min-[620px]:pl-4" : "pl-[78px]"}`}
          >
            {onBack && (
              <button type="button" className="k-icon-btn" aria-label="Back" onClick={onBack}>
                <CaretLeft size={16} weight="bold" />
              </button>
            )}
            {center ? (
              <div className="min-w-0 flex-1 px-1" data-no-drag>
                {center}
              </div>
            ) : (
              <>
                <div className="min-w-0 px-1">
                  <div className="truncate text-[13px] font-bold leading-tight">{title}</div>
                  {subtitle && <div className="truncate text-[11px] leading-tight text-fg3">{subtitle}</div>}
                </div>
                <div className="flex-1" />
              </>
            )}
            <Actions actions={actions} size={17} />
            {search && <SearchField search={search} className="ml-1 w-[170px] max-w-[40%]" />}
          </header>
          {sections && (
            <Strip
              sections={sections}
              section={section}
              onSection={onSection}
              className="gap-1 border-b border-line px-3 pb-2 @min-[620px]:hidden"
              itemClass="mac-seg"
            />
          )}
          {body}
        </div>
      </div>
    );
  }

  if (platform === "ios") {
    const inline = Boolean(onBack) || compact;
    return (
      <div className="flex h-full flex-col bg-bg text-fg" data-theme={tone} style={{ paddingTop: "var(--sb-h)" }}>
        <header className="relative shrink-0 px-4 pb-2">
          <div className="flex h-11 items-center gap-1">
            {onBack && (
              <button
                type="button"
                className="-ml-2 flex items-center gap-0.5 pr-2 text-[17px] text-accent active:opacity-50"
                onClick={onBack}
              >
                <CaretLeft size={22} weight="bold" />
                Back
              </button>
            )}
            {inline && (
              <div className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-semibold">
                {title}
              </div>
            )}
            <div className="flex-1" />
            <Actions actions={actions} size={22} cls="ios-action" />
          </div>
          {!inline && <h1 className="truncate text-[32px] font-bold leading-[1.15] tracking-tight">{title}</h1>}
          {!inline && subtitle && <p className="mt-0.5 truncate text-[15px] text-fg2">{subtitle}</p>}
          {search && <SearchField search={search} className="mt-2" />}
          {center && <div className="mt-1">{center}</div>}
          {sections && sections.length > 5 && (
            <Strip sections={sections} section={section} onSection={onSection} className="-mx-4 mt-2 gap-2 px-4" itemClass="ios-chip" />
          )}
        </header>
        {body}
        {sections && sections.length <= 5 ? (
          <nav className="ios-tabbar flex shrink-0 justify-around px-1 pt-1.5" style={{ paddingBottom: "var(--nav-h)" }}>
            {nav("ios-tab", 24, "fill")}
          </nav>
        ) : (
          <div className="shrink-0" style={{ height: "var(--nav-h)" }} />
        )}
      </div>
    );
  }

  return null;
}
