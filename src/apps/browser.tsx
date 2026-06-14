"use client";

import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  House,
  LockSimple,
  MagnifyingGlass,
  Plus,
  ShieldWarning,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { links, previousPortfolio, profile, projects } from "@/data/portfolio";
import { useInstance, useRelaunch } from "@/hooks/use-instance";
import { openExternal } from "@/lib/launch";
import { Cover } from "./projects";

interface Favorite {
  name: string;
  url: string;
  note: string;
  embed: boolean;
}

const FAVORITES: Favorite[] = [
  ...projects.map((p) => ({ name: p.name, url: p.live, note: p.tech.join(" · "), embed: p.embed })),
  { name: previousPortfolio.name, url: previousPortfolio.live, note: "Previous portfolio", embed: true },
  ...links
    .filter((l) => l.id !== "email")
    .map((l) => ({ name: l.label, url: l.href, note: l.handle, embed: false })),
];

const NO_FRAME = /(^|\.)(github\.com|linkedin\.com|codechef\.com|streamlit\.app|google\.com|youtube\.com|x\.com|twitter\.com|facebook\.com|instagram\.com|stackoverflow\.com|reddit\.com)$/i;

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const sameSite = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

function canEmbed(url: string): boolean {
  const fav = FAVORITES.find((f) => sameSite(f.url, url));
  if (fav) return fav.embed;
  return !NO_FRAME.test(hostOf(url));
}

function toUrl(input: string): string | null {
  const text = input.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(text)) return `https://${text}`;
  return null;
}

interface Tab {
  id: number;
  stack: (string | null)[];
  at: number;
  rev: number;
}

let tabId = 0;
const newTab = (entry: string | null = null): Tab => ({ id: ++tabId, stack: [entry], at: 0, rev: 0 });

const titleOf = (entry: string | null) =>
  entry === null
    ? "Favourites"
    : entry.startsWith("search:")
      ? entry.slice(7)
      : (FAVORITES.find((f) => sameSite(f.url, entry))?.name ?? hostOf(entry));

function Frame({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full w-full bg-white">
      {!loaded && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
          <div className="browser-progress h-full w-1/3 bg-accent" />
        </div>
      )}
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-bg text-[13px] text-fg2">Loading {hostOf(url)}…</div>
      )}
      <iframe
        src={url}
        title={titleOf(url)}
        className="relative h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function Content({ entry, rev, onGo }: { entry: string | null; rev: number; onGo: (next: string | null) => void }) {
  const isUrl = entry !== null && !entry.startsWith("search:");
  if (isUrl && canEmbed(entry)) return <Frame key={`${entry}#${rev}`} url={entry} />;
  if (isUrl) {
    return (
      <div className="grid h-full place-items-center overflow-y-auto bg-bg p-6 text-center">
        <div className="max-w-[380px]">
          <ShieldWarning size={46} weight="duotone" className="mx-auto mb-3 text-accent" />
          <h2 className="text-[17px] font-semibold">{hostOf(entry)} opens in its own tab</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg2">
            This site does not allow itself to be shown inside another page, so it cannot load in this window.
          </p>
          <button type="button" className="k-btn k-btn-primary mt-4" onClick={() => openExternal(entry)}>
            <ArrowSquareOut size={16} />
            Open {titleOf(entry)}
          </button>
        </div>
      </div>
    );
  }
  const text = entry?.slice(7) ?? "";
  const query = text.toLowerCase();
  const shown = query ? FAVORITES.filter((f) => `${f.name} ${f.note} ${f.url}`.toLowerCase().includes(query)) : FAVORITES;
  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto w-full max-w-[860px] px-4 py-6 @min-[560px]:px-8 @min-[560px]:py-9">
        <h2 className="os-display">{query ? `Results for "${text}"` : "Favourites"}</h2>
        <p className="mt-1 text-[13.5px] text-fg2">
          {query
            ? shown.length
              ? "Matches from the favourites. The wider web opens in a real tab."
              : "Nothing in the favourites matches. The wider web opens in a real tab."
            : `Live projects and profiles from ${profile.name}.`}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 @min-[560px]:grid-cols-3 @min-[820px]:grid-cols-4">
          {shown.map((f) => {
            const project = projects.find((p) => sameSite(p.live, f.url));
            return (
              <button
                key={f.url}
                type="button"
                className="k-card group flex flex-col overflow-hidden text-left transition-transform duration-200 hover:-translate-y-0.5"
                onClick={() => onGo(f.url)}
              >
                {project ? (
                  <Cover project={project} className="h-[72px] w-full [&_svg]:!size-7" />
                ) : (
                  <div className="grid h-[72px] w-full place-items-center bg-ctl text-[22px] font-semibold text-fg2">
                    {f.name.slice(0, 1)}
                  </div>
                )}
                <span className="p-2.5">
                  <span className="flex items-center gap-1 text-[13px] font-semibold">
                    <span className="truncate">{f.name}</span>
                    {!f.embed && <ArrowSquareOut size={11} className="shrink-0 text-fg3" />}
                  </span>
                  <span className="block truncate text-[11.5px] text-fg3">{f.note}</span>
                </span>
              </button>
            );
          })}
        </div>
        {query && (
          <button
            type="button"
            className="k-btn mt-5"
            onClick={() => openExternal(`https://duckduckgo.com/?q=${encodeURIComponent(text)}`)}
          >
            <MagnifyingGlass size={15} />
            Search the web for &quot;{text}&quot;
          </button>
        )}
      </div>
    </div>
  );
}

export default function Browser() {
  const { args } = useInstance();
  const [tabs, setTabs] = useState<Tab[]>(() => [newTab(args.url ?? null)]);
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  const [draft, setDraft] = useState<string | null>(null);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const entry = active.stack[active.at];
  const update = (fn: (t: Tab) => Tab) => setTabs((all) => all.map((t) => (t.id === active.id ? fn(t) : t)));

  const go = (next: string | null) => {
    setDraft(null);
    update((t) => ({ ...t, stack: [...t.stack.slice(0, t.at + 1), next], at: t.at + 1 }));
  };
  const openTab = (next: string | null = null) => {
    const tab = newTab(next);
    setTabs((all) => [...all, tab]);
    setActiveId(tab.id);
    setDraft(null);
  };
  const closeTab = (id: number) => {
    const rest = tabs.filter((t) => t.id !== id);
    if (!rest.length) {
      const tab = newTab();
      setTabs([tab]);
      setActiveId(tab.id);
    } else {
      setTabs(rest);
      if (id === activeId) setActiveId(rest[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id);
    }
    setDraft(null);
  };

  useRelaunch((a) => {
    if (!a.url) return;
    if (entry === null) go(a.url);
    else openTab(a.url);
  });

  const submit = (text: string) => {
    if (!text.trim()) return;
    go(toUrl(text) ?? `search:${text.trim()}`);
  };

  const isUrl = entry !== null && !entry.startsWith("search:");
  const address = draft ?? (isUrl ? entry : entry?.startsWith("search:") ? entry.slice(7) : "");
  const addressBar = (
    <form
      className="relative flex items-center"
      onSubmit={(e) => {
        e.preventDefault();
        submit(address);
        (document.activeElement as HTMLElement | null)?.blur();
      }}
    >
      <span className="pointer-events-none absolute left-2.5 text-fg3">
        {isUrl ? <LockSimple size={13} weight="fill" /> : <MagnifyingGlass size={13} />}
      </span>
      <input
        className="k-input browser-address !pl-8 text-center focus:text-left"
        value={address}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => setDraft(null)}
        placeholder="Search favourites or enter an address"
        aria-label="Address"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
    </form>
  );

  return (
    <AppFrame
      flush
      compact
      center={addressBar}
      actions={[
        { id: "back", label: "Back", icon: ArrowLeft, disabled: active.at === 0, onClick: () => update((t) => ({ ...t, at: t.at - 1 })) },
        {
          id: "forward",
          label: "Forward",
          icon: ArrowRight,
          disabled: active.at >= active.stack.length - 1,
          onClick: () => update((t) => ({ ...t, at: t.at + 1 })),
        },
        { id: "reload", label: "Reload", icon: ArrowClockwise, disabled: !isUrl, onClick: () => update((t) => ({ ...t, rev: t.rev + 1 })) },
        { id: "home", label: "Favourites", icon: House, disabled: entry === null, onClick: () => go(null) },
        { id: "external", label: "Open in a real tab", icon: ArrowSquareOut, disabled: !isUrl, onClick: () => isUrl && openExternal(entry) },
      ]}
    >
      <div className="flex h-full flex-col">
        <div className="browser-tabs flex shrink-0 items-center gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none]" role="tablist">
          {tabs.map((t) => (
            <div key={t.id} className="browser-tab group flex min-w-0 max-w-[190px] shrink items-center" data-on={t.id === active.id}>
              <button
                type="button"
                role="tab"
                aria-selected={t.id === active.id}
                className="min-w-0 flex-1 truncate py-1 pl-3 pr-1 text-left text-[12px]"
                onClick={() => {
                  setActiveId(t.id);
                  setDraft(null);
                }}
              >
                {titleOf(t.stack[t.at])}
              </button>
              <button
                type="button"
                aria-label={`Close ${titleOf(t.stack[t.at])}`}
                className="mr-1 grid size-5 shrink-0 place-items-center rounded-full text-fg3 hover:bg-ctl hover:text-fg"
                onClick={() => closeTab(t.id)}
              >
                <X size={11} weight="bold" />
              </button>
            </div>
          ))}
          <button type="button" className="k-icon-btn !size-7 shrink-0" aria-label="New tab" onClick={() => openTab()}>
            <Plus size={14} weight="bold" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 border-t border-line">
          {tabs.map((t) => (
            // hidden, not unmounted, so switching back does not reload the page
            <div key={t.id} className="absolute inset-0" hidden={t.id !== active.id}>
              <Content entry={t.stack[t.at]} rev={t.rev} onGo={go} />
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
