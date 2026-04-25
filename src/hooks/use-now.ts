"use client";

import { useSyncExternalStore } from "react";

function makeTicker(step: number) {
  const subs = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | undefined;
  let now = 0;
  const floor = () => Math.floor(Date.now() / step) * step;
  return {
    subscribe(cb: () => void) {
      subs.add(cb);
      if (timer === undefined) {
        now = floor();
        timer = setInterval(() => {
          now = floor();
          subs.forEach((f) => f());
        }, step);
      }
      return () => {
        subs.delete(cb);
        if (subs.size === 0 && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    // floored while idle so two reads in a row agree
    get: () => (timer === undefined ? floor() : now),
  };
}

const tickers = new Map<number, ReturnType<typeof makeTicker>>();

export function useNow(step = 1000): number {
  let ticker = tickers.get(step);
  if (!ticker) {
    ticker = makeTicker(step);
    tickers.set(step, ticker);
  }
  return useSyncExternalStore(ticker.subscribe, ticker.get, () => 0);
}
