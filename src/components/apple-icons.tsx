"use client";

import { useId, type ComponentType } from "react";
import { useNow } from "@/hooks/use-now";
import { DAYS } from "@/lib/format";
import type { AppId } from "@/types";

function squircle(size: number, exponent: number): string {
  const r = size / 2;
  const steps = 96;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = r + r * Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent);
    const y = r + r * Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const TILE = squircle(120, 5);

function gear(cx: number, cy: number, outer: number, root: number, teeth: number, hole: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const marks: [number, number][] = [
      [a - step * 0.3, root],
      [a - step * 0.18, outer],
      [a + step * 0.18, outer],
      [a + step * 0.3, root],
    ];
    for (const [angle, radius] of marks) {
      pts.push(`${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`);
    }
  }
  return `M${pts.join("L")}Z M${cx + hole} ${cy}a${hole} ${hole} 0 1 0 ${-2 * hole} 0a${hole} ${hole} 0 1 0 ${2 * hole} 0Z`;
}

const GEAR = gear(60, 60, 45, 36.5, 12, 24);
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Variable", "Helvetica Neue", sans-serif';

interface ArtProps {
  u: string;
  g: string;
}

interface IconArt {
  bg: [string, string];
  light?: boolean;
  art: ComponentType<ArtProps>;
}

const About = ({ g }: ArtProps) => (
  <>
    <circle cx="60" cy="46" r="20" fill={g} />
    <path d="M18 124C18 93 37 77 60 77s42 16 42 47Z" fill={g} />
  </>
);

const Projects = ({ u, g }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff48a" />
        <stop offset="1" stopColor="#ffa200" />
      </linearGradient>
    </defs>
    <circle cx="23" cy="31" r="2.2" fill="#fff" opacity="0.85" />
    <circle cx="97" cy="24" r="1.7" fill="#fff" opacity="0.8" />
    <circle cx="101" cy="79" r="2.2" fill="#fff" opacity="0.7" />
    <g transform="rotate(38 60 62)">
      <path d="M52 84C52 96 60 108 60 108S68 96 68 84Z" fill={`url(#${u}f)`} />
      <path d="M42 58L27 85l16-6Z" fill="#ffe0d4" />
      <path d="M78 58l15 27-16-6Z" fill="#ffe0d4" />
      <path d="M60 13C75 26 81 49 78 77H42C39 49 45 26 60 13Z" fill={g} />
      <rect x="50" y="77" width="20" height="7" rx="2.5" fill="#dfe4ec" />
      <circle cx="60" cy="44" r="9.5" fill="#2f9bff" stroke="#d6e2f2" strokeWidth="3" />
    </g>
  </>
);

const Experience = ({ g }: ArtProps) => (
  <>
    <path d="M45 43V34a7 7 0 0 1 7-7h16a7 7 0 0 1 7 7v9" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    <rect x="19" y="40" width="82" height="56" rx="11" fill={g} />
    <path d="M19 60C40 74 80 74 101 60" fill="none" stroke="#b6a0ff" strokeWidth="3.5" />
    <rect x="53" y="62" width="14" height="12" rx="3.5" fill="#7647f5" />
  </>
);

const Skills = ({ g }: ArtProps) => (
  <g strokeLinejoin="round" strokeWidth="4">
    <path d="M31 70.5L22 75l38 18.5L98 75l-9-4.5-29 14Z" fill="#fff" stroke="#fff" opacity="0.55" />
    <path d="M31 55l-9 4.5L60 78l38-18.5-9-4.5-29 14Z" fill="#fff" stroke="#fff" opacity="0.8" />
    <path d="M60 62L22 44l38-18 38 18Z" fill={g} stroke="#fff" />
  </g>
);

const Resume = ({ g }: ArtProps) => (
  <>
    <path d="M34 19h40l16 16v60a7 7 0 0 1-7 7H34a7 7 0 0 1-7-7V26a7 7 0 0 1 7-7Z" fill={g} />
    <path d="M74 19v10a6 6 0 0 0 6 6h10Z" fill="#ffc4ce" />
    <circle cx="43" cy="44" r="8" fill="#ff6b81" />
    <rect x="56" y="39" width="20" height="4.5" rx="2.25" fill="#c2c7d1" />
    <rect x="56" y="47" width="13" height="4.5" rx="2.25" fill="#d8dbe2" />
    <rect x="36" y="62" width="45" height="4.5" rx="2.25" fill="#d1d5dc" />
    <rect x="36" y="71" width="45" height="4.5" rx="2.25" fill="#d1d5dc" />
    <rect x="36" y="80" width="36" height="4.5" rx="2.25" fill="#d1d5dc" />
    <rect x="36" y="89" width="26" height="4.5" rx="2.25" fill="#d1d5dc" />
  </>
);

const Contact = ({ g }: ArtProps) => (
  <>
    <rect x="17" y="34" width="86" height="56" rx="10" fill={g} />
    <path d="M22 86l24-22M98 86 74 64" stroke="#cbe3ff" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M21 40l39 30 39-30" fill="none" stroke="#8fc6ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const Terminal = () => (
  <>
    <rect x="14" y="22" width="92" height="76" rx="12" fill="#0b0b0d" stroke="#707076" strokeWidth="2" />
    <path d="M30 48l16 12-16 12" fill="none" stroke="#34e06b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="54" y="68" width="26" height="7" rx="3.5" fill="#fff" />
  </>
);

const Files = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#74c4ff" />
        <stop offset="1" stopColor="#1f86f2" />
      </linearGradient>
    </defs>
    <path d="M20 40a9 9 0 0 1 9-9h18a9 9 0 0 1 6.4 2.6l5.2 5.2a9 9 0 0 0 6.4 2.6H91a9 9 0 0 1 9 9v8H20Z" fill="#1b78de" />
    <rect x="20" y="48" width="80" height="44" rx="9" fill={`url(#${u}f)`} />
    <rect x="23" y="49.5" width="74" height="2.5" rx="1.25" fill="#fff" opacity="0.4" />
  </>
);

const TICKS = Array.from({ length: 36 }, (_, k) => {
  const a = (k * 10 * Math.PI) / 180;
  const inner = k % 3 === 0 ? 35.5 : 39.5;
  return {
    k,
    x1: 60 + Math.cos(a) * inner,
    y1: 60 + Math.sin(a) * inner,
    x2: 60 + Math.cos(a) * 43,
    y2: 60 + Math.sin(a) * 43,
    w: k % 3 === 0 ? 2 : 1.2,
  };
});

const Browser = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5fd0ff" />
        <stop offset="1" stopColor="#0a63f5" />
      </linearGradient>
    </defs>
    <circle cx="60" cy="60" r="47" fill={`url(#${u}f)`} />
    <g stroke="#fff" strokeLinecap="round" opacity="0.95">
      {TICKS.map((t) => (
        <line key={t.k} x1={t.x1.toFixed(2)} y1={t.y1.toFixed(2)} x2={t.x2.toFixed(2)} y2={t.y2.toFixed(2)} strokeWidth={t.w} />
      ))}
    </g>
    <path d="M84 36 65.6 65.6 54.4 54.4Z" fill="#ff3b30" />
    <path d="M36 84l29.6-18.4L54.4 54.4Z" fill="#fff" />
  </>
);

const Settings = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6a6e78" />
        <stop offset="1" stopColor="#2b2d34" />
      </linearGradient>
    </defs>
    <path d={GEAR} fill={`url(#${u}f)`} fillRule="evenodd" />
    <g stroke={`url(#${u}f)`} strokeWidth="6" strokeLinecap="round">
      <path d="M60 60V37.5M60 60l19.5 11.25M60 60 40.5 71.25" />
    </g>
    <circle cx="60" cy="60" r="9" fill={`url(#${u}f)`} />
    <circle cx="60" cy="60" r="3.4" fill="#c9ccd3" />
  </>
);

const Notes = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe975" />
        <stop offset="1" stopColor="#ffc400" />
      </linearGradient>
    </defs>
    <rect width="120" height="40" fill={`url(#${u}f)`} />
    <g fill="#a67c00" opacity="0.5">
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={6 + i * 9} cy="40" r="1.6" />
      ))}
    </g>
    <g fill="#d5d5d0">
      <rect x="16" y="57" width="88" height="2.6" rx="1.3" />
      <rect x="16" y="73" width="88" height="2.6" rx="1.3" />
      <rect x="16" y="89" width="88" height="2.6" rx="1.3" />
      <rect x="16" y="105" width="58" height="2.6" rx="1.3" />
    </g>
  </>
);

const KEYS = [56, 78, 100].flatMap((y, row) =>
  [27.5, 49, 70.5, 92].map((x, col) => ({ x, y, fill: col === 3 ? "#ff9f0a" : row === 0 ? "#a6a6ab" : "#636368" })),
);

const Calculator = () => (
  <>
    <rect x="17" y="15" width="86" height="25" rx="8" fill="#2a2a2e" />
    <text x="96" y="34" textAnchor="end" fontFamily={FONT} fontSize="18" fontWeight="300" fill="#fff">
      128
    </text>
    {KEYS.map((k) => (
      <circle key={`${k.x}-${k.y}`} cx={k.x} cy={k.y} r="9.5" fill={k.fill} />
    ))}
  </>
);

function Calendar() {
  const d = new Date(useNow(60_000));
  return (
    <>
      <text x="60" y="38" textAnchor="middle" fontFamily={FONT} fontSize="19" fontWeight="700" letterSpacing="0.6" fill="#ff3b30">
        {DAYS[d.getDay()].slice(0, 3).toUpperCase()}
      </text>
      <text x="60" y="95" textAnchor="middle" fontFamily={FONT} fontSize="62" fontWeight="300" fill="#1c1c1e">
        {d.getDate()}
      </text>
    </>
  );
}

const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => i);

function Clock({ u }: ArtProps) {
  const now = useNow(1000);
  const d = new Date(now);
  const seconds = d.getSeconds();
  const minutes = d.getMinutes() + seconds / 60;
  const hours = (d.getHours() % 12) + minutes / 60;
  // the angle keeps growing so the hand never spins backwards at :00
  const sweep = (Math.floor(now / 1000) % 86_400) * 6;
  const hand = (deg: number, sweeping = false) => ({
    transform: `rotate(${deg}deg)`,
    transformOrigin: "60px 60px",
    transformBox: "view-box" as const,
    transition: sweeping ? "transform 1s linear" : undefined,
  });
  return (
    <>
      <defs>
        <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#e9ebf0" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill={`url(#${u}f)`} />
      <g stroke="#1c1c1e" strokeLinecap="round">
        {HOUR_MARKS.map((i) => (
          <line key={i} x1="60" y1="17" x2="60" y2={i % 3 === 0 ? 25 : 21.5} strokeWidth={i % 3 === 0 ? 3 : 1.8} transform={`rotate(${i * 30} 60 60)`} />
        ))}
      </g>
      <line x1="60" y1="60" x2="60" y2="36" stroke="#1c1c1e" strokeWidth="5.5" strokeLinecap="round" style={hand(hours * 30)} />
      <line x1="60" y1="60" x2="60" y2="24" stroke="#1c1c1e" strokeWidth="4" strokeLinecap="round" style={hand(minutes * 6)} />
      <line x1="60" y1="70" x2="60" y2="19" stroke="#ff9500" strokeWidth="1.8" strokeLinecap="round" style={hand(sweep, true)} />
      <circle cx="60" cy="60" r="4" fill="#1c1c1e" />
      <circle cx="60" cy="60" r="2" fill="#ff9500" />
    </>
  );
}

const Music = ({ g }: ArtProps) => (
  <>
    <path d="M50 34 92 24v13L50 47Z" fill={g} />
    <rect x="50" y="36" width="6.5" height="50" fill={g} />
    <rect x="85.5" y="27" width="6.5" height="49" fill={g} />
    <ellipse cx="44" cy="87" rx="13" ry="9.5" transform="rotate(-18 44 87)" fill={g} />
    <ellipse cx="79.5" cy="77" rx="13" ry="9.5" transform="rotate(-18 79.5 77)" fill={g} />
  </>
);

const PETALS = ["#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#0a84ff", "#af52de"];

const Photos = () => (
  <g style={{ mixBlendMode: "multiply" }}>
    {PETALS.map((fill, k) => (
      <ellipse key={fill} cx="60" cy="36" rx="14" ry="23" fill={fill} opacity="0.88" transform={`rotate(${k * 60} 60 60)`} style={{ mixBlendMode: "multiply" }} />
    ))}
  </g>
);

const Paint = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#34c8ff" />
        <stop offset="0.55" stopColor="#0a84ff" />
        <stop offset="1" stopColor="#7d5cff" />
      </linearGradient>
    </defs>
    <rect x="18" y="20" width="24" height="24" rx="6" fill="#ff6fae" transform="rotate(-10 30 32)" />
    <circle cx="88" cy="88" r="12" fill="#ffcc00" />
    <path d="M20 80C33 40 49 102 62 64S86 30 100 56" fill="none" stroke={`url(#${u}f)`} strokeWidth="9" strokeLinecap="round" />
  </>
);

const Mines = ({ u }: ArtProps) => (
  <>
    <defs>
      <linearGradient id={`${u}f`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff6f63" />
        <stop offset="1" stopColor="#dd2218" />
      </linearGradient>
    </defs>
    <g stroke="#fff" strokeWidth="2" opacity="0.2">
      <path d="M40 0v120M80 0v120M0 40h120M0 80h120" />
    </g>
    <text x="20" y="108" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" fill="#fff" opacity="0.75">
      1
    </text>
    <text x="100" y="29" textAnchor="middle" fontFamily={FONT} fontSize="24" fontWeight="800" fill="#fff" opacity="0.75">
      2
    </text>
    <ellipse cx="53" cy="93" rx="26" ry="8" fill="#256d31" />
    <path d="M56 27l39 15.5L56 58Z" fill={`url(#${u}f)`} />
    <rect x="50" y="23" width="6.5" height="68" rx="3.25" fill="#fff" />
  </>
);

const Snake = () => (
  <>
    <circle cx="90" cy="31" r="9" fill="#ff453a" />
    <path d="M90 22q4-7 9-5-2 6-9 5" fill="#6de38b" />
    <path d="M24 90h44a15 15 0 0 0 15-15V63a15 15 0 0 0-15-15H44" fill="none" stroke="#7df0ae" strokeWidth="15" strokeLinecap="round" />
    <path d="M30 48h-8m0 0-3-3.5m3 3.5-3 3.5" stroke="#ff5d7a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="41" cy="48" r="10.5" fill="#a6ffcf" />
    <circle cx="38" cy="45" r="2.4" fill="#23137a" />
  </>
);

const Tips = ({ g }: ArtProps) => (
  <>
    <path d="M60 20C42 20 30 33 30 49c0 11 6 18 12 25 3 4 5 7 5 12h26c0-5 2-8 5-12 6-7 12-14 12-25 0-16-12-29-30-29Z" fill={g} />
    <path d="M51 56l9 11 9-11M60 67v19" fill="none" stroke="#ffb800" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="47.5" y="90" width="25" height="6.5" rx="3.25" fill="#fff" />
    <rect x="51" y="99.5" width="18" height="6.5" rx="3.25" fill="#fff" opacity="0.9" />
  </>
);

const Viewer = ({ g }: ArtProps) => (
  <>
    <path d="M18 60c14-20 28-29 42-29s28 9 42 29c-14 20-28 29-42 29S32 80 18 60Z" fill={g} />
    <circle cx="60" cy="60" r="17" fill="#0a84ff" />
    <circle cx="60" cy="60" r="7.5" fill="#0b1020" />
    <circle cx="54" cy="54" r="3.4" fill="#fff" opacity="0.9" />
  </>
);

const Monitor = () => (
  <>
    <g stroke="#fff" strokeWidth="1.2" opacity="0.1">
      <path d="M30 0v120M60 0v120M90 0v120M0 30h120M0 60h120M0 90h120" />
    </g>
    <path d="M10 66h24l9-27 11 48 10-35 8 19h13l6-12 6 7h13" fill="none" stroke="#30d158" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

const ART: Record<AppId, IconArt> = {
  about: { bg: ["#bcc5d3", "#7d8696"], art: About },
  projects: { bg: ["#ffb54d", "#ff3a5c"], art: Projects },
  experience: { bg: ["#c9a8ff", "#6a3bf0"], art: Experience },
  skills: { bg: ["#7ce89c", "#0e9b56"], art: Skills },
  resume: { bg: ["#ff8f8f", "#e61f50"], art: Resume },
  contact: { bg: ["#62ceff", "#0a69fb"], art: Contact },
  terminal: { bg: ["#4c4c52", "#101012"], art: Terminal },
  files: { bg: ["#ffffff", "#eceff5"], light: true, art: Files },
  browser: { bg: ["#ffffff", "#eceff5"], light: true, art: Browser },
  settings: { bg: ["#dcdee3", "#8a8e98"], art: Settings },
  notes: { bg: ["#ffffff", "#f4f4ef"], light: true, art: Notes },
  calculator: { bg: ["#4c4c52", "#121214"], art: Calculator },
  calendar: { bg: ["#ffffff", "#eceff5"], light: true, art: Calendar },
  clock: { bg: ["#2e2e31", "#000000"], art: Clock },
  music: { bg: ["#ff7389", "#fa1c42"], art: Music },
  photos: { bg: ["#ffffff", "#eceff5"], light: true, art: Photos },
  paint: { bg: ["#ffffff", "#eceff5"], light: true, art: Paint },
  mines: { bg: ["#a7e27c", "#3a9847"], art: Mines },
  snake: { bg: ["#8d75ff", "#381dbc"], art: Snake },
  monitor: { bg: ["#3e4553", "#0e1015"], art: Monitor },
  viewer: { bg: ["#a3a9b4", "#494c56"], art: Viewer },
  tips: { bg: ["#ffe65e", "#ffb000"], art: Tips },
};

export default function AppleIcon({ id, size, className }: { id: AppId; size: number; className?: string }) {
  const u = useId();
  const icon = ART[id];
  const Art = icon.art;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ flex: "none", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${u}c`}>
          <path d={TILE} />
        </clipPath>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={icon.bg[0]} />
          <stop offset="1" stopColor={icon.bg[1]} />
        </linearGradient>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4e8f0" />
        </linearGradient>
        <linearGradient id={`${u}r`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={icon.light ? 1 : 0.7} />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={icon.light ? 0.16 : 0.26} />
        </linearGradient>
        <radialGradient id={`${u}l`} cx="0.5" cy="0" r="0.75" gradientTransform="translate(0.5 0) scale(1.25 1) translate(-0.5 0)">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1.8" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>
      <g clipPath={`url(#${u}c)`}>
        <rect width="120" height="120" fill={`url(#${u}b)`} />
        {!icon.light && <rect width="120" height="120" fill={`url(#${u}l)`} />}
        <g filter={`url(#${u}s)`}>
          <Art u={u} g={`url(#${u}g)`} />
        </g>
        <path d={TILE} fill="none" stroke={`url(#${u}r)`} strokeWidth="3.2" />
      </g>
    </svg>
  );
}
