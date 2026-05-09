"use client";

import { createContext, useContext, useState } from "react";
import type { AppArgs, AppId } from "@/types";

export interface Instance {
  id: string;
  appId: AppId;
  args: AppArgs;
  active: boolean;
  close: () => void;
}

export const InstanceContext = createContext<Instance | null>(null);

export function useInstance(): Instance {
  const instance = useContext(InstanceContext);
  if (!instance) throw new Error("useInstance must be used inside a running app");
  return instance;
}

export function useRelaunch(apply: (args: AppArgs) => void) {
  const { args } = useInstance();
  const [seen, setSeen] = useState(args.nonce);
  if (args.nonce !== seen) {
    setSeen(args.nonce);
    apply(args);
  }
}
