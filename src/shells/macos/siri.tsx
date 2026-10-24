"use client";

import { ArrowUp, X } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/portfolio";
import { SIRI_SUGGESTIONS, askSiri, type SiriReply } from "./answers";
import { SiriOrb } from "./glyphs";

export interface SiriTurn {
  id: number;
  question: string;
  reply: SiriReply;
}

export function Siri({ first, onClose }: { first: SiriTurn; onClose: () => void }) {
  const [turns, setTurns] = useState<SiriTurn[]>([first]);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [turns.length]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    // askSiri has side effects, keep it out of the state updater
    const reply = askSiri(q);
    setTurns((t) => [...t, { id: t[t.length - 1].id + 1, question: q, reply }]);
    setDraft("");
  };

  const plain = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const asked = new Set(turns.map((t) => plain(t.question)));
  const suggestions = SIRI_SUGGESTIONS.filter((p) => !asked.has(plain(p))).slice(0, 3);

  return (
    <motion.div
      className="mac-siri mac-glass fixed z-[1900] flex flex-col"
      data-glass="dark"
      data-panel
      role="dialog"
      aria-label="Siri"
      initial={{ opacity: 0, scale: 0.94, y: -14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
    >
      <span className="mac-siri-glow" aria-hidden="true" />
      <div className="relative flex shrink-0 items-center gap-2 px-3 pt-3">
        <button type="button" className="mac-siri-round" aria-label="Close Siri" onClick={onClose}>
          <X size={14} weight="bold" />
        </button>
        <span className="flex-1" />
        <SiriOrb size={22} />
      </div>
      <div className="mac-siri-scroll selectable relative min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-3" aria-live="polite">
        {turns.map((t) => (
          <div key={t.id} className="mac-siri-turn">
            <p className="mac-siri-bubble">{t.question}</p>
            <div className="mac-siri-answer">
              {t.reply.text.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {t.reply.points && (
                <ul>
                  {t.reply.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              {t.reply.actions && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {t.reply.actions.map((a) => (
                    <button key={a.label} type="button" className="mac-siri-chip" data-kind="action" onClick={a.run}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {suggestions.map((p) => (
              <button key={p} type="button" className="mac-siri-chip" onClick={() => ask(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <p className="mac-siri-note relative shrink-0 px-4">Siri only knows what is in {profile.firstName}&apos;s portfolio.</p>
      <form
        className="relative flex shrink-0 items-center gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input
          name="question"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Siri"
          aria-label="Ask Siri"
          className="mac-siri-field min-w-0 flex-1"
          autoComplete="off"
        />
        <button type="submit" className="mac-siri-round" aria-label="Send" disabled={!draft.trim()}>
          <ArrowUp size={14} weight="bold" />
        </button>
      </form>
    </motion.div>
  );
}
