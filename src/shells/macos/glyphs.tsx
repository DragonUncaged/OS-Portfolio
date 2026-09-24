import { useId } from "react";

export function ControlGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M6.2 2.6h7.6a3.4 3.4 0 0 1 0 6.8H6.2a3.4 3.4 0 0 1 0-6.8Zm7.5 1.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z" />
      <path
        fillRule="evenodd"
        d="M6.2 10.6h7.6a3.4 3.4 0 0 1 0 6.8H6.2a3.4 3.4 0 0 1 0-6.8Zm0 1.3a2.1 2.1 0 0 0 0 4.2h7.6a2.1 2.1 0 0 0 0-4.2H6.2Zm.1.8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"
      />
    </svg>
  );
}

export function SiriGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 5.4c.5 2.6 1.5 3.6 4.1 4.1-2.6.5-3.6 1.5-4.1 4.1-.5-2.6-1.5-3.6-4.1-4.1 2.6-.5 3.6-1.5 4.1-4.1Z" fill="currentColor" />
    </svg>
  );
}

export function SiriOrb({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`mac-orb ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="mac-orb-core" />
    </span>
  );
}

export function AppsIcon({ size = 48 }: { size?: number }) {
  const tiles = ["#ff6259", "#ffb224", "#34c759", "#32ade6", "#0a84ff", "#bf5af2", "#ff375f", "#5e5ce6", "#8e8e93"];
  const cell = 7.4;
  const gap = 3.1;
  const start = (48 - (cell * 3 + gap * 2)) / 2;
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe3ea" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="10.6" fill={`url(#${id}p)`} />
      <rect x="1.4" y="1.4" width="45.2" height="45.2" rx="10.2" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.8" />
      {tiles.map((c, i) => (
        <rect
          key={c}
          x={start + (i % 3) * (cell + gap)}
          y={start + Math.floor(i / 3) * (cell + gap)}
          width={cell}
          height={cell}
          rx="2.2"
          fill={c}
        />
      ))}
    </svg>
  );
}

export function TrashIcon({ size = 48 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9edf3" stopOpacity="0.78" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#dfe4ec" stopOpacity="0.72" />
        </linearGradient>
      </defs>
      <path d="M11.5 12.5h25l-2.3 26.2a3.6 3.6 0 0 1-3.6 3.3H17.4a3.6 3.6 0 0 1-3.6-3.3L11.5 12.5Z" fill={`url(#${id}b)`} stroke="#5b6472" strokeOpacity="0.38" strokeWidth="0.9" />
      <ellipse cx="24" cy="12.5" rx="13.2" ry="3.4" fill="#f7f9fc" stroke="#5b6472" strokeOpacity="0.42" strokeWidth="0.9" />
      <ellipse cx="24" cy="12.7" rx="10.6" ry="2.1" fill="#5b6472" fillOpacity="0.22" />
      <g stroke="#5b6472" strokeOpacity="0.4" strokeWidth="1.3" strokeLinecap="round">
        <path d="M18.6 20.5l.9 15.5M24 20.5V36M29.4 20.5l-.9 15.5" />
      </g>
    </svg>
  );
}

export function FolderIcon({ size = 56 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb6ff" />
          <stop offset="1" stopColor="#2f8df0" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0ff" />
          <stop offset="1" stopColor="#4ba6f7" />
        </linearGradient>
      </defs>
      <path d="M5 14.5A4.5 4.5 0 0 1 9.5 10h11.2c1.3 0 2.5.5 3.3 1.5l2 2.3c.5.5 1.1.8 1.8.8H46.5A4.5 4.5 0 0 1 51 19.1V41.5A4.5 4.5 0 0 1 46.5 46H9.5A4.5 4.5 0 0 1 5 41.5Z" fill={`url(#${id}a)`} />
      <path d="M5 23.5A4.5 4.5 0 0 1 9.5 19H46.5A4.5 4.5 0 0 1 51 23.5V41.5A4.5 4.5 0 0 1 46.5 46H9.5A4.5 4.5 0 0 1 5 41.5Z" fill={`url(#${id}f)`} />
      <path d="M5.6 23.5A3.9 3.9 0 0 1 9.5 19.6H46.5A3.9 3.9 0 0 1 50.4 23.5" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.1" />
    </svg>
  );
}

export function DocumentIcon({ size = 56 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e9ecf1" />
        </linearGradient>
      </defs>
      <path d="M13 8.5A3.5 3.5 0 0 1 16.5 5H33l10 10v32.5A3.5 3.5 0 0 1 39.5 51h-23A3.5 3.5 0 0 1 13 47.5Z" fill={`url(#${id}p)`} stroke="#000" strokeOpacity="0.12" strokeWidth="0.8" />
      <path d="M33 5v6.5A3.5 3.5 0 0 0 36.5 15H43Z" fill="#cfd5de" />
      <g stroke="#9aa3b2" strokeWidth="1.6" strokeLinecap="round">
        <path d="M19 24h18M19 30h18M19 36h12" />
      </g>
    </svg>
  );
}
