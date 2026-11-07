import type { Metadata } from "next";
import Link from "next/link";
import { FAULT_ACTION, FaultScreen } from "@/components/fault-screen";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <FaultScreen code="Error 404" title="No such file or directory">
      <p className="mt-3 text-[15px] leading-relaxed text-white/60">This address is not part of the portfolio.</p>
      <Link href="/" className={FAULT_ACTION}>
        Back to the startup manager
      </Link>
    </FaultScreen>
  );
}
