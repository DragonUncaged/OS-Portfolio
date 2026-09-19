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

function Rings({ base, ring, dots }: { base: string[]; ring: string; dots: string[] }) {
  const id = useId();
  const radii = [120, 210, 310, 420, 540, 670, 810, 960];
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          {base.map((c, i) => (
            <stop key={i} offset={i / (base.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={dots[0]} stopOpacity="0.95" />
          <stop offset="1" stopColor={dots[0]} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}b)`} />
      <circle cx="1120" cy="560" r="330" fill={`url(#${id}g)`} opacity="0.55" />
      <g fill="none" stroke={ring} strokeWidth="1.6">
        {radii.map((r, i) => (
          <circle key={r} cx="1120" cy="560" r={r} opacity={0.5 - i * 0.045} />
        ))}
      </g>
      <circle cx="1120" cy="560" r="46" fill={dots[0]} />
      {radii.slice(0, 6).map((r, i) => {
        const t = (i * 137.5 * Math.PI) / 180;
        return (
          <circle
            key={r}
            cx={1120 + Math.cos(t) * r}
            cy={560 + Math.sin(t) * r}
            r={8 + (i % 3) * 5}
            fill={dots[(i + 1) % dots.length]}
          />
        );
      })}
    </Svg>
  );
}

function Grid({ sky, line, sun }: { sky: string[]; line: string; sun: string[] }) {
  const id = useId();
  const rows = Array.from({ length: 13 }, (_, i) => 600 + Math.pow(i / 12, 2.1) * 400);
  const cols = Array.from({ length: 31 }, (_, i) => i - 15);
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          {sky.map((c, i) => (
            <stop key={i} offset={i / (sky.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}u`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sun[0]} />
          <stop offset="1" stopColor={sun[1]} />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[sky.length - 1]} />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}s)`} />
      <circle cx="800" cy="560" r="210" fill={`url(#${id}u)`} />
      <rect y="600" width="1600" height="400" fill={`url(#${id}f)`} />
      <g stroke={line} strokeWidth="1.5" opacity="0.75">
        {rows.map((y) => (
          <line key={y} x1="0" x2="1600" y1={y} y2={y} />
        ))}
        {cols.map((c) => (
          <line key={c} x1={800 + c * 26} y1="600" x2={800 + c * 190} y2="1000" />
        ))}
      </g>
    </Svg>
  );
}

function Folds({
  base,
  folds,
  rim,
  shade,
}: {
  base: [string, string];
  folds: string[][];
  rim: string;
  shade: number;
}) {
  const id = useId();
  const cover = "L-60,1060 L-60,-60 L1660,-60 Z";
  const edges: { d: string; close: string; grad: [number, number, number, number] }[] = [
    { d: "M470,-60 C580,190 430,380 225,505 C95,585 5,650 -60,720", close: "L-60,-60 Z", grad: [-20, 20, 400, 430] },
    { d: "M1190,-60 C1350,215 1130,430 805,560 C520,672 200,805 -60,1050", close: cover, grad: [215, 265, 905, 640] },
    { d: "M1660,105 C1500,420 1185,600 885,722 C625,830 425,930 300,1060", close: cover, grad: [720, 440, 1270, 715] },
    { d: "M1660,555 C1425,700 1185,822 1000,1060", close: cover, grad: [1110, 640, 1470, 880] },
  ];
  const order = [3, 2, 1, 0];
  return (
    <Svg>
      <defs>
        <linearGradient id={`${id}b`} gradientUnits="userSpaceOnUse" x1="1250" y1="760" x2="1620" y2="1010">
          <stop offset="0" stopColor={base[0]} />
          <stop offset="1" stopColor={base[1]} />
        </linearGradient>
        {edges.map((e, i) => (
          <linearGradient key={i} id={`${id}f${i}`} gradientUnits="userSpaceOnUse" x1={e.grad[0]} y1={e.grad[1]} x2={e.grad[2]} y2={e.grad[3]}>
            {folds[i].map((c, n) => (
              <stop key={n} offset={n / (folds[i].length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
        <filter id={`${id}soft`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400">
          <feGaussianBlur stdDeviation="34" />
        </filter>
        <filter id={`${id}glow`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={`${id}line`} filterUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${id}b)`} />
      {order.map((i) => {
        const e = edges[i];
        return (
          <g key={i}>
            <path d={e.d} fill="none" stroke="#000" strokeWidth="70" opacity={shade} transform="translate(26 30)" filter={`url(#${id}soft)`} />
            <path d={`${e.d} ${e.close}`} fill={`url(#${id}f${i})`} />
            <path d={e.d} fill="none" stroke={rim} strokeWidth="22" opacity="0.4" filter={`url(#${id}glow)`} />
            <path d={e.d} fill="none" stroke={rim} strokeWidth="3.2" opacity="0.95" filter={`url(#${id}line)`} />
          </g>
        );
      })}
    </Svg>
  );
}

const ART: Record<string, (p: ArtProps) => ReactNode> = {
  gilt: ({ dark }) =>
    dark ? (
      <Folds
        base={["#1a1730", "#2c2644"]}
        rim="#f1d6a4"
        shade={0.5}
        folds={[
          ["#3a3a66", "#2a2c55", "#4a4f86", "#7d7fae"],
          ["#0c0e1e", "#1b1f42", "#343a70", "#6b6ea6"],
          ["#0a0b18", "#1a1c3c", "#3a3764", "#7a6f96"],
          ["#0c0a16", "#231d3a", "#4a3c5c", "#8a7388"],
        ]}
      />
    ) : (
      <Folds
        base={["#5d5468", "#8f8a9c"]}
        rim="#fffaf0"
        shade={0.3}
        folds={[
          ["#a98860", "#c9aa7f", "#e6d3b3", "#f6ecda"],
          ["#5f4735", "#8f7155", "#c9ac86", "#efe2cb"],
          ["#59443a", "#8b7262", "#bfab98", "#e9dfd3"],
          ["#4d4250", "#7b6f7e", "#a79fae", "#d6d1dc"],
        ]}
      />
    ),
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
  orbit: () => <Rings base={["#2c001e", "#5e2750", "#a03a54", "#e95420"]} ring="#ffffff" dots={["#ffd9c2", "#f99b11", "#ffffff"]} />,
  peaks: () => (
    <Ridge sky={["#2c001e", "#77216f", "#e95420", "#f9c784"]} layers={["#8b2f6b", "#641f58", "#431444", "#240a29"]} />
  ),
  ember: () => (
    <Blobs
      base="#1c0716"
      blobs={[
        ["#e95420", 80, 80, 55],
        ["#77216f", 20, 22, 55],
        ["#f99b11", 96, 12, 34],
      ]}
    />
  ),
  grid: () => <Grid sky={["#10061c", "#3b0f4a", "#8a1f5c"]} line="#ff7a3d" sun={["#ffd166", "#e95420"]} />,
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
