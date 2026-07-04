"use client";

import { APPS, appName, launchable } from "@/apps/registry";
import { experience, links, projects, skills } from "@/data/portfolio";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId, Platform } from "@/types";
import { evaluate, formatNumber } from "./calc";
import { launch, openExternal } from "./launch";
import { walk } from "./vfs";

export type HitKind = "app" | "project" | "skill" | "experience" | "file" | "link" | "action" | "calc";

export interface Hit {
  id: string;
  kind: HitKind;
  title: string;
  subtitle: string;
  app: AppId;
  run: () => void;
}

export const KIND_LABEL: Record<HitKind, string> = {
  app: "Applications",
  project: "Projects",
  skill: "Skills",
  experience: "Experience",
  file: "Files",
  link: "Links",
  action: "System",
  calc: "Calculator",
};

interface Candidate extends Hit {
  extra?: string;
  weight: number;
}

function score(q: string, c: Candidate): number {
  const title = c.title.toLowerCase();
  if (title === q) return 120 + c.weight;
  if (title.startsWith(q)) return 100 + c.weight;
  if (title.split(/[\s./-]+/).some((w) => w.startsWith(q))) return 80 + c.weight;
  if (title.includes(q)) return 60 + c.weight;
  if (c.extra?.toLowerCase().includes(q)) return 40 + c.weight;
  // a file's subtitle is its folder, matching it would list the whole folder
  if (c.kind !== "file" && c.subtitle.toLowerCase().includes(q)) return 25 + c.weight;
  return 0;
}

function candidates(platform: Platform): Candidate[] {
  const session = useSession.getState();
  const settings = useSettings.getState();
  const apps: Candidate[] = launchable(platform).map((id) => ({
    id: `app:${id}`,
    kind: "app",
    title: appName(id, platform),
    subtitle: "App",
    app: id,
    extra: `${APPS[id].name} ${APPS[id].keywords ?? ""}`,
    weight: 10,
    run: () => launch(id),
  }));
  const projs: Candidate[] = projects.map((p) => ({
    id: `project:${p.slug}`,
    kind: "project",
    title: p.name,
    subtitle: p.tech.join(" · "),
    app: "projects",
    extra: p.description,
    weight: 6,
    run: () => launch("projects", { project: p.slug }),
  }));
  const skl: Candidate[] = skills.map((s) => ({
    id: `skill:${s.name}`,
    kind: "skill",
    title: s.name,
    subtitle: "Skill",
    app: "skills",
    weight: 2,
    run: () => launch("skills"),
  }));
  const jobs: Candidate[] = experience.map((j) => ({
    id: `job:${j.company}`,
    kind: "experience",
    title: j.company,
    subtitle: `${j.role} · ${j.period}`,
    app: "experience",
    extra: j.highlights.join(" "),
    weight: 4,
    run: () => launch("experience"),
  }));
  const lnk: Candidate[] = links.map((l) => ({
    id: `link:${l.id}`,
    kind: "link",
    title: l.label,
    subtitle: l.handle,
    app: "contact",
    weight: 5,
    run: () => openExternal(l.href),
  }));
  const files: Candidate[] = walk()
    .filter((e) => !e.node.hidden)
    .map((e) => ({
      id: `file:${e.path.join("/")}`,
      kind: "file",
      title: e.node.name,
      subtitle: ["~", ...e.path.slice(0, -1)].join("/"),
      app: e.node.type === "dir" ? "files" : "viewer",
      weight: 0,
      run: () => {
        if (e.node.type === "dir") launch("files", { path: e.path.join("/") });
        else if (e.node.kind === "link" && e.node.href) {
          if (e.node.href.startsWith("mailto:")) openExternal(e.node.href);
          else launch("browser", { url: e.node.href });
        } else launch("viewer", { path: e.path.join("/") });
      },
    }));
  const actions: Candidate[] = [
    {
      id: "action:dark",
      kind: "action",
      title: "Dark appearance",
      subtitle: "Switch to dark mode",
      app: "settings",
      extra: "theme night",
      weight: 3,
      run: () => settings.setTheme("dark"),
    },
    {
      id: "action:light",
      kind: "action",
      title: "Light appearance",
      subtitle: "Switch to light mode",
      app: "settings",
      extra: "theme day",
      weight: 3,
      run: () => settings.setTheme("light"),
    },
    {
      id: "action:wallpaper",
      kind: "action",
      title: "Change wallpaper",
      subtitle: "Open wallpaper settings",
      app: "settings",
      extra: "background desktop",
      weight: 3,
      run: () => launch("settings", { section: "wallpaper" }),
    },
    {
      id: "action:lock",
      kind: "action",
      title: "Lock screen",
      subtitle: "Lock this session",
      app: "settings",
      weight: 3,
      run: () => session.power("lock"),
    },
    {
      id: "action:restart",
      kind: "action",
      title: "Restart",
      subtitle: "Reboot and choose another operating system",
      app: "settings",
      extra: "reboot switch os boot picker",
      weight: 3,
      run: () => session.power("restart"),
    },
    {
      id: "action:shutdown",
      kind: "action",
      title: "Shut down",
      subtitle: "Power off",
      app: "settings",
      extra: "power off",
      weight: 3,
      run: () => session.power("shutdown"),
    },
  ];
  return [...apps, ...projs, ...jobs, ...skl, ...lnk, ...actions, ...files];
}

export function search(query: string, platform: Platform, limit = 9): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: Hit[] = [];
  if (/[+\-*/^%×÷]/.test(q) || /^\(?\d/.test(q)) {
    const value = /\d\s*[+\-*/^%×÷(]/.test(q) ? evaluate(q) : null;
    if (value !== null) {
      const text = formatNumber(value);
      hits.push({
        id: "calc",
        kind: "calc",
        title: text,
        subtitle: `${query.trim()} =`,
        app: "calculator",
        run: () => launch("calculator"),
      });
    }
  }
  const ranked = candidates(platform)
    .map((c) => ({ c, s: score(q, c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit - hits.length)
    .map((x) => x.c);
  return [...hits, ...ranked];
}

export function grouped(hits: Hit[]): { kind: HitKind; hits: Hit[] }[] {
  const groups: { kind: HitKind; hits: Hit[] }[] = [];
  for (const h of hits) {
    const g = groups.find((x) => x.kind === h.kind);
    if (g) g.hits.push(h);
    else groups.push({ kind: h.kind, hits: [h] });
  }
  return groups;
}
