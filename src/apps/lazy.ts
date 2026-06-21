"use client";

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const APP_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  about: lazy(() => import("./about")),
  projects: lazy(() => import("./projects")),
  experience: lazy(() => import("./experience")),
  skills: lazy(() => import("./skills")),
  resume: lazy(() => import("./resume")),
  contact: lazy(() => import("./contact")),
  terminal: lazy(() => import("./terminal")),
  files: lazy(() => import("./files")),
  browser: lazy(() => import("./browser")),
  settings: lazy(() => import("./settings")),
  notes: lazy(() => import("./notes")),
  calculator: lazy(() => import("./calculator")),
  calendar: lazy(() => import("./calendar")),
  clock: lazy(() => import("./clock")),
  music: lazy(() => import("./music")),
  photos: lazy(() => import("./photos")),
  viewer: lazy(() => import("./viewer")),
};
