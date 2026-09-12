"use client";

import { ArrowLeft, CaretLeft, MagnifyingGlass, X, type Icon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { appName } from "@/apps/registry";
import { profile } from "@/data/portfolio";
import { useInstance } from "@/hooks/use-instance";
import { registerBack } from "@/lib/launch";
import { usePlatform } from "@/stores/session";
import { AppIcon } from "./app-icon";

export interface FrameSection {
  id: string;
  label: string;
  icon: Icon;
  hint?: string;
  tint?: string;
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
  sectionNav?: "tabs" | "list";
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
  const { sections, section, onSection, actions, search, tone, flush, compact, center, children } = props;
  const name = appName(instance.appId, platform);
  const title = props.title ?? name;
  const subtitle = props.subtitle;

  const listNav = platform === "android" && props.sectionNav === "list" && Boolean(sections);
  const [inPage, setInPage] = useState(Boolean(instance.args.section));
  const [seenSection, setSeenSection] = useState(section);
  if (section !== seenSection) {
    setSeenSection(section);
    setInPage(true);
  }
  const leavePage = useCallback(() => setInPage(false), []);
  const onBack = props.onBack ?? (listNav && inPage ? leavePage : null);

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

  if (platform === "windows") {
    const bar = Boolean(actions?.length || search || center);
    return (
      <div className="@container flex h-full flex-col bg-bg text-fg" data-theme={tone}>
        <header data-wm-drag className="flex h-10 shrink-0 items-center gap-2 pl-2 pr-[146px]">
          {onBack ? (
            <button type="button" className="k-icon-btn !size-8" aria-label="Back" onClick={onBack}>
              <ArrowLeft size={15} />
            </button>
          ) : (
            <span className="w-1" />
          )}
          <AppIcon id={instance.appId} size={16} />
          <span className="truncate text-xs">{title === name ? name : `${title} - ${name}`}</span>
        </header>
        <div className="flex min-h-0 flex-1">
          {sections && (
            <nav className="hidden w-[208px] shrink-0 flex-col gap-0.5 px-1.5 pb-2 @min-[620px]:flex">
              {nav("win-nav-item", 17, "fill")}
            </nav>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            {bar && (
              <div className="flex h-11 shrink-0 items-center gap-1 px-2">
                {actions?.map((a) => {
                  const ActionIcon = a.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="win-cmd"
                      data-on={a.on}
                      aria-pressed={a.on}
                      disabled={a.disabled}
                      title={a.label}
                      onClick={a.onClick}
                    >
                      <ActionIcon size={16} />
                      <span className="hidden @min-[520px]:inline">{a.label}</span>
                    </button>
                  );
                })}
                {center ? <div className="min-w-0 flex-1 px-1">{center}</div> : <div className="flex-1" />}
                {search && <SearchField search={search} className="w-[220px] max-w-[50%]" />}
              </div>
            )}
            {sections && (
              <Strip
                sections={sections}
                section={section}
                onSection={onSection}
                className="gap-4 px-4 pb-1 @min-[620px]:hidden"
                itemClass="win-pivot"
              />
            )}
            <div className={`win-layer flex min-h-0 flex-1 flex-col ${sections ? "@min-[620px]:rounded-tl-lg @min-[620px]:border-l" : ""}`}>
              {body}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "ubuntu") {
    const switcher = sections && sections.length <= 4;
    return (
      <div className="@container flex h-full flex-col bg-bg text-fg" data-theme={tone}>
        <header data-wm-drag className="ub-header flex h-[46px] shrink-0 items-center gap-1 pl-2 pr-[112px]">
          {onBack && (
            <button type="button" className="k-icon-btn" aria-label="Back" onClick={onBack}>
              <CaretLeft size={16} weight="bold" />
            </button>
          )}
          {search && <SearchField search={search} className="w-[200px] max-w-[38%]" />}
          {center && (
            <div className="min-w-0 flex-1 px-1" data-no-drag>
              {center}
            </div>
          )}
          <div className={`min-w-0 flex-1 items-center justify-center px-2 ${center ? "hidden" : "flex"}`}>
            {switcher && (
              <div className="ub-switcher hidden @min-[640px]:flex" role="tablist">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={s.id === section}
                    data-on={s.id === section}
                    onClick={() => onSection?.(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div className={`min-w-0 text-center ${switcher ? "@min-[640px]:hidden" : ""}`}>
              <div className="truncate text-[13px] font-bold leading-tight">{title}</div>
              {subtitle && <div className="truncate text-[11px] leading-tight text-fg3">{subtitle}</div>}
            </div>
          </div>
          <Actions actions={actions} size={16} />
        </header>
        <div className="flex min-h-0 flex-1">
          {sections && !switcher && (
            <aside className="ub-sidebar hidden w-[204px] shrink-0 flex-col gap-0.5 p-1.5 @min-[620px]:flex">
              {nav("ub-side-item", 16)}
            </aside>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            {sections && (
              <Strip
                sections={sections}
                section={section}
                onSection={onSection}
                className={`gap-1 border-b border-line px-2 py-1.5 ${switcher ? "@min-[640px]:hidden" : "@min-[620px]:hidden"}`}
                itemClass="ub-chip"
              />
            )}
            {body}
          </div>
        </div>
      </div>
    );
  }

  if (platform === "ios") {
    const inline = Boolean(onBack) || compact;
    const crowded = (actions?.length ?? 0) > 2 && !onBack;
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
            {inline && !crowded && (
              <div className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-semibold">
                {title}
              </div>
            )}
            {inline && crowded ? <div className="min-w-0 flex-1 truncate text-[17px] font-semibold">{title}</div> : <div className="flex-1" />}
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

  if (platform === "android" && listNav && !inPage) {
    return (
      <div
        className="flex h-full flex-col bg-bg text-fg"
        data-theme={tone}
        style={{ paddingTop: "var(--sb-h)", paddingBottom: "var(--nav-h)" }}
      >
        <header className="shrink-0 px-6 pb-4 pt-10">
          <h1 className="text-[32px] leading-10">{title}</h1>
        </header>
        <div className="md-nav-list min-h-0 flex-1 overflow-y-auto">
          {sections?.map((s) => {
            const SectionIcon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                className="md-nav-row"
                onClick={() => {
                  setSeenSection(s.id);
                  onSection?.(s.id);
                  setInPage(true);
                }}
              >
                <span className="md-nav-badge" style={{ background: s.tint ?? "var(--accent)" }}>
                  <SectionIcon size={21} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] leading-6">{s.label}</span>
                  {s.hint && <span className="block truncate text-[14px] leading-5 text-fg2">{s.hint}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (platform === "android") {
    const pageTitle = listNav ? (sections?.find((s) => s.id === section)?.label ?? title) : title;
    return (
      <div
        className="flex h-full flex-col bg-bg text-fg"
        data-theme={tone}
        style={{ paddingTop: "var(--sb-h)", paddingBottom: "var(--nav-h)" }}
      >
        <header className="flex h-16 shrink-0 items-center gap-1 px-1">
          {onBack ? (
            <button type="button" className="md-icon-btn" aria-label="Back" onClick={onBack}>
              <ArrowLeft size={24} />
            </button>
          ) : (
            <span className="w-3" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] leading-7">{pageTitle}</h1>
            {subtitle && <p className="truncate text-xs text-fg2">{subtitle}</p>}
          </div>
          <Actions actions={actions} size={24} cls="md-icon-btn" />
        </header>
        {search && <SearchField search={search} className="md-search mx-4 mb-2 shrink-0" />}
        {center && <div className="shrink-0 px-3 pb-2">{center}</div>}
        {sections && !listNav && (
          <Strip sections={sections} section={section} onSection={onSection} className="md-tabs px-2" itemClass="md-tab" />
        )}
        {body}
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col bg-bg text-fg"
      data-theme={tone}
      style={{ paddingTop: "var(--sb-h)", paddingBottom: "var(--nav-h)" }}
    >
      <header className="shrink-0 px-5 pt-3">
        <div className="truncate text-[13px] font-semibold uppercase tracking-[0.04em]">
          {title === name ? profile.name : name}
        </div>
        {sections ? (
          <Strip sections={sections} section={section} onSection={onSection} className="-mx-5 gap-5 px-5 pb-1" itemClass="wp-pivot" />
        ) : (
          !compact && <h1 className="-ml-0.5 truncate pb-1 text-[44px] font-light lowercase leading-[1.15]">{title}</h1>
        )}
        {subtitle && !sections && !compact && <p className="-mt-1 pb-1 text-[15px] text-fg2">{subtitle}</p>}
        {search && <SearchField search={search} className="wp-search my-2" />}
        {center && <div className="pb-2 pt-1">{center}</div>}
      </header>
      {body}
      {actions?.length ? (
        <div className="wp-appbar flex h-[58px] shrink-0 items-center justify-center gap-6 px-4">
          <Actions actions={actions} size={20} cls="wp-appbar-btn" />
        </div>
      ) : null}
    </div>
  );
}
