"use client";

import { useId, type ComponentType } from "react";
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

const ART: Record<string, IconArt> = {
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
