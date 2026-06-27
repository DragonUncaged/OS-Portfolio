"use client";

import { Egg, Info, Keyboard } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Heading, Page } from "@/components/kit";
import { profile } from "@/data/portfolio";
import { launch } from "@/lib/launch";
import { FAMILY_LABEL } from "@/lib/platform";
import { SHORTCUTS } from "@/lib/shortcuts";
import { usePlatform, useSession } from "@/stores/session";
import { appName } from "./registry";

const EGGS = [
  { title: "Ask nicely", body: "In the terminal, try: sudo hire-me" },
  { title: "Hidden file", body: "The home folder has a file that only shows with: ls -a" },
  { title: "Uncage the dragon", body: "Type dragon in the terminal, or enter the classic ↑↑↓↓←→←→BA code anywhere." },
  { title: "Do not do this", body: "Whatever you do, never run: rm -rf /" },
  { title: "It is all one machine", body: "Resize the browser and each desktop turns into its phone, live." },
];

export default function Tips() {
  const platform = usePlatform();
  const phone = useSession((s) => s.form === "phone");
  const family = useSession((s) => s.family ?? "macos");
  const [section, setSection] = useState("shortcuts");
  const sections = [
    { id: "shortcuts", label: phone ? "Gestures" : "Shortcuts", icon: Keyboard },
    { id: "eggs", label: "Easter eggs", icon: Egg },
    { id: "about", label: "About", icon: Info },
  ];
  return (
    <AppFrame sections={sections} section={section} onSection={setSection}>
      <Page>
        {section === "shortcuts" && (
          <>
            <Heading>{phone ? "Getting around" : "Keyboard and mouse"}</Heading>
            <div className="k-card overflow-hidden">
              {SHORTCUTS[platform].map((s) => (
                <div key={s.keys} className="k-row !items-start">
                  <span className="os-kbd w-[46%] shrink-0 text-[12.5px] font-semibold">{s.keys}</span>
                  <span className="min-w-0 flex-1 text-[13px] text-fg2">{s.does}</span>
                </div>
              ))}
            </div>
            {!phone && (
              <p className="mt-3 text-[12.5px] leading-relaxed text-fg3">
                A browser cannot receive every key the real system uses, so a few shortcuts are remapped to combinations it
                can.
              </p>
            )}
          </>
        )}
        {section === "eggs" && (
          <>
            <Heading>Things to find</Heading>
            <div className="space-y-2.5">
              {EGGS.map((e) => (
                <div key={e.title} className="k-card p-3.5">
                  <div className="text-[14px] font-semibold">{e.title}</div>
                  <div className="selectable mt-0.5 text-[13px] text-fg2">{e.body}</div>
                </div>
              ))}
            </div>
            <button type="button" className="k-btn mt-4" onClick={() => launch("terminal")}>
              Open {appName("terminal", platform)}
            </button>
          </>
        )}
        {section === "about" && (
          <>
            <Heading>About this portfolio</Heading>
            <div className="selectable space-y-3 text-[14px] leading-relaxed">
              <p>
                This is {profile.name}&apos;s portfolio, built as three operating systems you can boot in a browser tab. You
                are in the {FAMILY_LABEL[family][phone ? "phone" : "desktop"]}-style one.
              </p>
              <p>
                Every app reads the same content, so the projects in {appName("projects", platform)} are also folders in{" "}
                {appName("files", platform)}, commands in {appName("terminal", platform)} and favourites in{" "}
                {appName("browser", platform)}.
              </p>
              <p>
                Nothing here is a screenshot of a real system: the wallpapers, icons and interface are drawn with CSS and
                SVG, using open-source icon sets and fonts.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="k-btn k-btn-primary" onClick={() => launch("about")}>
                Meet {profile.firstName}
              </button>
              <button type="button" className="k-btn" onClick={() => launch("settings", { section: "system" })}>
                Switch operating system
              </button>
            </div>
          </>
        )}
      </Page>
    </AppFrame>
  );
}
