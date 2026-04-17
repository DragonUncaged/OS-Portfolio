export type SkillKind = "language" | "frontend" | "backend" | "data" | "tooling";

export interface Skill {
  name: string;
  icon: string;
  kind: SkillKind;
}

export interface SocialLink {
  id: "email" | "github" | "linkedin" | "codechef";
  label: string;
  handle: string;
  href: string;
  embed: false;
}

export const profile = {
  name: "Ankit Rao",
  firstName: "Ankit",
  initials: "AR",
  handle: "dragonuncaged",
  role: "Full Stack Developer",
  tagline: "I build things for the web",
  email: "emailforreal.ankit@gmail.com",
  location: "Gurugram, Haryana, India",
  about: [
    "Hi! I'm Ankit, a full stack developer who enjoys turning ideas into fast, polished web applications. I work across the stack — from designing REST APIs and data models to crafting pixel-perfect, accessible UIs.",
    "Currently I'm a Full Stack Developer at Even Healthcare, building scalable applications with Next.js and Go. Before that I completed my B.Tech in Computer Science at Chandigarh University.",
    "When I'm not shipping features, you'll find me solving problems on CodeChef or experimenting with new tools.",
  ],
  availability:
    "I'm currently open to new opportunities — full stack roles, interesting freelance work, or just a good conversation.",
  responseTime: "usually < 24h",
} as const;

export const links: SocialLink[] = [
  {
    id: "email",
    label: "Email",
    handle: profile.email,
    href: `mailto:${profile.email}`,
    embed: false,
  },
  {
    id: "github",
    label: "GitHub",
    handle: "github.com/DragonUncaged",
    href: "https://github.com/DragonUncaged",
    embed: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "linkedin.com/in/ankitrao",
    href: "https://www.linkedin.com/in/ankitrao",
    embed: false,
  },
  {
    id: "codechef",
    label: "CodeChef",
    handle: "codechef.com/users/dragonuncaged",
    href: "https://www.codechef.com/users/dragonuncaged",
    embed: false,
  },
];

export const skills: Skill[] = [
  { name: "JavaScript (ES6+)", icon: "javascript", kind: "language" },
  { name: "TypeScript", icon: "typescript", kind: "language" },
  { name: "React", icon: "react", kind: "frontend" },
  { name: "Next.js", icon: "nextjs", kind: "frontend" },
  { name: "Node.js", icon: "nodejs", kind: "backend" },
  { name: "Redux", icon: "redux", kind: "frontend" },
  { name: "Tailwind CSS", icon: "tailwind", kind: "frontend" },
  { name: "Python", icon: "python", kind: "language" },
  { name: "SQL", icon: "sql", kind: "language" },
  { name: "MongoDB", icon: "mongodb", kind: "data" },
  { name: "Firebase", icon: "firebase", kind: "data" },
  { name: "Docker", icon: "docker", kind: "tooling" },
  { name: "Go", icon: "go", kind: "language" },
];

export const skillKinds: Record<SkillKind, string> = {
  language: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  tooling: "Tooling",
};

export const strengths: string[] = [
  "React, Node.js, Express.js",
  "REST API design & integration",
  "Git, VS Code & modern tooling",
  "Software development lifecycle",
];
