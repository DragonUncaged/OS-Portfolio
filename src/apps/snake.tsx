"use client";

import { CaretDown, CaretLeft, CaretRight, CaretUp, Pause, Play } from "@phosphor-icons/react";
import { useEffect, useReducer, useRef } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppFrame } from "@/components/app-frame";
import { useInstance } from "@/hooks/use-instance";
import { isTyping, useWindowEvent } from "@/hooks/use-window-event";

const N = 18;
const TICK_MS = 125;

type Vec = [number, number];
type Status = "ready" | "playing" | "paused" | "over";

interface Game {
  snake: Vec[];
  dir: Vec;
  turn: Vec;
  food: Vec;
  status: Status;
  score: number;
}

type Action = { type: "tick"; r: number } | { type: "turn"; dir: Vec } | { type: "start"; r: number } | { type: "pause" };

const START: Vec[] = [
  [8, 9],
  [7, 9],
  [6, 9],
];

const eq = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1];

function placeFood(snake: Vec[], r: number): Vec {
  const free: Vec[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!snake.some((s) => eq(s, [x, y]))) free.push([x, y]);
  return free[Math.floor(r * free.length)] ?? [0, 0];
}

const fresh = (r: number, status: Status): Game => ({
  snake: START,
  dir: [1, 0],
  turn: [1, 0],
  food: placeFood(START, r),
  status,
  score: 0,
});

function reducer(g: Game, a: Action): Game {
  switch (a.type) {
    case "start":
      return g.status === "paused" ? { ...g, status: "playing" } : fresh(a.r, "playing");
    case "pause":
      return g.status === "playing" ? { ...g, status: "paused" } : g;
    case "turn":
      if (a.dir[0] === -g.dir[0] && a.dir[1] === -g.dir[1]) return g;
      return { ...g, turn: a.dir };
    case "tick": {
      if (g.status !== "playing") return g;
      const dir = g.turn;
      const head: Vec = [g.snake[0][0] + dir[0], g.snake[0][1] + dir[1]];
      const ate = eq(head, g.food);
      const body = ate ? g.snake : g.snake.slice(0, -1);
      if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N || body.some((s) => eq(s, head))) {
        return { ...g, status: "over" };
      }
      const snake = [head, ...body];
      return { ...g, snake, dir, food: ate ? placeFood(snake, a.r) : g.food, score: g.score + (ate ? 1 : 0) };
    }
  }
}

const useBest = create<{ best: number; submit: (score: number) => void }>()(
  persist((set) => ({ best: 0, submit: (score) => set((s) => (score > s.best ? { best: score } : s)) }), {
    name: "os-portfolio:snake",
  }),
);

const KEYS: Record<string, Vec> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

export default function Snake() {
  const { active } = useInstance();
  const [game, dispatch] = useReducer(reducer, 0.42, (r) => fresh(r, "ready"));
  const best = useBest((s) => s.best);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const playing = game.status === "playing";

  useEffect(() => {
    if (!playing || !active) return;
    const id = window.setInterval(() => dispatch({ type: "tick", r: Math.random() }), TICK_MS);
    return () => window.clearInterval(id);
  }, [playing, active]);

  useEffect(() => {
    if (game.status === "over") useBest.getState().submit(game.score);
  }, [game.status, game.score]);

  const start = () => dispatch({ type: "start", r: Math.random() });

  useWindowEvent(
    "keydown",
    (e) => {
      if (isTyping(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const dir = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
      if (dir) {
        e.preventDefault();
        if (!playing) start();
        dispatch({ type: "turn", dir });
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (playing) dispatch({ type: "pause" });
        else start();
      }
    },
    active,
  );

  const cell = 100 / N;
  const pad = (dir: Vec, Icon: typeof CaretUp, label: string, cls: string) => (
    <button
      type="button"
      className={`k-btn !min-h-11 !px-0 ${cls}`}
      aria-label={label}
      onClick={() => {
        if (!playing) start();
        dispatch({ type: "turn", dir });
      }}
    >
      <Icon size={20} weight="bold" />
    </button>
  );

  return (
    <AppFrame compact flush>
      <div className="flex h-full flex-col items-center gap-3 p-3">
        <div className="flex w-full max-w-[400px] shrink-0 items-center justify-between text-[13px]">
          <span>
            Score <b className="tabular-nums">{game.score}</b>
          </span>
          <button
            type="button"
            className="k-btn"
            onClick={() => (playing ? dispatch({ type: "pause" }) : start())}
          >
            {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {playing ? "Pause" : game.status === "paused" ? "Resume" : game.status === "over" ? "Play again" : "Play"}
          </button>
          <span>
            Best <b className="tabular-nums">{Math.max(best, game.score)}</b>
          </span>
        </div>

        <div className="grid min-h-0 w-full flex-1 place-items-center [container-type:size]">
        <div
          className="os-snake relative touch-none overflow-hidden rounded-card"
          style={{ width: "min(100cqw, 100cqh, 420px)", height: "min(100cqw, 100cqh, 420px)" }}
          role="img"
          aria-label={`Snake board, score ${game.score}`}
          onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const s = swipe.current;
            swipe.current = null;
            if (!s) return;
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.hypot(dx, dy) < 16) return;
            if (!playing) start();
            dispatch({ type: "turn", dir: Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)] });
          }}
        >
          <span
            className="absolute rounded-full bg-[#ef4444]"
            style={{ left: `${game.food[0] * cell}%`, top: `${game.food[1] * cell}%`, width: `${cell}%`, height: `${cell}%`, transform: "scale(0.7)" }}
          />
          {game.snake.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-[3px] bg-accent"
              style={{
                left: `${s[0] * cell}%`,
                top: `${s[1] * cell}%`,
                width: `${cell}%`,
                height: `${cell}%`,
                transform: "scale(0.9)",
                opacity: i === 0 ? 1 : Math.max(0.45, 1 - i * 0.03),
              }}
            />
          ))}
          {!playing && (
            <div className="absolute inset-0 grid place-items-center bg-black/65 p-4 text-center text-white backdrop-blur-[3px]">
              <div>
                <div className="text-[20px] font-semibold">
                  {game.status === "over" ? "Game over" : game.status === "paused" ? "Paused" : "Snake"}
                </div>
                <div className="mt-1 text-[13px] text-white/80">
                  {game.status === "over" ? `You scored ${game.score}.` : "Arrow keys, WASD or swipe to steer."}
                </div>
                <button type="button" className="k-btn k-btn-primary mt-3" onClick={start}>
                  {game.status === "paused" ? "Resume" : game.status === "over" ? "Play again" : "Start"}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1.5 @min-[520px]:hidden" style={{ width: 168 }}>
          {pad([0, -1], CaretUp, "Up", "col-start-2")}
          {pad([-1, 0], CaretLeft, "Left", "col-start-1 row-start-2")}
          {pad([0, 1], CaretDown, "Down", "col-start-2 row-start-2")}
          {pad([1, 0], CaretRight, "Right", "col-start-3 row-start-2")}
        </div>
      </div>
    </AppFrame>
  );
}
