import { education, experience, links, previousPortfolio, profile, projects, skillKinds, skills, strengths, type SkillKind } from "@/data/portfolio";

export type FileKind = "markdown" | "text" | "json" | "link";

export interface VFile {
  type: "file";
  name: string;
  kind: FileKind;
  content: string;
  href?: string;
  hidden?: boolean;
}

export interface VDir {
  type: "dir";
  name: string;
  children: VNode[];
  hidden?: boolean;
}

export type VNode = VFile | VDir;

const file = (name: string, kind: FileKind, content: string, extra: Partial<VFile> = {}): VFile => ({
  type: "file",
  name,
  kind,
  content,
  ...extra,
});

const dir = (name: string, children: VNode[]): VDir => ({ type: "dir", name, children });

const link = (name: string, href: string): VFile =>
  file(`${name}.url`, "link", `[InternetShortcut]\nURL=${href}\n`, { href });

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const aboutMd = [
  `# ${profile.name}`,
  `${profile.role} · ${profile.location}`,
  "",
  `> ${profile.tagline}`,
  "",
  ...profile.about.flatMap((p) => [p, ""]),
  "## Find me",
  ...links.map((l) => `- ${l.label}: ${l.href.replace("mailto:", "")}`),
].join("\n");

export const resumeMd = [
  `# ${profile.name}`,
  `${profile.role} · ${profile.location}`,
  links.map((l) => l.handle).join(" · "),
  "",
  "## Experience",
  ...experience.flatMap((j) => [
    `### ${j.role}, ${j.company}`,
    [j.period, j.location].filter(Boolean).join(" · "),
    ...j.highlights.map((h) => `- ${h}`),
    "",
  ]),
  "## Education",
  ...education.flatMap((e) => [`### ${e.degree}`, `${e.institution} · ${e.period} · ${e.location}`, ""]),
  "## Skills",
  skills.map((s) => s.name).join(", "),
  "",
  "## Strengths",
  ...strengths.map((s) => `- ${s}`),
  "",
  "## Projects",
  ...projects.map((p) => `- ${p.name}: ${p.description} (${p.live})`),
].join("\n");

const skillsJson = JSON.stringify(
  {
    ...Object.fromEntries(
      (Object.keys(skillKinds) as SkillKind[]).map((k) => [
        skillKinds[k].toLowerCase(),
        skills.filter((s) => s.kind === k).map((s) => s.name),
      ]),
    ),
    strengths,
  },
  null,
  2,
);

const contactMd = [
  "# Contact",
  "",
  profile.availability,
  "",
  `Response time: ${profile.responseTime}`,
  "",
  ...links.map((l) => `- ${l.label}: ${l.href.replace("mailto:", "")}`),
].join("\n");

export const DRAGON_ART = String.raw`
   ~~~ ___/\_______/\_______/\_______/\__
  ~~~ <                               o  \__,
   ~~~ \___  ______  ______  ______  ____ __/  ~ ~ ~
           \/      \/      \/      \/

   the dragon is uncaged.  (try: dragon)
`;

export const HOME: VDir = dir("~", [
  file("about.md", "markdown", aboutMd),
  file("resume.md", "markdown", resumeMd),
  file("skills.json", "json", skillsJson),
  file("contact.md", "markdown", contactMd),
  dir(
    "Projects",
    projects.map((p) =>
      dir(p.name, [
        file(
          "README.md",
          "markdown",
          [`# ${p.name}`, "", p.description, "", "## Stack", ...p.tech.map((t) => `- ${t}`), "", "## Live", p.live].join(
            "\n",
          ),
        ),
        file("stack.txt", "text", p.tech.join("\n") + "\n"),
        link("live", p.live),
      ]),
    ),
  ),
  dir(
    "Experience",
    experience.map((j) =>
      file(
        `${slug(j.company)}.md`,
        "markdown",
        [`# ${j.company}`, [j.role, j.period, j.location].filter(Boolean).join(" · "), "", ...j.highlights.map((h) => `- ${h}`)].join(
          "\n",
        ),
      ),
    ),
  ),
  dir(
    "Education",
    education.map((e) =>
      file(
        `${slug(e.institution)}.md`,
        "markdown",
        [`# ${e.institution}`, e.degree, `${e.period} · ${e.location}`].join("\n"),
      ),
    ),
  ),
  dir("Links", [
    ...links.map((l) => link(l.label, l.href)),
    link(previousPortfolio.name, previousPortfolio.live),
  ]),
  file(".dragon", "text", DRAGON_ART, { hidden: true }),
]);

export type VPath = string[];

export function resolve(path: VPath): VNode | null {
  let node: VNode = HOME;
  for (const part of path) {
    if (node.type !== "dir") return null;
    const next: VNode | undefined = node.children.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!next) return null;
    node = next;
  }
  return node;
}

export function canonical(path: VPath): VPath | null {
  const out: VPath = [];
  let node: VNode = HOME;
  for (const part of path) {
    if (node.type !== "dir") return null;
    const next: VNode | undefined = node.children.find((c) => c.name.toLowerCase() === part.toLowerCase());
    if (!next) return null;
    out.push(next.name);
    node = next;
  }
  return out;
}

export function parsePath(cwd: VPath, input: string): VPath {
  const raw = input.replace(/\\/g, "/").replace(/^[a-zA-Z]:/, "");
  const absolute = raw.startsWith("/") || raw.startsWith("~");
  const out = absolute ? [] : [...cwd];
  for (const part of raw.replace(/^~/, "").split("/")) {
    if (!part || part === ".") continue;
    // /home/guest and /Users/guest are the home folder
    if (absolute && out.length === 0 && /^(home|users|guest)$/i.test(part)) continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}

export interface Entry {
  path: VPath;
  node: VNode;
}

export function walk(start: VDir = HOME, base: VPath = []): Entry[] {
  return start.children.flatMap((node) => {
    const path = [...base, node.name];
    return node.type === "dir" ? [{ path, node }, ...walk(node, path)] : [{ path, node }];
  });
}

export const pathFromKey = (key: string): VPath => (key ? key.split("/") : []);

export function sizeOf(node: VNode): string {
  if (node.type === "dir") return `${node.children.filter((c) => !c.hidden).length} items`;
  const bytes = new TextEncoder().encode(node.content).length;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

export function kindLabel(node: VNode): string {
  if (node.type === "dir") return "Folder";
  return { markdown: "Markdown document", text: "Plain text", json: "JSON document", link: "Web link" }[node.kind];
}
