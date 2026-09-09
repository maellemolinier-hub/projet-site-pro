"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/analytics";

/**
 * Client component that captures UTM params on first load.
 * Render once in the root layout, inside <body>.
 */
export default function AnalyticsInit() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
}