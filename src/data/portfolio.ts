export type SkillKind = "language" | "frontend" | "backend" | "data" | "tooling";

export interface Skill {
  name: string;
  icon: string;
  kind: SkillKind;
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  tech: string[];
  live: string;
  embed: boolean;
  language: "js" | "ts" | "py";
}

export interface Job {
  company: string;
  role: string;
  period: string;
  start: string;
  end: string | null;
  location: string;
  highlights: string[];
}

export interface School {
  institution: string;
  degree: string;
  period: string;
  location: string;
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

export const projects: Project[] = [
  {
    slug: "codespace",
    name: "CodeSpace",
    description:
      "A collaborative online code editor with live preview — write HTML, CSS and JS and see the result instantly.",
    tech: ["React", "JavaScript", "CSS"],
    live: "https://code-two-theta.vercel.app/",
    embed: true,
    language: "js",
  },
  {
    slug: "draw",
    name: "Draw",
    description:
      "A real-time collaborative whiteboard. Sketch, diagram and brainstorm together from any device.",
    tech: ["JavaScript", "Canvas", "WebSockets"],
    live: "https://draw-zooi.onrender.com/",
    embed: true,
    language: "js",
  },
  {
    slug: "chat-app",
    name: "Chat App",
    description: "A real-time chat application with rooms, presence and message history.",
    tech: ["TypeScript", "React", "Firebase"],
    live: "https://chat-app-ca.netlify.app/",
    embed: true,
    language: "ts",
  },
  {
    slug: "document-chatbot",
    name: "Document Chatbot",
    description:
      "A GenAI chatbot that answers questions about your documents using retrieval-augmented generation.",
    tech: ["Python", "LangChain", "Streamlit"],
    live: "https://genai-chatbot-ctk7vcbjwwvekridgy6kgg.streamlit.app/",
    embed: false,
    language: "py",
  },
];

export const experience: Job[] = [
  {
    company: "Even Healthcare",
    role: "Full Stack Developer",
    period: "Feb 2025 — Present",
    start: "2025-02",
    end: null,
    location: "Gurugram, Haryana",
    highlights: [
      "Building scalable full-stack applications with Next.js and Go.",
      "Designing backend services and REST APIs.",
      "Collaborating with cross-functional teams in a fast-paced startup environment.",
    ],
  },
  {
    company: "Startup",
    role: "Full Stack Developer",
    period: "Nov 2024 — Jan 2025",
    start: "2024-11",
    end: "2025-01",
    location: "Remote",
    highlights: [
      "Developed backend services using Python and FastAPI.",
      "Built responsive frontend interfaces with React.",
      "Implemented RESTful APIs and database designs.",
    ],
  },
  {
    company: "Internshala",
    role: "Full Stack Developer",
    period: "Apr 2024 — Oct 2024",
    start: "2024-04",
    end: "2024-10",
    location: "Gurugram, Haryana",
    highlights: [
      "Built and shipped full-stack web applications end to end.",
      "Designed web applications ensuring optimal performance and user experience.",
      "Worked with React, Node.js and REST APIs in production.",
    ],
  },
];

export const education: School[] = [
  {
    institution: "Chandigarh University",
    degree: "B.Tech, Computer Science & Engineering",
    period: "Aug 2020 — Jul 2024",
    location: "Mohali, Punjab",
  },
];

export const previousPortfolio = {
  name: "IDE Portfolio",
  description: "The previous portfolio, a VS Code-style IDE that runs code in the browser.",
  live: "https://dragonuncaged.github.io/",
  repo: "https://github.com/DragonUncaged/dragonuncaged.github.io",
} as const;

export const site = {
  title: `${profile.name}, ${profile.role}`,
  description: `${profile.name}, ${profile.role}. ${profile.tagline}. An operating-system style portfolio: boot macOS, Windows or Linux and explore projects, experience and skills as apps.`,
  shortName: profile.name,
} as const;

export const currentJob = experience.find((j) => j.end === null) ?? experience[0];
