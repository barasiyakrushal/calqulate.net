"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics/track";

/**
 * Fires one analytics event on mount. Lets server components (PremiumGate,
 * ServiceCTA, etc.) record an impression without becoming client components.
 * Guarded so React strict-mode double-mount cannot double-count.
 */
export function TrackEvent({
  event,
  params,
}: {
  event: AnalyticsEvent;
  params?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, params);
    // params is intentionally not a dep: this is a fire-once impression.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
