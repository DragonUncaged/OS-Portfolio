"use client";

import { Briefcase, GraduationCap, MapPin } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Page } from "@/components/kit";
import { education, experience } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { span } from "@/lib/format";

const SECTIONS = [
  { id: "work", label: "Work", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
];

export default function Experience() {
  const [section, setSection] = useState("work");
  const now = useNow(60_000);
  return (
    <AppFrame sections={SECTIONS} section={section} onSection={setSection}>
      <Page>
        {section === "work" ? (
          <ol className="os-timeline">
            {experience.map((job) => (
              <li key={job.company} className="os-timeline-item" data-current={job.end === null}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="selectable text-[16px] font-semibold">{job.role}</h3>
                  <span className="text-[12px] tabular-nums text-fg3">{span(job.start, job.end, now)}</span>
                </div>
                <p className="selectable text-[14px] font-medium text-accent">{job.company}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-fg2">
                  <span>{job.period}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {job.location}
                  </span>
                  {job.end === null && <span className="k-tag !bg-accent-soft !text-accent">Current</span>}
                </p>
                <ul className="selectable mt-2.5 space-y-1.5 text-[13.5px] leading-relaxed">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-fg3" />
                      {h}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <div className="space-y-3">
            {education.map((e) => (
              <div key={e.institution} className="k-card flex items-start gap-3.5 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-ctl bg-accent-soft text-accent">
                  <GraduationCap size={24} weight="duotone" />
                </span>
                <div className="selectable min-w-0">
                  <h3 className="text-[16px] font-semibold">{e.institution}</h3>
                  <p className="text-[14px]">{e.degree}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-fg2">
                    <span>{e.period}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {e.location}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Page>
    </AppFrame>
  );
}
