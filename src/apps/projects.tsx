"use client";

import { ArrowSquareOut, FolderOpen, Globe, ListBullets, SquaresFour } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Heading, Page } from "@/components/kit";
import { TechIcon } from "@/components/tech-icon";
import { projects, type Project } from "@/data/portfolio";
import { useInstance, useRelaunch } from "@/hooks/use-instance";
import { launch, openExternal } from "@/lib/launch";
import { usePlatform } from "@/stores/session";
import { appName } from "./registry";

const COVERS: [string, string][] = [
  ["#ff9f6b", "#ff375f"],
  ["#5ac8fa", "#5e5ce6"],
  ["#34d399", "#0ea5e9"],
  ["#fbbf24", "#f97316"],
  ["#c084fc", "#7c3aed"],
];

export function Cover({ project, className = "" }: { project: Project; className?: string }) {
  const [a, b] = COVERS[projects.indexOf(project) % COVERS.length];
  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(60% 80% at 85% 10%, #fff 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, #000 0%, transparent 70%)",
        }}
      />
      <TechIcon name={project.tech[0]} size={44} mono className="relative drop-shadow-[0_2px_6px_rgb(0_0_0/0.25)]" />
    </div>
  );
}

function Detail({ project }: { project: Project }) {
  const platform = usePlatform();
  return (
    <Page>
      <Cover project={project} className="h-[150px] rounded-card @min-[520px]:h-[190px]" />
      <h2 className="os-display selectable mt-5">{project.name}</h2>
      <p className="selectable mt-2 text-[14.5px] leading-relaxed text-fg">{project.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="k-btn k-btn-primary" onClick={() => launch("browser", { url: project.live })}>
          <Globe size={16} />
          Open in {appName("browser", platform)}
        </button>
        <button type="button" className="k-btn" onClick={() => openExternal(project.live)}>
          <ArrowSquareOut size={16} />
          New tab
        </button>
        <button
          type="button"
          className="k-btn"
          onClick={() => launch("files", { path: `Projects/${project.name}` })}
        >
          <FolderOpen size={16} />
          Show in {appName("files", platform)}
        </button>
      </div>

      <Heading>Built with</Heading>
      <div className="flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="k-card flex items-center gap-2 px-3 py-2 text-[13px] font-medium">
            <TechIcon name={t} size={18} />
            {t}
          </span>
        ))}
      </div>

      <Heading>Live</Heading>
      <button type="button" className="k-link selectable break-all text-left text-[13.5px]" onClick={() => openExternal(project.live)}>
        {project.live}
      </button>
    </Page>
  );
}

export default function Projects() {
  const { args } = useInstance();
  const [slug, setSlug] = useState<string | null>(args.project ?? null);
  const [query, setQuery] = useState("");
  const [list, setList] = useState(false);
  useRelaunch((a) => setSlug(a.project ?? null));

  const selected = projects.find((p) => p.slug === slug) ?? null;
  const q = query.trim().toLowerCase();
  const shown = projects.filter(
    (p) => !q || `${p.name} ${p.description} ${p.tech.join(" ")}`.toLowerCase().includes(q),
  );

  if (selected) {
    return (
      <AppFrame title={selected.name} subtitle={selected.tech.join(" · ")} onBack={() => setSlug(null)}>
        <Detail project={selected} />
      </AppFrame>
    );
  }

  return (
    <AppFrame
      subtitle={`${shown.length} of ${projects.length}`}
      search={{ value: query, onChange: setQuery, placeholder: "Search projects" }}
      actions={[
        {
          id: "view",
          label: list ? "Show as grid" : "Show as list",
          icon: list ? SquaresFour : ListBullets,
          onClick: () => setList((v) => !v),
        },
      ]}
    >
      <Page wide>
        {shown.length === 0 && <p className="py-10 text-center text-[14px] text-fg2">No projects match &quot;{query}&quot;.</p>}
        {list ? (
          <div className="k-card overflow-hidden">
            {shown.map((p) => (
              <button key={p.slug} type="button" className="k-row" onClick={() => setSlug(p.slug)}>
                <Cover project={p} className="size-11 shrink-0 rounded-ctl [&_svg]:!size-5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                  <span className="block truncate text-[12.5px] text-fg2">{p.description}</span>
                </span>
                <span className="hidden shrink-0 text-[12px] text-fg3 @min-[560px]:block">{p.tech.join(" · ")}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 @min-[520px]:grid-cols-2 @min-[860px]:grid-cols-3">
            {shown.map((p) => (
              <button
                key={p.slug}
                type="button"
                className="os-project k-card group flex flex-col overflow-hidden text-left transition-transform duration-200 hover:-translate-y-0.5"
                onClick={() => setSlug(p.slug)}
              >
                <Cover project={p} className="h-[112px] w-full" />
                <span className="flex flex-1 flex-col gap-1.5 p-3.5">
                  <span className="text-[15px] font-semibold">{p.name}</span>
                  <span className="line-clamp-3 text-[12.5px] leading-relaxed text-fg2">{p.description}</span>
                  <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {p.tech.map((t) => (
                      <span key={t} className="k-tag">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Page>
    </AppFrame>
  );
}
