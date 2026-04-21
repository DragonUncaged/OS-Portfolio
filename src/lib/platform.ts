import type { Family, Form, Platform } from "@/types";

export const PLATFORM: Record<Family, Record<Form, Platform>> = {
  macos: { desktop: "macos", phone: "ios" },
  windows: { desktop: "windows", phone: "wp" },
  linux: { desktop: "ubuntu", phone: "android" },
};

export const FAMILY_LABEL: Record<Family, { desktop: string; phone: string }> = {
  macos: { desktop: "macOS", phone: "iPhone" },
  windows: { desktop: "Windows", phone: "Windows Phone" },
  linux: { desktop: "Linux", phone: "Android" },
};
