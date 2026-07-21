"use client";

import { useId } from "react";

export function WinLogo({ size = 22 }: { size?: number }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fd3ff" />
          <stop offset="1" stopColor="#1368e8" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <rect x="2" y="2" width="9.3" height="9.3" rx="1.2" />
        <rect x="12.7" y="2" width="9.3" height="9.3" rx="1.2" />
        <rect x="2" y="12.7" width="9.3" height="9.3" rx="1.2" />
        <rect x="12.7" y="12.7" width="9.3" height="9.3" rx="1.2" />
      </g>
    </svg>
  );
}
