"use client";

import { useMemo, useState } from "react";
import { search, type Hit } from "@/lib/search";
import { usePlatform } from "@/stores/session";

export function useLauncher(onDone: () => void, limit = 9) {
  const platform = usePlatform();
  const [query, setQueryRaw] = useState("");
  const [index, setIndex] = useState(0);
  const hits = useMemo(() => search(query, platform, limit), [query, platform, limit]);
  const run = (hit: Hit | undefined) => {
    if (!hit) return;
    onDone();
    hit.run();
  };
  return {
    query,
    setQuery: (q: string) => {
      setQueryRaw(q);
      setIndex(0);
    },
    hits,
    index,
    setIndex,
    run,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(hits.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        run(hits[index]);
      }
    },
  };
}
