"use client";

import { useId, type ReactNode } from "react";
import type { Family } from "@/types";

interface ArtProps {
  dark: boolean;
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Waves({ sky, layers, sun }: { sky: string[]; layers: string[]; sun?: string }) {
  const id = useId();
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          {sky.map((c, i) => (
            <stop key={i} offset={i / (sky.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        {layers.map((c, i) => (
          <linearGradient key={i} id={`${id}l${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c} />
            <stop offset="1" stopColor={c} stopOpacity="0.78" />
          </linearGradient>
        ))}
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={sun ?? "#fff"} stopOpacity="0.9" />
          <stop offset="1" stopColor={sun ?? "#fff"} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}s)`} />
      {sun && <circle cx="1130" cy="330" r="420" fill={`url(#${id}g)`} />}
      {layers.map((_, i) => {
        const y = 430 + i * 105;
        const a = i % 2 === 0 ? 1 : -1;
        return (
          <path
            key={i}
            fill={`url(#${id}l${i})`}
            d={`M-50,${y + 40 * a} C 250,${y - 150 * a} 560,${y + 130 * a} 860,${y - 20 * a} S 1380,${y - 170 * a} 1650,${y + 30 * a} L1650,1050 L-50,1050 Z`}
          />
        );
      })}
    </Svg>
  );
}

function Blobs({ base, blobs }: { base: string; blobs: [string, number, number, number][] }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: [
          ...blobs.map(([c, x, y, r]) => `radial-gradient(${r}% ${r * 1.2}% at ${x}% ${y}%, ${c} 0%, transparent 70%)`),
          base,
        ].join(","),
      }}
    />
  );
}

function Ridge({ sky, layers }: { sky: string[]; layers: string[] }) {
  const id = useId();
  const peaks = [
    "M-20,640 L140,520 L260,600 L420,430 L560,560 L700,470 L880,610 L1040,440 L1180,540 L1330,400 L1480,520 L1620,450 L1620,1020 L-20,1020 Z",
    "M-20,720 L120,640 L300,700 L470,560 L640,680 L800,590 L960,700 L1120,580 L1300,690 L1450,600 L1620,690 L1620,1020 L-20,1020 Z",
    "M-20,800 L180,700 L340,780 L520,670 L700,790 L900,690 L1080,800 L1260,700 L1440,790 L1620,720 L1620,1020 L-20,1020 Z",
    "M-20,880 L200,800 L400,870 L620,780 L820,880 L1040,790 L1240,880 L1440,810 L1620,870 L1620,1020 L-20,1020 Z",
  ];
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          {sky.map((c, i) => (
            <stop key={i} offset={i / (sky.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}s)`} />
      <circle cx="1180" cy="330" r="74" fill="#fff" opacity="0.85" />
      <circle cx="1180" cy="330" r="150" fill="#fff" opacity="0.12" />
      {peaks.map((d, i) => (
        <path key={i} d={d} fill={layers[i % layers.length]} strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

function Fan({ base, petals }: { base: string[]; petals: string[] }) {
  const id = useId();
  const count = 9;
  const angles = Array.from({ length: count }, (_, i) => -76 + (152 / (count - 1)) * i).sort(
    (a, b) => Math.abs(b) - Math.abs(a),
  );
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0.3" y2="1">
          {base.map((c, i) => (
            <stop key={i} offset={i / (base.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        {petals.map((c, i) => (
          <linearGradient key={i} id={`${id}p${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.35" stopColor={c} stopOpacity="0.9" />
            <stop offset="1" stopColor={c} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}b)`} />
      <g transform="translate(800 1010)">
        {angles.map((a, i) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            fill={`url(#${id}p${i % petals.length})`}
            d="M0,0 C -230,-190 -250,-560 0,-800 C 250,-560 230,-190 0,0 Z"
          />
        ))}
      </g>
    </Svg>
  );
}

function Beams({ base, beams }: { base: string; beams: [string, number, number][] }) {
  const id = useId();
  return (
    <Svg>
      <defs>
        {beams.map(([c], i) => (
          <linearGradient key={i} id={`${id}${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity="0" />
            <stop offset="0.5" stopColor={c} stopOpacity="0.85" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </linearGradient>
        ))}
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={base} />
      <g filter={`url(#${id}f)`}>
        {beams.map(([, x, w], i) => (
          <rect key={i} x={x} y="-300" width={w} height="1700" fill={`url(#${id}${i})`} transform={`rotate(32 ${x} 500)`} />
        ))}
      </g>
    </Svg>
  );
}

const ART: Record<string, (p: ArtProps) => ReactNode> = {
  dunes: () => (
    <Waves
      sky={["#27348b", "#7a3fc4", "#ff7e5f", "#feb47b"]}
      sun="#ffd9a0"
      layers={["#ff9a62", "#fb5f6c", "#d43a83", "#8a2f9c", "#47217a", "#23104f"]}
    />
  ),
  aurora: () => (
    <Blobs
      base="#0a1030"
      blobs={[
        ["#2f6bff", 18, 28, 55],
        ["#b05cff", 82, 18, 48],
        ["#12d6c5", 62, 88, 52],
        ["#ff5fa2", 12, 92, 40],
      ]}
    />
  ),
  ridge: () => (
    <Ridge sky={["#1e2a78", "#b0478f", "#ff9a76", "#ffe0a8"]} layers={["#8e4a8a", "#673a7e", "#43296a", "#22163f"]} />
  ),
  graphite: () => (
    <Blobs
      base="linear-gradient(140deg, #3a3d46 0%, #17181c 60%, #0b0b0d 100%)"
      blobs={[
        ["rgb(160 170 190 / 0.55)", 22, 18, 42],
        ["rgb(90 100 130 / 0.5)", 86, 82, 46],
      ]}
    />
  ),
  ribbons: ({ dark }) =>
    dark ? (
      <Fan base={["#04113a", "#0a2a8a", "#061a52"]} petals={["#1e6bff", "#3fa0ff", "#0f47c9", "#59b8ff"]} />
    ) : (
      <Fan base={["#d6ebff", "#9cc9ff", "#5fa2f5"]} petals={["#2f7bff", "#66b3ff", "#1657d8", "#8fd0ff"]} />
    ),
  glow: () => (
    <Beams
      base="#070b1f"
      beams={[
        ["#22d3ee", 220, 150],
        ["#6366f1", 620, 220],
        ["#d946ef", 1060, 160],
        ["#38bdf8", 1380, 90],
      ]}
    />
  ),
  flow: () => (
    <Waves
      sky={["#ffe9c9", "#ffc6a8", "#ff9ec0"]}
      sun="#fff3d6"
      layers={["#ffb37a", "#ff8d8d", "#f062a4", "#b43fbf", "#6e34c9", "#3d219a"]}
    />
  ),
  midnight: () => (
    <Blobs
      base="#05060f"
      blobs={[
        ["#1d4ed8", 78, 30, 52],
        ["#7c3aed", 24, 74, 50],
        ["#0ea5e9", 55, 108, 40],
      ]}
    />
  ),
};

export const DEFAULT_WALLPAPER: Record<Family, string> = { macos: "dunes", windows: "ribbons", linux: "orbit" };

export function Wallpaper({
  id,
  family,
  dark = false,
  dim = true,
  className,
}: {
  id: string;
  family: Family;
  dark?: boolean;
  dim?: boolean;
  className?: string;
}) {
  const art = ART[id] ?? ART[DEFAULT_WALLPAPER[family]];
  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {art({ dark })}
      {dim && dark && <div className="absolute inset-0 bg-black/30" />}
    </div>
  );
}
