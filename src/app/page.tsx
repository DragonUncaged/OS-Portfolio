import { education, experience, links, profile, projects, skills } from "@/data/portfolio";

export default function Page() {
  return (
    <>
      <main id="plain" className="sr-only">
        <h1>{profile.name}</h1>
        <p>
          {profile.role} · {profile.location}
        </p>
        {profile.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              <a href={p.live}>{p.name}</a>: {p.description} ({p.tech.join(", ")})
            </li>
          ))}
        </ul>
        <h2>Experience</h2>
        <ul>
          {experience.map((j) => (
            <li key={j.company}>
              {j.role}, {j.company} ({j.period}, {j.location}). {j.highlights.join(" ")}
            </li>
          ))}
        </ul>
        <h2>Education</h2>
        <ul>
          {education.map((e) => (
            <li key={e.institution}>
              {e.degree}, {e.institution} ({e.period})
            </li>
          ))}
        </ul>
        <h2>Skills</h2>
        <p>{skills.map((s) => s.name).join(", ")}</p>
        <h2>Contact</h2>
        <ul>
          {links.map((l) => (
            <li key={l.id}>
              <a href={l.href}>
                {l.label}: {l.handle}
              </a>
            </li>
          ))}
        </ul>
      </main>
      <noscript>
        <style>{`#plain{position:static;width:auto;height:auto;margin:0;padding:24px;clip:auto;overflow:auto;white-space:normal;display:block;max-height:100vh;font:16px/1.6 system-ui,sans-serif;color:#eee}#plain a{color:#8ab4ff}`}</style>
      </noscript>
    </>
  );
}
