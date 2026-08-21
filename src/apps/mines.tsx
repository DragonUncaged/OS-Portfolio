"use client";

import { ArrowCounterClockwise, Flag, Smiley, SmileySad, SmileyWink, Sparkle } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { useNow } from "@/hooks/use-now";

const SIZE = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  n: number;
}

type Status = "ready" | "playing" | "won" | "lost";

const NUMBER_COLOR = ["", "#3b82f6", "#16a34a", "#ef4444", "#7c3aed", "#b45309", "#0891b2", "#be185d", "#64748b"];

const blank = (): Cell[] => Array.from({ length: SIZE * SIZE }, () => ({ mine: false, open: false, flag: false, n: 0 }));

function around(i: number): number[] {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr;
      const cc = c + dc;
      if ((dr || dc) && rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) out.push(rr * SIZE + cc);
    }
  return out;
}

function plant(safe: number): Cell[] {
  const cells = blank();
  const keep = new Set([safe, ...around(safe)]);
  const free = cells.map((_, i) => i).filter((i) => !keep.has(i));
  for (let k = 0; k < MINES; k++) {
    const pick = Math.floor(Math.random() * free.length);
    cells[free.splice(pick, 1)[0]].mine = true;
  }
  cells.forEach((cell, i) => (cell.n = around(i).filter((j) => cells[j].mine).length));
  return cells;
}

function reveal(cells: Cell[], start: number): Cell[] {
  const next = cells.map((c) => ({ ...c }));
  const queue = [start];
  while (queue.length) {
    const i = queue.pop() as number;
    const cell = next[i];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (!cell.mine && cell.n === 0) queue.push(...around(i));
  }
  return next;
}

export default function Mines() {
  const [cells, setCells] = useState<Cell[]>(blank);
  const [status, setStatus] = useState<Status>("ready");
  const [flagging, setFlagging] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const now = useNow(1000);

  const seconds = status === "playing" ? Math.max(0, Math.floor((now - startedAt) / 1000)) : finalTime;
  const flags = cells.filter((c) => c.flag).length;

  const reset = () => {
    setCells(blank());
    setStatus("ready");
    setFinalTime(0);
  };

  const toggleFlag = (i: number) => {
    if (status === "won" || status === "lost" || cells[i].open) return;
    setCells((cs) => cs.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  const open = (i: number, at: number) => {
    if (status === "won" || status === "lost" || cells[i].flag || cells[i].open) return;
    const first = status === "ready";
    const board = first ? plant(i).map((c, j) => ({ ...c, flag: cells[j].flag && j !== i })) : cells;
    const started = first ? at : startedAt;
    if (first) {
      setStartedAt(at);
      setStatus("playing");
    }
    if (board[i].mine) {
      setCells(board.map((c) => (c.mine ? { ...c, open: true } : c)));
      setStatus("lost");
      setFinalTime(Math.floor((at - started) / 1000));
      return;
    }
    const next = reveal(board, i);
    setCells(next);
    if (next.every((c) => c.open || c.mine)) {
      setStatus("won");
      setFinalTime(Math.floor((at - started) / 1000));
    }
  };

  const Face = status === "won" ? SmileyWink : status === "lost" ? SmileySad : Smiley;

  return (
    <AppFrame compact flush>
      <div className="flex h-full flex-col items-center gap-3 p-3">
        <div className="k-card flex w-full max-w-[380px] shrink-0 items-center justify-between px-3 py-2">
          <span className="flex w-16 items-center gap-1.5 text-[15px] font-semibold tabular-nums">
            <Flag size={16} weight="fill" className="text-accent" />
            {MINES - flags}
          </span>
          <button type="button" className="k-icon-btn !size-10" aria-label="New game" title="New game" onClick={reset}>
            <Face size={26} weight="fill" className={status === "lost" ? "text-[#ef4444]" : status === "won" ? "text-[#16a34a]" : "text-[#f5b800]"} />
          </button>
          <span className="w-16 text-right text-[15px] font-semibold tabular-nums">{String(Math.min(999, seconds)).padStart(3, "0")}</span>
        </div>

        <div className="grid min-h-0 w-full flex-1 place-items-center [container-type:size]">
        <div
          className="os-mines grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
            width: "min(100cqw, 100cqh, 400px)",
            height: "min(100cqw, 100cqh, 400px)",
          }}
          role="grid"
          aria-label="Minefield"
          onContextMenu={(e) => e.preventDefault()}
        >
          {cells.map((cell, i) => (
            <button
              key={i}
              type="button"
              role="gridcell"
              className="os-mine-cell grid place-items-center text-[15px] font-bold"
              data-open={cell.open}
              data-boom={cell.open && cell.mine}
              aria-label={cell.open ? (cell.mine ? "Mine" : `${cell.n} nearby`) : cell.flag ? "Flagged" : "Hidden"}
              style={{ color: cell.open && !cell.mine ? NUMBER_COLOR[cell.n] : undefined }}
              onClick={() => (flagging ? toggleFlag(i) : open(i, Date.now()))}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleFlag(i);
              }}
            >
              {cell.open ? (
                cell.mine ? (
                  <Sparkle size={16} weight="fill" />
                ) : (
                  cell.n || ""
                )
              ) : cell.flag ? (
                <Flag size={15} weight="fill" className="text-accent" />
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
          <button type="button" className="k-btn" data-on={flagging} aria-pressed={flagging} onClick={() => setFlagging((v) => !v)}>
            <Flag size={15} weight={flagging ? "fill" : "regular"} />
            {flagging ? "Flag mode on" : "Flag mode"}
          </button>
          <button type="button" className="k-btn" onClick={reset}>
            <ArrowCounterClockwise size={15} />
            New game
          </button>
        </div>
        <p className="shrink-0 text-center text-[12px] text-fg3" aria-live="polite">
          {status === "won"
            ? `Cleared in ${finalTime}s. Nicely done.`
            : status === "lost"
              ? "Boom. Try again?"
              : "Click to reveal · right-click or flag mode to mark a mine"}
        </p>
      </div>
    </AppFrame>
  );
}
