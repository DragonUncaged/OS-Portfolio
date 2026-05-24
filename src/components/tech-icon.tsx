import { Code, Database, type Icon } from "@phosphor-icons/react";
import {
  siCodechef,
  siCss,
  siDocker,
  siExpress,
  siFastapi,
  siFirebase,
  siGit,
  siGithub,
  siGo,
  siJavascript,
  siLangchain,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPython,
  siReact,
  siRedux,
  siStreamlit,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

const BRANDS: Record<string, SimpleIcon> = {
  javascript: siJavascript,
  typescript: siTypescript,
  react: siReact,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  redux: siRedux,
  tailwind: siTailwindcss,
  python: siPython,
  mongodb: siMongodb,
  firebase: siFirebase,
  docker: siDocker,
  go: siGo,
  css: siCss,
  langchain: siLangchain,
  streamlit: siStreamlit,
  fastapi: siFastapi,
  express: siExpress,
  git: siGit,
  github: siGithub,
  codechef: siCodechef,
};

const GENERIC: Record<string, Icon> = { sql: Database };

function techKey(name: string): string {
  const n = name.toLowerCase();
  if (n.startsWith("javascript")) return "javascript";
  if (n.startsWith("next")) return "nextjs";
  if (n.startsWith("node")) return "nodejs";
  if (n.startsWith("tailwind")) return "tailwind";
  return n.replace(/[^a-z0-9]/g, "");
}

// near-black and near-white brand colours vanish on one of the themes
function usable(hex: string): boolean {
  const n = parseInt(hex, 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.18 && lum < 0.9;
}

export function TechIcon({
  name,
  size = 20,
  mono = false,
  className,
}: {
  name: string;
  size?: number;
  mono?: boolean;
  className?: string;
}) {
  const key = BRANDS[name] || GENERIC[name] ? name : techKey(name);
  const brand = BRANDS[key];
  if (brand) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        fill={mono || !usable(brand.hex) ? "currentColor" : `#${brand.hex}`}
        aria-hidden="true"
      >
        <path d={brand.path} />
      </svg>
    );
  }
  const Glyph = GENERIC[key] ?? Code;
  return <Glyph size={size} weight="duotone" className={className} aria-hidden="true" />;
}

export function LinkedInGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="currentColor" opacity="0.14" />
      <text
        x="12"
        y="16.6"
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fill="currentColor"
      >
        in
      </text>
    </svg>
  );
}
