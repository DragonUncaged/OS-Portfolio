"use client";

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const APP_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  about: lazy(() => import("./about")),
  projects: lazy(() => import("./projects")),
  experience: lazy(() => import("./experience")),
  skills: lazy(() => import("./skills")),
  resume: lazy(() => import("./resume")),
};
