"use client";

import { DownloadSimple, EnvelopeSimple, Printer } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { AppFrame } from "@/components/app-frame";
import { education, experience, links, profile, projects, skills, strengths } from "@/data/portfolio";
import { launch } from "@/lib/launch";
import { resumeMd } from "@/lib/vfs";

function ResumeDoc() {
  return (
    <article className="resume-doc selectable">
      <header>
        <h1>{profile.name}</h1>
        <p className="resume-role">
          {profile.role} · {profile.location}
        </p>
        <p className="resume-links">
          {links.map((l) => (
            <a key={l.id} href={l.href} target={l.id === "email" ? undefined : "_blank"} rel="noreferrer">
              {l.handle}
            </a>
          ))}
        </p>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{profile.about[0]}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {experience.map((j) => (
          <div key={j.company} className="resume-item">
            <div className="resume-row">
              <h3>
                {j.role}, {j.company}
              </h3>
              <span>{j.period}</span>
            </div>
            <p className="resume-meta">{j.location}</p>
            <ul>
              {j.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((p) => (
          <div key={p.slug} className="resume-item">
            <div className="resume-row">
              <h3>{p.name}</h3>
              <span>{p.tech.join(" · ")}</span>
            </div>
            <p>
              {p.description}{" "}
              <a href={p.live} target="_blank" rel="noreferrer">
                {p.live.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {education.map((e) => (
          <div key={e.institution} className="resume-item">
            <div className="resume-row">
              <h3>{e.degree}</h3>
              <span>{e.period}</span>
            </div>
            <p className="resume-meta">
              {e.institution} · {e.location}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        <p>{skills.map((s) => s.name).join(" · ")}</p>
        <ul>
          {strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function download() {
  const url = URL.createObjectURL(new Blob([resumeMd], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.name.replace(/\s+/g, "-")}-Resume.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Resume() {
  return (
    <AppFrame
      title={`${profile.name}'s resume`}
      actions={[
        { id: "print", label: "Print / Save as PDF", icon: Printer, onClick: () => window.print() },
        { id: "download", label: "Download Markdown", icon: DownloadSimple, onClick: download },
        { id: "contact", label: "Contact", icon: EnvelopeSimple, onClick: () => launch("contact") },
      ]}
    >
      <div className="resume-desk min-h-full px-3 py-4 @min-[560px]:px-8 @min-[560px]:py-8">
        <ResumeDoc />
      </div>
      {/* the copy that prints, outside the shell */}
      {createPortal(
        <div className="print-only">
          <ResumeDoc />
        </div>,
        document.body,
      )}
    </AppFrame>
  );
}
