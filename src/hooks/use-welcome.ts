"use client";

import { useEffect } from "react";
import { profile } from "@/data/portfolio";
import { launch } from "@/lib/launch";
import { FAMILY_LABEL } from "@/lib/platform";
import { useFamily, usePlatform, useSession } from "@/stores/session";
import { useSettings } from "@/stores/settings";

let greetedBoot = -1;

export function useWelcome(hint: string) {
  const family = useFamily();
  const platform = usePlatform();
  const phase = useSession((s) => s.phase);
  const form = useSession((s) => s.form);
  useEffect(() => {
    const boot = useSession.getState().boots;
    if (phase !== "desktop" || greetedBoot === boot) return;
    greetedBoot = boot;
    const settings = useSettings.getState();
    const first = !settings.welcomed.includes(family);
    const timers: number[] = [];
    if (form === "desktop") timers.push(window.setTimeout(() => launch("about"), 450));
    if (first) {
      timers.push(
        window.setTimeout(() => {
          settings.markWelcomed(family);
          useSession.getState().notify({
            app: "tips",
            title: `Welcome to ${profile.firstName}'s ${FAMILY_LABEL[family][form]}`,
            body: hint,
            open: { app: "tips" },
          });
        }, 1500),
      );
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, family, form, platform, hint]);
}
