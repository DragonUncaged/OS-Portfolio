import {
  Briefcase,
  Calculator,
  CalendarBlank,
  Clock,
  Compass,
  EnvelopeSimple,
  FileText,
  Flag,
  Folder,
  GameController,
  GearSix,
  Globe,
  Images,
  Lightbulb,
  MusicNotes,
  NotePencil,
  PaintBrush,
  Pulse,
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
  notes: {
    id: "notes",
    name: "Notes",
    names: { windows: "Sticky Notes" },
    glyph: NotePencil,
    color: ["#ffe27a", "#ffb700"],
    category: "utility",
    size: [720, 500],
    keywords: "memo write text",
  },
  calculator: {
    id: "calculator",
    name: "Calculator",
    glyph: Calculator,
    color: ["#5b5b60", "#1f1f22"],
    category: "utility",
    size: [320, 500],
    min: [280, 440],
    keywords: "math sum",
  },
  calendar: {
    id: "calendar",
    name: "Calendar",
    glyph: CalendarBlank,
    color: ["#ff7a70", "#ff2d2d"],
    category: "utility",
    size: [720, 560],
    keywords: "date month today",
  },
  clock: {
    id: "clock",
    name: "Clock",
    glyph: Clock,
    color: ["#3b3b40", "#0d0d0f"],
    category: "utility",
    size: [460, 520],
    min: [340, 420],
    keywords: "time stopwatch timer world",
  },
  music: {
    id: "music",
    name: "Music",
    names: { windows: "Media Player" },
    glyph: MusicNotes,
    color: ["#ff6f91", "#fa233b"],
    category: "utility",
    size: [720, 520],
    keywords: "player audio song synth",
  },
  photos: {
    id: "photos",
    name: "Photos",
    glyph: Images,
    color: ["#ffd66b", "#ff6ad5"],
    category: "utility",
    size: [820, 560],
    keywords: "gallery wallpapers images pictures",
  },
  paint: {
    id: "paint",
    name: "Paint",
    names: { macos: "Freeform", ios: "Freeform", ubuntu: "Drawing", android: "Canvas" },
    glyph: PaintBrush,
    color: ["#7ef0e0", "#16a9c9"],
    category: "utility",
    size: [820, 560],
    min: [420, 360],
    keywords: "draw sketch canvas brush",
  },
  mines: {
    id: "mines",
    name: "Mines",
    names: { windows: "Minesweeper", wp: "Minesweeper" },
    glyph: Flag,
    color: ["#9ad06b", "#3f9142"],
    category: "game",
    size: [420, 520],
    min: [340, 440],
    keywords: "game minesweeper puzzle",
  },
  snake: {
    id: "snake",
    name: "Snake",
    glyph: GameController,
    color: ["#8f7bff", "#4b2fd6"],
    category: "game",
    size: [460, 540],
    min: [340, 440],
    keywords: "game arcade",
  },
  monitor: {
    id: "monitor",
    name: "System Monitor",
    names: { macos: "Activity Monitor", windows: "Task Manager" },
    glyph: Pulse,
    color: ["#3f4652", "#12151a"],
    category: "system",
    size: [640, 460],
    exclude: ["ios", "wp", "android"],
    keywords: "processes tasks cpu memory activity",
  },
  viewer: {
    id: "viewer",
    name: "Viewer",
    names: {
      macos: "Preview",
      ios: "Quick Look",
      windows: "Notepad",
      wp: "Reader",
      ubuntu: "Document Viewer",
    },
    glyph: FileText,
    color: ["#ffffff", "#d7dde6"],
    category: "system",
    size: [640, 560],
    hidden: true,
  },
  tips: {
    id: "tips",
    name: "Tips",
    names: { ubuntu: "Help" },
    glyph: Lightbulb,
    color: ["#ffd84d", "#ff9f0a"],
    category: "system",
    size: [640, 540],
    keywords: "help shortcuts keyboard guide tour",
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
  viewer: "#3b6fd6",
};
