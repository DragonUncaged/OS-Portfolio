import { APPS, appName, launchable } from "@/apps/registry";
import { currentJob, education, experience, links, profile, projects, skillKinds, skills, type SkillKind } from "@/data/portfolio";
import { evaluate, formatNumber } from "@/lib/calc";
import { dateLong, time12m } from "@/lib/format";
import { launch, openExternal } from "@/lib/launch";
import { search } from "@/lib/search";
import { useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";

export interface SiriAction {
  label: string;
  run: () => void;
}

export interface SiriReply {
  text: string[];
  points?: string[];
  actions?: SiriAction[];
}

export const SIRI_SUGGESTIONS = [
  `Who is ${profile.firstName}?`,
  `What has ${profile.firstName} built?`,
  "What is the tech stack?",
  "How do I get in touch?",
];

const open = (label: string, run: () => void): SiriAction => ({ label, run });

const link = (id: (typeof links)[number]["id"]) => links.find((l) => l.id === id);

function skillsByKind(): string[] {
  return (Object.keys(skillKinds) as SkillKind[])
    .map((kind) => {
      const names = skills.filter((s) => s.kind === kind).map((s) => s.name);
      return names.length ? `${skillKinds[kind]}: ${names.join(", ")}` : "";
    })
    .filter(Boolean);
}

export function askSiri(question: string): SiriReply {
  const raw = question.trim();
  const q = raw.toLowerCase().replace(/[?!.]+$/g, "");
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const first = profile.firstName;

  if (!q) return { text: [`Ask me about ${first}'s projects, experience, skills, or how to get in touch.`] };

  if (/\d\s*[+\-*/^%×÷(]/.test(q)) {
    const value = evaluate(q.replace(/^(what is|what's|calculate)\s+/, ""));
    if (value !== null) return { text: [`${formatNumber(value)}`], actions: [open("Open Calculator", () => launch("calculator"))] };
  }

  const verb = q.match(/^(?:open|launch|start|show(?: me)?)\s+(?:the\s+)?(.+)$/);
  if (verb) {
    const wanted = verb[1].trim();
    const app = launchable("macos").find((id) => {
      const names = [appName(id, "macos"), APPS[id].name].map((n) => n.toLowerCase());
      return names.some((n) => n === wanted || n.startsWith(wanted) || wanted.startsWith(n));
    });
    if (app) {
      launch(app);
      return { text: [`Opening ${appName(app, "macos")}.`] };
    }
  }

  if (has("dark mode", "dark appearance", "go dark")) {
    useSettings.getState().setTheme("dark");
    return { text: ["Dark appearance is on."], actions: [open("Appearance settings", () => launch("settings", { section: "appearance" }))] };
  }
  if (has("light mode", "light appearance")) {
    useSettings.getState().setTheme("light");
    return { text: ["Light appearance is on."], actions: [open("Appearance settings", () => launch("settings", { section: "appearance" }))] };
  }
  if (has("wallpaper", "desktop picture")) {
    return { text: ["Wallpapers live in System Settings. Each one is drawn in code."], actions: [open("Wallpaper settings", () => launch("settings", { section: "wallpaper" }))] };
  }
  if (/\block\b/.test(q)) {
    return { text: ["I can lock this Mac for you."], actions: [open("Lock Screen", () => useSession.getState().power("lock"))] };
  }
  if (has("restart", "reboot", "another system", "windows", "linux", "ubuntu")) {
    return {
      text: ["Restarting takes you back to the startup manager, where you can boot Windows or Linux instead."],
      actions: [open("Restart…", () => useSession.getState().power("restart"))],
    };
  }

  if (/\b(what time|the time|what day|the date|today)\b/.test(q)) {
    const now = Date.now();
    return { text: [`It's ${time12m(now)} on ${dateLong(now)}.`], actions: [open("Open Calendar", () => launch("calendar"))] };
  }

  const project = projects.find((p) => q.includes(p.name.toLowerCase()) || q.includes(p.slug.replace(/-/g, " ")));
  if (project) {
    return {
      text: [project.description],
      points: [`Built with ${project.tech.join(", ")}`],
      actions: [
        open("Show in Projects", () => launch("projects", { project: project.slug })),
        open("Open the live site", () => (project.embed ? launch("browser", { url: project.live }) : openExternal(project.live))),
      ],
    };
  }

  if (has("project", "built", "build", "made", "portfolio", "work on")) {
    return {
      text: [`${first} has ${projects.length} live projects on this Mac:`],
      points: projects.map((p) => `${p.name}: ${p.description}`),
      actions: [open("Open Projects", () => launch("projects"))],
    };
  }

  if (has("contact", "email", "e-mail", "reach", "touch", "hire", "available", "availability", "message", "talk")) {
    const mail = link("email");
    return {
      text: [profile.availability, `The quickest way is email: ${profile.email} (${profile.responseTime}).`],
      actions: [
        open("Open Contact", () => launch("contact")),
        ...(mail ? [open("Write an email", () => openExternal(mail.href))] : []),
      ],
    };
  }

  for (const id of ["github", "linkedin", "codechef"] as const) {
    const l = link(id);
    if (l && q.includes(id)) {
      return { text: [`${first} is on ${l.label} at ${l.handle}.`], actions: [open(`Open ${l.label}`, () => openExternal(l.href))] };
    }
  }

  if (has("resume", "résumé", "cv")) {
    return {
      text: [`${first}'s resume is on this Mac. You can print it or save it as a PDF from the Resume app.`],
      actions: [open("Open Resume", () => launch("resume"))],
    };
  }

  if (has("education", "study", "studied", "university", "college", "degree", "school", "graduate")) {
    return {
      text: education.map((s) => `${s.degree} at ${s.institution}, ${s.period} (${s.location}).`),
      actions: [open("Open Experience", () => launch("experience"))],
    };
  }

  if (has("experience", "job", "career", "company", "employer", "worked", "work at", "works at", "working", "current role", "currently")) {
    return {
      text: [`${first} is a ${currentJob.role} at ${currentJob.company} (${currentJob.period}).`],
      points: experience.filter((j) => j !== currentJob).map((j) => `${j.role}, ${j.company}, ${j.period}`),
      actions: [open("Open Experience", () => launch("experience"))],
    };
  }

  const skill = skills.find((s) => {
    const name = s.name.toLowerCase().replace(/\s*\(.*\)$/, "");
    return new RegExp(`(^|[^a-z])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(q);
  });
  if (skill && !has("stack", "skills")) {
    return {
      text: [`Yes, ${skill.name} is part of ${first}'s stack, under ${skillKinds[skill.kind].toLowerCase()}.`],
      actions: [open("Open Skills", () => launch("skills"))],
    };
  }

  if (has("skill", "stack", "tech", "language", "framework", "tools", "know", "good at")) {
    return { text: [`${first} works across the stack:`], points: skillsByKind(), actions: [open("Open Skills", () => launch("skills"))] };
  }

  if (has("where", "location", "based", "city", "country")) {
    return {
      text: [`${first} doesn't list a location on this site. The best way to reach ${first} is through Contact.`],
      actions: [open("Open Contact", () => launch("contact"))],
    };
  }

  if (has("who", "about", first.toLowerCase(), "yourself", "owner", "this site", "this mac", "introduce")) {
    return {
      text: [profile.about[0], `${first} is a ${profile.role}.`],
      actions: [open("Open About Me", () => launch("about")), open("See projects", () => launch("projects"))],
    };
  }

  if (/^(hi|hey|hello|yo|hola|namaste)\b/.test(q) || has("what can you do", "help")) {
    return {
      text: [
        `Hi! I can tell you about ${first}: projects, experience, skills, education and how to get in touch.`,
        "I can also open apps, switch the appearance, and do sums.",
      ],
    };
  }

  const hits = search(raw, "macos", 3);
  if (hits.length) {
    return {
      text: ["I don't have an answer for that, but this is what I found on this Mac:"],
      actions: hits.map((h) => open(h.title, h.run)),
    };
  }
  return {
    text: [`I can only answer from what is on this Mac. That covers ${first}'s projects, experience, skills and contact details.`],
  };
}

export function looksLikeQuestion(query: string): boolean {
  const q = query.trim().toLowerCase();
  return /\?$/.test(q) || /^(who|what|where|when|why|how|does|do|is|can|tell|show me|open|launch)\b/.test(q);
}
