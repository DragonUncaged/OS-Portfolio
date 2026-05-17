"use client";

import { MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useSession } from "@/stores/session";

function Blank() {
  return <div className="fixed inset-0 bg-black" />;
}

const MacDesktop = dynamic(() => import("@/shells/macos/desktop"), { ssr: false, loading: Blank });

export function Root() {
  const mounted = useMounted();
  const family = useSession((s) => s.family);

  useEffect(() => {
    if (useSession.getState().family === null) useSession.getState().start("macos");
  }, []);

  if (!mounted || !family) return <Blank />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-root fixed inset-0 bg-black" onContextMenu={(e) => e.preventDefault()}>
        <MacDesktop />
      </div>
    </MotionConfig>
  );
}
