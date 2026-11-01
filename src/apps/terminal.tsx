"use client";

import { useEffect, useRef, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { useInstance } from "@/hooks/use-instance";
import { complete, exec, greeting, promptOf, type Line, type Span } from "@/lib/commands";
import { openExternal } from "@/lib/launch";
import type { VPath } from "@/lib/vfs";
import { usePlatform, useSession } from "@/stores/session";
import type { Platform } from "@/types";

const PALETTE: Record<Platform, Record<string, string>> = {
  macos: { bg: "#1c1d21", fg: "#f1f1f1", ok: "#5af78e", accent: "#57c7ff", err: "#ff6e67", dim: "#8e8e93", warn: "#f3f99d" },
  ios: { bg: "#0d0d0f", fg: "#f1f1f1", ok: "#5af78e", accent: "#57c7ff", err: "#ff6e67", dim: "#8e8e93", warn: "#f3f99d" },
  windows: { bg: "#0c0c0c", fg: "#cccccc", ok: "#16c60c", accent: "#61d6d6", err: "#e74856", dim: "#7a7a7a", warn: "#f9f1a5" },
  wp: { bg: "#000000", fg: "#e6e6e6", ok: "#16c60c", accent: "#61d6d6", err: "#e74856", dim: "#7a7a7a", warn: "#f9f1a5" },
  ubuntu: { bg: "#300a24", fg: "#ffffff", ok: "#8ae234", accent: "#87b6ee", err: "#ff6b6b", dim: "#b9a5b3", warn: "#fce94f" },
  android: { bg: "#101014", fg: "#eaeaea", ok: "#8ae234", accent: "#87b6ee", err: "#ff6b6b", dim: "#8a8a92", warn: "#fce94f" },
};

const CHIPS = ["help", "ls", "about", "projects", "skills", "neofetch", "clear"];

interface Row {
  id: number;
  spans: Line;
}

let rowId = 0;
const row = (spans: Line): Row => ({ id: ++rowId, spans });

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((sp, i) => {
        const style = sp.c ? { color: `var(--t-${sp.c === "bold" ? "fg" : sp.c})`, fontWeight: sp.c === "bold" ? 700 : undefined } : undefined;
        return sp.href ? (
          <a
            key={i}
            href={sp.href}
            className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
            style={{ color: "var(--t-accent)", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              openExternal(sp.href as string);
            }}
          >
            {sp.t}
          </a>
        ) : (
          <span key={i} style={style}>
            {sp.t}
          </span>
        );
      })}
    </>
  );
}

export default function Terminal() {
  const platform = usePlatform();
  const instance = useInstance();
  const phone = useSession((s) => s.form === "phone");
  const [rows, setRows] = useState<Row[]>(() => greeting(platform).map(row));
  const [cwd, setCwd] = useState<VPath>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const palette = PALETTE[platform];
  const prompt = promptOf(platform, cwd);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows]);

  useEffect(() => {
    if (instance.active && !phone) inputRef.current?.focus({ preventScroll: true });
  }, [instance.active, phone]);

  const run = (text: string) => {
    const echo = row([...prompt, { t: text }]);
    if (!text.trim()) {
      setRows((r) => [...r, echo]);
      return;
    }
    const nextHistory = [...history, text];
    const result = exec(text, { cwd, platform, history: nextHistory });
    setHistory(nextHistory);
    setCursor(null);
    setRows((r) => (result.clear ? result.lines.map(row) : [...r, echo, ...result.lines.map(row)].slice(-400)));
    if (result.cwd) setCwd(result.cwd);
    if (result.exit) instance.close();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const c = complete(input, { cwd, platform, history });
      setInput(c.value);
      if (c.options.length > 1) {
        setRows((r) => [...r, row([...prompt, { t: input }]), row([{ t: c.options.join("   "), c: "dim" }])]);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setRows([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      setRows((r) => [...r, row([...prompt, { t: `${input}^C` }])]);
      setInput("");
    }
  };

  return (
    <AppFrame tone="dark" flush compact>
      <div
        className="flex h-full flex-col font-mono text-[13px] leading-[1.5]"
        style={{
          background: palette.bg,
          color: palette.fg,
          ...Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--t-${k}`, v])),
        }}
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
      >
        <div ref={scrollRef} className="selectable min-h-0 flex-1 overflow-y-auto px-3 py-2.5" role="log" aria-live="polite">
          {rows.map((r) => (
            <div key={r.id} className="min-h-[1.5em] whitespace-pre-wrap break-words">
              <Spans spans={r.spans} />
            </div>
          ))}
          <label className="flex whitespace-pre">
            <span className="shrink-0">
              <Spans spans={prompt} />
            </span>
            <input
              ref={inputRef}
              name="command"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCursor(null);
              }}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent font-mono outline-none"
              style={{ color: palette.fg, caretColor: palette.accent }}
              aria-label="Terminal input"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="send"
            />
          </label>
        </div>
        {phone && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-t border-white/10 px-2 py-2 [scrollbar-width:none]">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className="shrink-0 rounded-md bg-white/10 px-2.5 py-1 text-[12px] active:bg-white/20"
                onClick={() => run(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
