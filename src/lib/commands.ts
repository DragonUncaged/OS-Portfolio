"use client";

import { APPS, appName, launchable } from "@/apps/registry";
import { currentJob, education, experience, links, profile, projects, skillKinds, skills, strengths, type SkillKind } from "@/data/portfolio";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { AppId, Family, Platform, Theme } from "@/types";
import { span } from "./format";
import { launch, openExternal } from "./launch";
import { HOME, canonical, parsePath, resolve, sizeOf, type VDir, type VPath } from "./vfs";
import { WALLPAPERS } from "./wallpapers";

export type Tone = "dim" | "ok" | "err" | "accent" | "bold" | "warn";

export interface Span {
  t: string;
  c?: Tone;
  href?: string;
}

export type Line = Span[];

export interface ExecCtx {
  cwd: VPath;
  platform: Platform;
  history: string[];
}

export interface ExecResult {
  lines: Line[];
  cwd?: VPath;
  clear?: boolean;
  exit?: boolean;
}

const s = (t: string, c?: Tone, href?: string): Span => ({ t, c, href });
const line = (t: string, c?: Tone): Line => [s(t, c)];
const blank: Line = [s("")];
const err = (t: string): ExecResult => ({ lines: [line(t, "err")] });
const out = (...lines: Line[]): ExecResult => ({ lines });
const kv = (k: string, v: string, href?: string): Line => [s(`  ${k.padEnd(12)}`, "accent"), s(v, undefined, href)];

const isWin = (p: Platform) => p === "windows" || p === "wp";
const isMac = (p: Platform) => p === "macos" || p === "ios";

const FAMILY: Record<Platform, Family> = {
  macos: "macos",
  ios: "macos",
  windows: "windows",
  wp: "windows",
  ubuntu: "linux",
  android: "linux",
};

export function displayPath(platform: Platform, cwd: VPath, full = false): string {
  if (isWin(platform)) return ["C:", "Users", "guest", ...cwd].join("\\");
  if (!full) return ["~", ...cwd].join("/");
  return [isMac(platform) ? "/Users/guest" : "/home/guest", ...cwd].join("/");
}

export function promptOf(platform: Platform, cwd: VPath): Line {
  if (isWin(platform)) return [s(`PS ${displayPath(platform, cwd)}> `)];
  if (isMac(platform)) {
    return [s(`guest@${profile.handle}`, "ok"), s(` ${cwd[cwd.length - 1] ?? "~"} `, "accent"), s("% ")];
  }
  return [s(`guest@${profile.handle}`, "ok"), s(":"), s(displayPath(platform, cwd), "accent"), s("$ ")];
}

function shellName(platform: Platform): string {
  return isWin(platform) ? "PowerShell" : isMac(platform) ? "zsh" : "bash";
}

export function greeting(platform: Platform): Line[] {
  const first = isWin(platform)
    ? `PortfolioShell · ${profile.name}`
    : isMac(platform)
      ? `Last login: just now on ttys001, ${profile.name}'s portfolio`
      : `Welcome to ${profile.name}'s portfolio (web/x86_64)`;
  return [line(first, "dim"), [s("Type "), s("help", "accent"), s(" to look around. Tab completes, ↑ recalls.")], blank];
}

function tokenize(input: string): string[] {
  const words: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let has = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (ch === "\\" && input[i + 1] === " ") {
      cur += " ";
      i++;
    } else if (/\s/.test(ch)) {
      if (cur || has) words.push(cur);
      cur = "";
      has = false;
    } else cur += ch;
  }
  if (cur || has) words.push(cur);
  return words;
}

interface Command {
  name: string;
  usage?: string;
  about: string;
  aliases?: string[];
  secret?: boolean;
  run: (args: string[], ctx: ExecCtx, raw: string) => ExecResult;
}

const LOGO: Record<Family, string[]> = {
  macos: ["  ╭──╮      ╭──╮  ", "  │  │      │  │  ", "  ╰──┼──────┼──╯  ", "     │      │     ", "  ╭──┼──────┼──╮  ", "  │  │      │  │  ", "  ╰──╯      ╰──╯  "],
  windows: ["  ███████ ███████ ", "  ███████ ███████ ", "  ███████ ███████ ", "                  ", "  ███████ ███████ ", "  ███████ ███████ ", "  ███████ ███████ "],
  linux: ["  ╭────────────╮  ", "  │ ● ● ●      │  ", "  ├────────────┤  ", "  │ $ _        │  ", "  │            │  ", "  │            │  ", "  ╰────────────╯  "],
};

const OS_LABEL: Record<Platform, string> = {
  macos: "macOS-style desktop (web)",
  ios: "iPhone-style (web)",
  windows: "Windows-style desktop (web)",
  wp: "Windows Phone-style (web)",
  ubuntu: "Ubuntu-style desktop (web)",
  android: "Android-style (web)",
};

function listDir(d: VDir, all: boolean) {
  return d.children.filter((c) => all || !c.hidden);
}

function tree(d: VDir, prefix = ""): Line[] {
  const kids = listDir(d, false);
  return kids.flatMap((c, i) => {
    const last = i === kids.length - 1;
    const head: Line = [s(prefix + (last ? "└── " : "├── "), "dim"), s(c.name, c.type === "dir" ? "accent" : undefined)];
    return c.type === "dir" ? [head, ...tree(c, prefix + (last ? "    " : "│   "))] : [head];
  });
}

function findApp(word: string, platform: Platform): AppId | null {
  const w = word.toLowerCase();
  return (
    launchable(platform).find(
      (id) => id === w || appName(id, platform).toLowerCase() === w || APPS[id].name.toLowerCase() === w,
    ) ?? null
  );
}

function openTarget(target: string, ctx: ExecCtx): ExecResult {
  if (/^(https?:\/\/|mailto:)/i.test(target)) {
    if (target.startsWith("mailto:")) openExternal(target);
    else launch("browser", { url: target });
    return out(line(`Opening ${target}`, "ok"));
  }
  const path = canonical(parsePath(ctx.cwd, target));
  const node = path && resolve(path);
  if (path && node) {
    if (node.type === "dir") launch("files", { path: path.join("/") });
    else if (node.kind === "link" && node.href) {
      if (node.href.startsWith("mailto:")) openExternal(node.href);
      else launch("browser", { url: node.href });
    } else launch("viewer", { path: path.join("/") });
    return out(line(`Opening ${node.name}`, "ok"));
  }
  const app = findApp(target, ctx.platform);
  if (app) {
    launch(app);
    return out(line(`Opening ${appName(app, ctx.platform)}`, "ok"));
  }
  return err(`open: ${target}: no such file, folder or app`);
}

const social = (): Line[] => links.map((l) => kv(l.label.toLowerCase(), l.handle, l.href));

const COMMANDS: Command[] = [
  {
    name: "help",
    about: "list available commands",
    aliases: ["?", "commands"],
    run: () =>
      out(
        line("Portfolio", "bold"),
        ...COMMANDS.filter((c) => !c.secret && c.name !== "help").map(
          (c): Line => [s(`  ${(c.usage ?? c.name).padEnd(22)}`, "accent"), s(c.about, "dim")],
        ),
        blank,
        line("Try: cat about.md · cd Projects && ls · open live.url · neofetch · sudo hire-me", "dim"),
      ),
  },
  {
    name: "about",
    about: "who is this?",
    run: () =>
      out(
        [s(profile.name, "bold"), s(`, ${profile.role}`)],
        line(profile.location, "dim"),
        blank,
        ...profile.about.flatMap((p) => [line(p), blank]),
      ),
  },
  {
    name: "whoami",
    about: "you, and the host",
    run: () =>
      out(
        line("you: guest, a very welcome visitor"),
        line(`host: ${profile.name}, ${currentJob.role} @ ${currentJob.company}`),
      ),
  },
  {
    name: "projects",
    usage: "projects [name]",
    about: "list projects, or show one",
    run: (args) => {
      if (args.length) {
        const q = args.join(" ").toLowerCase();
        const p = projects.find((x) => x.name.toLowerCase() === q || x.slug === q);
        if (!p) return err(`projects: ${args.join(" ")}: not found`);
        return out(line(p.name, "bold"), line(p.description), kv("stack", p.tech.join(", ")), kv("live", p.live, p.live));
      }
      return out(
        ...projects.flatMap((p) => [
          [s(p.name.padEnd(20), "accent"), s(p.tech.join(" · "), "dim")] as Line,
          line(`  ${p.description}`),
          [s("  "), s(p.live, "ok", p.live)] as Line,
        ]),
      );
    },
  },
  {
    name: "skills",
    about: "technologies and strengths",
    run: () =>
      out(
        ...(Object.keys(skillKinds) as SkillKind[]).map((k) =>
          kv(skillKinds[k].toLowerCase(), skills.filter((x) => x.kind === k).map((x) => x.name).join(", ")),
        ),
        blank,
        line("strengths", "bold"),
        ...strengths.map((x) => line(`  • ${x}`)),
      ),
  },
  {
    name: "experience",
    about: "work history",
    aliases: ["jobs", "work"],
    run: () =>
      out(
        ...experience.flatMap((j) => [
          [s(j.role, "bold"), s(` @ ${j.company}`, "accent")] as Line,
          line(`  ${j.period} · ${j.location}`, "dim"),
          ...j.highlights.map((h) => line(`  • ${h}`)),
          blank,
        ]),
      ),
  },
  {
    name: "education",
    about: "where I studied",
    run: () =>
      out(...education.flatMap((e) => [line(e.institution, "bold"), line(`  ${e.degree}`), line(`  ${e.period} · ${e.location}`, "dim")])),
  },
  {
    name: "resume",
    about: "open the resume",
    aliases: ["cv"],
    run: () => {
      launch("resume");
      return out(line("Opening resume…", "ok"));
    },
  },
  {
    name: "contact",
    about: "all my links, clickable",
    aliases: ["social", "links"],
    run: () => out(line(profile.availability), blank, ...social()),
  },
  ...links.map(
    (l): Command => ({
      name: l.id === "email" ? "mail" : l.id,
      about: `print my ${l.label} link`,
      aliases: l.id === "email" ? ["email"] : undefined,
      secret: true,
      run: () => out(kv(l.label.toLowerCase(), l.handle, l.href), line("(click the link to open)", "dim")),
    }),
  ),
  {
    name: "ls",
    usage: "ls [-a] [-l] [path]",
    about: "list files",
    aliases: ["dir", "ll"],
    run: (args, ctx, raw) => {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const target = args.find((a) => !a.startsWith("-"));
      const node = resolve(target ? parsePath(ctx.cwd, target) : ctx.cwd);
      if (!node) return err(`ls: ${target}: no such file or directory`);
      if (node.type === "file") return out(line(node.name));
      const kids = listDir(node, flags.includes("a"));
      if (flags.includes("l") || raw.startsWith("ll") || raw.startsWith("dir")) {
        return out(
          ...kids.map(
            (c): Line => [
              s(c.type === "dir" ? "d" : "-", "dim"),
              s("r--r--r--  ", "dim"),
              s(sizeOf(c).padStart(9) + "  ", "dim"),
              s(c.name, c.type === "dir" ? "accent" : undefined),
            ],
          ),
        );
      }
      if (!kids.length) return out();
      return out(kids.flatMap((c, i): Span[] => [s(c.name, c.type === "dir" ? "accent" : undefined), s(i < kids.length - 1 ? "   " : "")]));
    },
  },
  {
    name: "cd",
    usage: "cd [path]",
    about: "change folder",
    aliases: ["chdir"],
    run: (args, ctx) => {
      if (!args[0]) return { lines: [], cwd: [] };
      const path = canonical(parsePath(ctx.cwd, args[0]));
      const node = path && resolve(path);
      if (!path || !node) return err(`cd: ${args[0]}: no such file or directory`);
      if (node.type !== "dir") return err(`cd: ${args[0]}: not a directory`);
      return { lines: [], cwd: path };
    },
  },
  {
    name: "pwd",
    about: "print the current folder",
    run: (_a, ctx) => out(line(displayPath(ctx.platform, ctx.cwd, true))),
  },
  {
    name: "cat",
    usage: "cat <file>",
    about: "print a file",
    aliases: ["type", "less", "more", "bat"],
    run: (args, ctx) => {
      if (!args.length) return err("usage: cat <file>");
      const lines: Line[] = [];
      for (const a of args) {
        const node = resolve(parsePath(ctx.cwd, a));
        if (!node) return err(`cat: ${a}: no such file or directory`);
        if (node.type === "dir") return err(`cat: ${a}: is a directory`);
        lines.push(...node.content.replace(/\n$/, "").split("\n").map((t) => line(t)));
      }
      return { lines };
    },
  },
  {
    name: "tree",
    usage: "tree [path]",
    about: "show the folder tree",
    run: (args, ctx) => {
      const node = resolve(args[0] ? parsePath(ctx.cwd, args[0]) : ctx.cwd);
      if (!node || node.type !== "dir") return err(`tree: ${args[0] ?? "."}: not a directory`);
      return out(line(args[0] ?? ".", "accent"), ...tree(node));
    },
  },
  {
    name: "open",
    usage: "open <file|app|url>",
    about: "open a file, folder, app or link",
    aliases: ["start", "xdg-open", "explorer"],
    run: (args, ctx) => (args.length ? openTarget(args.join(" "), ctx) : err("usage: open <file|app|url>")),
  },
  {
    name: "apps",
    about: "list installed apps",
    run: (_a, ctx) =>
      out(
        ...launchable(ctx.platform).map(
          (id): Line => [s(`  ${id.padEnd(12)}`, "accent"), s(appName(id, ctx.platform))],
        ),
        line("open one with: open <name>", "dim"),
      ),
  },
  {
    name: "neofetch",
    about: "system info, developer edition",
    aliases: ["fastfetch", "systeminfo"],
    run: (_a, ctx) => {
      const info: Line[] = [
        [s("guest", "ok"), s("@"), s(profile.handle, "ok")],
        line("─".repeat(8 + profile.handle.length), "dim"),
        [s("OS       ", "accent"), s(OS_LABEL[ctx.platform])],
        [s("Host     ", "accent"), s(`${profile.name}, ${profile.role}`)],
        [s("Uptime   ", "accent"), s(`${span(currentJob.start, null, Date.now())} at ${currentJob.company}`)],
        [s("Shell    ", "accent"), s(shellName(ctx.platform))],
        [s("Stack    ", "accent"), s(skills.slice(0, 5).map((x) => x.name.split(" ")[0]).join(", "))],
        [s("Shipped  ", "accent"), s(`${projects.length} live projects`)],
        [s("Location ", "accent"), s(profile.location)],
      ];
      const logo = LOGO[FAMILY[ctx.platform]];
      const rows = Math.max(logo.length, info.length);
      return {
        lines: Array.from({ length: rows }, (_, i): Line => [
          s(logo[i] ?? " ".repeat(logo[0].length), "accent"),
          s("  "),
          ...(info[i] ?? []),
        ]),
      };
    },
  },
  { name: "echo", usage: "echo <text>", about: "print text", run: (args) => out(line(args.join(" "))) },
  { name: "date", about: "current date and time", run: () => out(line(new Date().toString())) },
  { name: "clear", about: "clear the screen", aliases: ["cls"], run: () => ({ lines: [], clear: true }) },
  {
    name: "history",
    about: "commands typed so far",
    run: (_a, ctx) => out(...ctx.history.map((h, i) => line(`${String(i + 1).padStart(4)}  ${h}`))),
  },
  {
    name: "theme",
    usage: "theme [light|dark|auto]",
    about: "show or change the appearance",
    run: (args) => {
      const settings = useSettings.getState();
      if (!args[0]) return out(line(`theme: ${settings.theme}`));
      if (!["light", "dark", "auto"].includes(args[0])) return err("usage: theme [light|dark|auto]");
      settings.setTheme(args[0] as Theme);
      return out(line(`theme set to ${args[0]}`, "ok"));
    },
  },
  {
    name: "wallpaper",
    usage: "wallpaper [name]",
    about: "cycle or pick the wallpaper",
    run: (args, ctx) => {
      const family = FAMILY[ctx.platform];
      const list = WALLPAPERS[family];
      const settings = useSettings.getState();
      const cur = list.findIndex((w) => w.id === settings.prefs[family].wallpaper);
      const next = args[0]
        ? list.find((w) => w.id === args[0].toLowerCase() || w.name.toLowerCase() === args[0].toLowerCase())
        : list[(cur + 1) % list.length];
      if (!next) return err(`wallpaper: choose one of ${list.map((w) => w.id).join(", ")}`);
      settings.setWallpaper(family, next.id);
      return out(line(`wallpaper set to ${next.name}`, "ok"));
    },
  },
  {
    name: "notify",
    usage: "notify <text>",
    about: "send yourself a notification",
    run: (args) => {
      if (!args.length) return err("usage: notify <text>");
      useSession.getState().notify({ app: "terminal", title: "Terminal", body: args.join(" ") });
      return out(line("notification sent", "ok"));
    },
  },
  {
    name: "uname",
    about: "system name",
    aliases: ["ver"],
    secret: true,
    run: (args, ctx) =>
      out(line(args.includes("-a") ? `PortfolioOS ${profile.handle} 1.0.0 web x86_64 ${OS_LABEL[ctx.platform]}` : "PortfolioOS")),
  },
  { name: "hostname", about: "host name", secret: true, run: () => out(line(profile.handle)) },
  {
    name: "which",
    about: "locate a command",
    secret: true,
    run: (args) => {
      const c = args[0] && lookup(args[0]);
      return c ? out(line(`/usr/bin/${c.name}`)) : err(`${args[0] ?? "which"}: not found`);
    },
  },
  {
    name: "man",
    usage: "man <command>",
    about: "explain a command",
    run: (args) => {
      const c = args[0] && lookup(args[0]);
      if (!c) return err(args[0] ? `No manual entry for ${args[0]}` : "What manual page do you want?");
      return out(
        [s("NAME  ", "bold"), s(`${c.name} - ${c.about}`)],
        [s("USAGE ", "bold"), s(c.usage ?? c.name)],
        ...(c.aliases?.length ? [[s("ALSO  ", "bold"), s(c.aliases.join(", "))] as Line] : []),
      );
    },
  },
  { name: "exit", about: "close the terminal", aliases: ["quit", "logout"], run: () => ({ lines: [], exit: true }) },
  ...["mkdir", "touch", "mv", "cp", "chmod"].map(
    (name): Command => ({ name, about: "", secret: true, run: () => err(`${name}: read-only file system`) }),
  ),
  ...["vim", "vi", "nano", "emacs"].map(
    (name): Command => ({
      name,
      about: "",
      secret: true,
      run: () => out(line(`${name}: you would never get out. Try \`cat <file>\` or \`open <file>\`.`, "dim")),
    }),
  ),
  ...["ping", "curl", "wget", "ssh"].map(
    (name): Command => ({
      name,
      about: "",
      secret: true,
      run: () => out(line(`${name}: the network is sandboxed. Try \`open <url>\` instead.`, "dim")),
    }),
  ),
  ...(["snake", "mines"] as const).map(
    (id): Command => ({
      name: id,
      about: `play ${id}`,
      secret: true,
      run: () => {
        launch(id);
        return out(line(`Starting ${id}…`, "ok"));
      },
    }),
  ),
];

function lookup(name: string): Command | undefined {
  const n = name.toLowerCase();
  return COMMANDS.find((c) => c.name === n || c.aliases?.includes(n));
}

export function exec(input: string, ctx: ExecCtx): ExecResult {
  const lines: Line[] = [];
  let cwd = ctx.cwd;
  let result: ExecResult = { lines };
  for (const part of input.split(/\s*(?:&&|;)\s*/)) {
    const words = tokenize(part.trim());
    if (!words.length) continue;
    const cmd = lookup(words[0]);
    if (!cmd) {
      const app = findApp(words.join(" "), ctx.platform);
      if (app) {
        launch(app);
        lines.push(line(`Opening ${appName(app, ctx.platform)}`, "ok"));
        continue;
      }
      lines.push(
        line(
          isWin(ctx.platform)
            ? `${words[0]}: The term '${words[0]}' is not recognized. Try \`help\`.`
            : `${shellName(ctx.platform)}: command not found: ${words[0]}. Try \`help\``,
          "err",
        ),
      );
      break;
    }
    const r = cmd.run(words.slice(1), { ...ctx, cwd }, part.trim());
    if (r.clear) lines.length = 0;
    else lines.push(...r.lines);
    if (r.cwd) cwd = r.cwd;
    result = { ...result, clear: result.clear || r.clear, exit: r.exit };
    if (r.exit || r.lines.some((l) => l[0]?.c === "err")) break;
  }
  return { ...result, lines, cwd };
}

export function complete(input: string, ctx: ExecCtx): { value: string; options: string[] } {
  const none = { value: input, options: [] };
  const lead = input.match(/^(.*(?:&&|;)\s*)?(.*)$/);
  const head = lead?.[1] ?? "";
  const body = lead?.[2] ?? input;
  if (!/\s/.test(body)) {
    const names = COMMANDS.filter((c) => !c.secret || body.length > 1)
      .map((c) => c.name)
      .filter((n) => n.startsWith(body.toLowerCase()));
    if (names.length === 1) return { value: `${head}${names[0]} `, options: [] };
    return names.length ? { value: head + common(names, body), options: names } : none;
  }
  const cut = body.lastIndexOf(" ") + 1;
  const word = body.slice(cut).replace(/\\ /g, " ").replace(/^["']/, "");
  const slash = Math.max(word.lastIndexOf("/"), word.lastIndexOf("\\"));
  const base = word.slice(0, slash + 1);
  const partial = word.slice(slash + 1).toLowerCase();
  const dirNode = resolve(parsePath(ctx.cwd, base || "."));
  const names: string[] =
    dirNode?.type === "dir"
      ? listDir(dirNode, partial.startsWith(".")).filter((c) => c.name.toLowerCase().startsWith(partial)).map((c) => c.name + (c.type === "dir" ? "/" : ""))
      : [];
  if (/^(open|start|xdg-open)\s/.test(body) && !base) {
    names.push(...launchable(ctx.platform).filter((id) => id.startsWith(partial) && !names.includes(id)));
  }
  if (!names.length) return none;
  const esc = (n: string) => n.replace(/ /g, "\\ ");
  const prefix = head + body.slice(0, cut) + base;
  if (names.length === 1) return { value: prefix + esc(names[0]) + (names[0].endsWith("/") ? "" : " "), options: [] };
  return { value: prefix + esc(common(names, partial)), options: names };
}

function common(names: string[], fallback: string): string {
  let prefix = names[0];
  for (const n of names) {
    while (!n.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
  }
  return prefix.length >= fallback.length ? prefix : fallback;
}

export { HOME };
