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
    // the shell can re-mount before these timers fire
    const current = () => useSession.getState().boots === boot && useSession.getState().phase === "desktop";
    const settings = useSettings.getState();
    if (form === "desktop") {
      window.setTimeout(() => current() && useSession.getState().form === "desktop" && launch("about"), 450);
    }
    if (!settings.welcomed.includes(family)) {
      window.setTimeout(() => {
        if (!current()) return;
        settings.markWelcomed(family);
        useSession.getState().notify({
          app: "tips",
          title: `Welcome to ${profile.firstName}'s ${FAMILY_LABEL[family][form]}`,
          body: hint,
          open: { app: "tips" },
        });
      }, 1500);
    }
  }, [phase, family, form, platform, hint]);
}
