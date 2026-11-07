"use client";

import { FAULT_ACTION, FaultScreen } from "@/components/fault-screen";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <FaultScreen code="System error" title="Something went wrong">
      <p className="mt-3 text-[15px] leading-relaxed text-white/60">The portfolio hit an error and stopped.</p>
      <button type="button" className={FAULT_ACTION} onClick={() => retry()}>
        Try again
      </button>
    </FaultScreen>
  );
}
