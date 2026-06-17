"use client";

import { Backspace } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { useInstance } from "@/hooks/use-instance";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";
import { evaluate, formatNumber } from "@/lib/calc";

type Key = { label: string; value: string; kind?: "op" | "fn" | "eq"; wide?: boolean };

const KEYS: Key[] = [
  { label: "AC", value: "clear", kind: "fn" },
  { label: "( )", value: "paren", kind: "fn" },
  { label: "%", value: "%", kind: "fn" },
  { label: "÷", value: "÷", kind: "op" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "×", value: "×", kind: "op" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "−", value: "−", kind: "op" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "+", value: "+", kind: "op" },
  { label: "0", value: "0", wide: true },
  { label: ".", value: "." },
  { label: "=", value: "=", kind: "eq" },
];

const OPS = "+−×÷";

export default function Calculator() {
  const { active } = useInstance();
  const [expr, setExpr] = useState("");
  const [done, setDone] = useState(false);

  const press = (value: string) => {
    if (value === "clear") {
      setExpr("");
      setDone(false);
    } else if (value === "back") {
      setExpr((e) => (done ? "" : e.slice(0, -1)));
      setDone(false);
    } else if (value === "=") {
      const result = evaluate(expr);
      if (result !== null) {
        setExpr(String(Number(result.toPrecision(12))));
        setDone(true);
      }
    } else if (value === "paren") {
      setExpr((e) => {
        const open = (e.match(/\(/g) ?? []).length - (e.match(/\)/g) ?? []).length;
        const last = e.slice(-1);
        return e + (open > 0 && /[\d.)%]/.test(last) ? ")" : (/[\d.)%]/.test(last) ? "×(" : "("));
      });
      setDone(false);
    } else if (OPS.includes(value)) {
      setExpr((e) => {
        if (!e) return value === "−" ? "−" : e;
        return OPS.includes(e.slice(-1)) ? e.slice(0, -1) + value : e + value;
      });
      setDone(false);
    } else {
      setExpr((e) => (done ? value : e + value));
      setDone(false);
    }
  };

  useWindowEvent(
    "keydown",
    (e) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, string> = { "*": "×", x: "×", "/": "÷", "-": "−", Enter: "=", Backspace: "back", Escape: "clear", c: "clear" };
      const value = map[e.key] ?? e.key;
      if (/^[\d.+%=]$/.test(value) || ["×", "÷", "−", "back", "clear"].includes(value)) {
        e.preventDefault();
        press(value);
      } else if (e.key === "(" || e.key === ")") {
        e.preventDefault();
        setExpr((x) => x + e.key);
        setDone(false);
      }
    },
    active,
  );

  const live = done ? null : evaluate(expr);
  const shown = done ? formatNumber(Number(expr)) : expr || "0";

  return (
    <AppFrame compact flush>
      <div className="os-calc flex h-full flex-col gap-2 p-3">
        <div className="flex min-h-[92px] flex-1 flex-col items-end justify-end overflow-hidden px-2 pb-1" aria-live="polite">
          <div className="h-5 text-[13px] tabular-nums text-fg3">
            {live !== null && /[+−×÷%(]/.test(expr) ? `= ${formatNumber(live)}` : ""}
          </div>
          <div
            className="selectable w-full truncate text-right font-light tabular-nums leading-none"
            style={{ fontSize: shown.length > 12 ? 30 : shown.length > 8 ? 40 : 52, direction: "rtl" }}
          >
            <bdi>{shown}</bdi>
          </div>
        </div>
        <div className="flex justify-end px-1">
          <button type="button" className="k-icon-btn" aria-label="Delete" onClick={() => press("back")}>
            <Backspace size={20} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              className={`os-calc-key ${k.wide ? "col-span-2" : ""}`}
              data-kind={k.kind ?? "num"}
              onClick={() => press(k.value)}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
