"use client";

import { MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, type ComponentType } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { isPhoneSize, useViewport } from "@/hooks/use-viewport";
import { useSession } from "@/stores/session";
import type { Form } from "@/types";

function Blank() {
  return <div className="fixed inset-0 bg-black" />;
}

const SHELLS: Record<Form, ComponentType> = {
  desktop: dynamic(() => import("@/shells/macos/desktop"), { ssr: false, loading: Blank }),
  phone: dynamic(() => import("@/shells/macos/phone"), { ssr: false, loading: Blank }),
};

export function Root() {
  const mounted = useMounted();
  const { w, h } = useViewport();
  const family = useSession((s) => s.family);
  const form: Form = isPhoneSize(w, h) ? "phone" : "desktop";

  useEffect(() => {
    useSession.getState().setForm(form);
  }, [form]);

  useEffect(() => {
    if (useSession.getState().family === null) useSession.getState().start("macos");
  }, []);

  if (!mounted || !family) return <Blank />;

  const Shell = SHELLS[form];
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-root fixed inset-0 bg-black" onContextMenu={(e) => e.preventDefault()}>
        <Shell />
      </div>
    </MotionConfig>
  );
}
