"use client";

import { Check, ImageSquare } from "@phosphor-icons/react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { Heading, Page } from "@/components/kit";
import { Wallpaper } from "@/components/wallpaper";
import { useDark } from "@/hooks/use-dark";
import { FAMILY_LABEL } from "@/lib/platform";
import { WALLPAPERS } from "@/lib/wallpapers";
import { useFamily } from "@/stores/session";
import { useSettings } from "@/stores/settings";
import type { Family } from "@/types";

const FAMILIES: Family[] = ["macos", "windows", "linux"];

export default function Photos() {
  const family = useFamily();
  const dark = useDark();
  const current = useSettings((s) => s.prefs[family].wallpaper);
  const [open, setOpen] = useState<{ family: Family; id: string } | null>(null);
  const meta = open && WALLPAPERS[open.family].find((w) => w.id === open.id);

  if (open && meta) {
    const mine = open.family === family;
    const active = mine && current === open.id;
    return (
      <AppFrame title={meta.name} subtitle={`${FAMILY_LABEL[open.family].desktop} collection`} onBack={() => setOpen(null)} flush>
        <div className="relative h-full bg-black">
          <Wallpaper id={open.id} family={open.family} dark={false} dim={false} />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
            <span className="text-[13px]">Drawn in code with gradients and vector paths, no image file.</span>
            <button
              type="button"
              className="k-btn k-btn-primary"
              disabled={active}
              onClick={() => {
                if (mine) useSettings.getState().setWallpaper(family, open.id);
              }}
              style={{ display: mine ? undefined : "none" }}
            >
              {active ? <Check size={15} weight="bold" /> : <ImageSquare size={15} />}
              {active ? "Current wallpaper" : "Set as wallpaper"}
            </button>
          </div>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame subtitle="Vector artwork">
      <Page wide>
        {[family, ...FAMILIES.filter((f) => f !== family)].map((f) => (
          <section key={f}>
            <Heading>{FAMILY_LABEL[f].desktop} collection</Heading>
            <div className="grid grid-cols-2 gap-2.5 @min-[560px]:grid-cols-4">
              {WALLPAPERS[f].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className="os-photo group relative aspect-[4/3] overflow-hidden rounded-ctl"
                  aria-label={`${w.name} (${FAMILY_LABEL[f].desktop})`}
                  onClick={() => setOpen({ family: f, id: w.id })}
                >
                  <Wallpaper id={w.id} family={f} dark={f === "windows" && dark} dim={false} className="transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-5 text-left text-[12px] font-medium text-white">
                    {w.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </Page>
    </AppFrame>
  );
}
