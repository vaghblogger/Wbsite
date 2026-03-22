"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cta_primary_variant";

export type PrimaryCtaVariant = "strategy_call" | "demo";

export function useCtaVariant(): PrimaryCtaVariant {
  const [variant, setVariant] = useState<PrimaryCtaVariant>("strategy_call");

  useEffect(() => {
    const current = window.localStorage.getItem(STORAGE_KEY) as PrimaryCtaVariant | null;
    if (current === "strategy_call" || current === "demo") {
      setVariant(current);
      return;
    }
    const chosen: PrimaryCtaVariant = Math.random() < 0.5 ? "strategy_call" : "demo";
    window.localStorage.setItem(STORAGE_KEY, chosen);
    setVariant(chosen);
  }, []);

  return variant;
}
