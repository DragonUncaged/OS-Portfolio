"use client";

import { Briefcase, GraduationCap, Handshake, MapPin, RocketLaunch, Timer } from "@phosphor-icons/react";
import { AppFrame } from "@/components/app-frame";
import { Avatar, Fact, Heading, Page } from "@/components/kit";
import { currentJob, education, profile, projects } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { span } from "@/lib/format";
import { launch } from "@/lib/launch";

export default function About() {
  const now = useNow(60_000);
  const school = education[0];
  return (
    <AppFrame>
      <Page>
        <div className="flex flex-col items-start gap-4 @min-[460px]:flex-row @min-[460px]:items-center">
          <Avatar size={88} />
          <div className="min-w-0">
            <h1 className="os-display selectable">{profile.name}</h1>
            <p className="selectable mt-0.5 text-[15px] text-fg2">
              {profile.role} · @{profile.handle}
            </p>
            <p className="selectable mt-1 text-[14px] text-accent">{profile.tagline}.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="k-btn k-btn-primary" onClick={() => launch("projects")}>
            See my projects
          </button>
          <button type="button" className="k-btn" onClick={() => launch("resume")}>
            Resume
          </button>
          <button type="button" className="k-btn" onClick={() => launch("contact")}>
            Get in touch
          </button>
        </div>

        <Heading>About</Heading>
        <div className="selectable space-y-3 text-[14px] leading-relaxed text-fg">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <Heading>At a glance</Heading>
        <div className="k-card overflow-hidden">
          <Fact icon={Briefcase} label="Now">
            {currentJob.role} at {currentJob.company}
          </Fact>
          <Fact icon={Timer} label="Since">
            {currentJob.period.split(" — ")[0]} · {span(currentJob.start, null, now)}
          </Fact>
          <Fact icon={MapPin} label="Based in">
            {profile.location}
          </Fact>
          <Fact icon={GraduationCap} label="Studied">
            {school.degree}, {school.institution}
          </Fact>
          <Fact icon={RocketLaunch} label="Shipped">
            {projects.length} live projects
          </Fact>
          <Fact icon={Handshake} label="Status">
            {profile.availability}
          </Fact>
        </div>
      </Page>
    </AppFrame>
  );
}
