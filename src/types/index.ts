export type Family = "macos" | "windows" | "linux";

export type Form = "desktop" | "phone";

export type Platform = "macos" | "windows" | "ubuntu" | "ios" | "wp" | "android";

export type Theme = "light" | "dark" | "auto";

export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "resume"
  | "contact"
  | "terminal"
  | "files"
  | "browser"
  | "settings"
  | "notes"
  | "calculator"
  | "calendar"
  | "clock"
  | "music"
  | "photos"
  | "paint"
  | "mines"
  | "snake"
  | "monitor"
  | "viewer"
  | "tips";

export interface AppArgs {
  path?: string;
  url?: string;
  project?: string;
  section?: string;
  nonce?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PowerAction = "restart" | "shutdown" | "lock" | "logout";
