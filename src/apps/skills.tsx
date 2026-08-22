"use client";

import { BracketsCurly, Database, Layout, Lightning, SquaresFour, Wrench, HardDrives } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Heading, Page } from "@/components/kit";
import { TechIcon } from "@/components/tech-icon";
import { skillKinds, skills, strengths, type SkillKind } from "@/data/portfolio";

const KIND_ICON = {
  language: BracketsCurly,
  frontend: Layout,
  backend: HardDrives,
  data: Database,
  tooling: Wrench,
} as const;

const SECTIONS = [
  { id: "all", label: "All", icon: SquaresFour },
  ...(Object.keys(skillKinds) as SkillKind[]).map((k) => ({ id: k, label: skillKinds[k], icon: KIND_ICON[k] })),
];

export default function Skills() {
  const [section, setSection] = useState("all");
  const shown = section === "all" ? skills : skills.filter((s) => s.kind === section);
  return (
    <AppFrame
      sections={SECTIONS}
      section={section}
      onSection={setSection}
      subtitle={`${shown.length} ${shown.length === 1 ? "technology" : "technologies"}`}
    >
      <Page>
        <div className="grid grid-cols-2 gap-2.5 @min-[460px]:grid-cols-3 @min-[700px]:grid-cols-4">
          {shown.map((s) => (
            <div key={s.name} className="os-tile k-card flex flex-col items-start gap-3 p-3.5">
              <TechIcon name={s.icon} size={30} />
              <div className="min-w-0">
                <div className="selectable text-[13.5px] font-semibold leading-tight">{s.name}</div>
                <div className="text-[11.5px] text-fg3">{skillKinds[s.kind]}</div>
              </div>
            </div>
          ))}
        </div>
        {section === "all" && (
          <>
            <Heading>Strengths</Heading>
            <div className="k-card overflow-hidden">
              {strengths.map((s) => (
                <div key={s} className="k-row">
                  <Lightning size={17} weight="fill" className="shrink-0 text-accent" />
                  <span className="selectable text-[13.5px]">{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Page>
    </AppFrame>
  );
}
