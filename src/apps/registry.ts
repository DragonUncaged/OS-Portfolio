import {
  Briefcase,
  Compass,
  EnvelopeSimple,
  Folder,
  GearSix,
  Globe,
  ReadCvLogo,
  RocketLaunch,
  Stack,
  TerminalWindow,
  UserCircle,
  type Icon,
} from "@phosphor-icons/react";
import type { AppId, Platform } from "@/types";

export type AppCategory = "portfolio" | "system" | "utility" | "game";

export interface AppDef {
  id: AppId;
  name: string;
  names?: Partial<Record<Platform, string>>;
  glyph: Icon;
  glyphs?: Partial<Record<Platform, Icon>>;
  color: [string, string];
  category: AppCategory;
  size: [number, number];
  min?: [number, number];
  exclude?: Platform[];
  hidden?: boolean;
  keywords?: string;
}

export const APPS: Record<AppId, AppDef> = {
  about: {
    id: "about",
    name: "About Me",
    glyph: UserCircle,
    color: ["#5ac8fa", "#0a7aff"],
    category: "portfolio",
    size: [760, 560],
    keywords: "bio profile who intro",
  },
  projects: {
    id: "projects",
    name: "Projects",
    glyph: RocketLaunch,
    color: ["#ff9f6b", "#ff375f"],
    category: "portfolio",
    size: [880, 600],
    keywords: "work portfolio apps builds",
  },
  experience: {
    id: "experience",
    name: "Experience",
    glyph: Briefcase,
    color: ["#b08cff", "#6e4bff"],
    category: "portfolio",
    size: [760, 580],
    keywords: "jobs work career education history",
  },
  skills: {
    id: "skills",
    name: "Skills",
    glyph: Stack,
    color: ["#5fe3a1", "#11a36a"],
    category: "portfolio",
    size: [720, 560],
    keywords: "tech stack tools languages",
  },
  resume: {
    id: "resume",
    name: "Resume",
    glyph: ReadCvLogo,
    color: ["#ffffff", "#dfe3ea"],
    category: "portfolio",
    size: [720, 640],
    keywords: "cv pdf print",
  },
  contact: {
    id: "contact",
    name: "Contact",
    glyph: EnvelopeSimple,
    color: ["#4fc3ff", "#1a73ff"],
    category: "portfolio",
    size: [700, 560],
    keywords: "mail email github linkedin codechef hire links social",
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    glyph: TerminalWindow,
    color: ["#4a4a4f", "#161618"],
    category: "system",
    size: [720, 460],
    min: [380, 240],
    keywords: "shell console command prompt bash zsh powershell",
  },
  files: {
    id: "files",
    name: "Files",
    names: { macos: "Finder", windows: "File Explorer" },
    glyph: Folder,
    color: ["#6fd0ff", "#1b8dff"],
    category: "system",
    size: [820, 520],
    keywords: "finder explorer nautilus folders documents",
  },
  browser: {
    id: "browser",
    name: "Browser",
    names: { macos: "Safari", ios: "Safari", windows: "Edge", wp: "Edge", ubuntu: "Web" },
    glyph: Globe,
    glyphs: { macos: Compass, ios: Compass },
    color: ["#63d4ff", "#1667ff"],
    category: "system",
    size: [960, 640],
    min: [420, 320],
    keywords: "web internet safari edge firefox chrome live",
  },
  settings: {
    id: "settings",
    name: "Settings",
    names: { macos: "System Settings" },
    glyph: GearSix,
    color: ["#b9bec8", "#6d7480"],
    category: "system",
    size: [800, 580],
    keywords: "preferences wallpaper theme dark light accent appearance personalize",
  },
};

const APP_IDS = Object.keys(APPS) as AppId[];

export function appName(id: AppId, platform: Platform): string {
  const app = APPS[id];
  return app.names?.[platform] ?? app.name;
}

export function launchable(platform: Platform): AppId[] {
  return APP_IDS.filter((id) => !APPS[id].hidden && !APPS[id].exclude?.includes(platform));
}

export const DARK_GLYPH: Partial<Record<AppId, string>> = {
  resume: "#d6453d",
};
