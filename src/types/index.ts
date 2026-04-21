export type Family = "macos" | "windows" | "linux";

export type Form = "desktop" | "phone";

export type Platform = "macos" | "windows" | "ubuntu" | "ios" | "wp" | "android";

export type Theme = "light" | "dark" | "auto";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PowerAction = "restart" | "shutdown" | "lock" | "logout";
