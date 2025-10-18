// src/hooks/useSlots.ts
import { useEffect, useState } from "react";
import type { Slot } from "../types";
import * as parkingService from "../api/parkingService";

/**
 * Polling hook that returns slots and loading state.
 * Also exposes a programmatic refreshSlots() to trigger an immediate fetch.
 *
 * Implementation notes:
 * - We keep a module-level `refreshFn` that the active hook instance sets when mounted.
 * - Calling refreshSlots() invokes that function if present.
 */

let refreshFn: (() => Promise<void>) | null = null;

export default function useSlots(pollMs = 5000) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function fetchOnce() {
      setLoading(true);
      try {
        if (typeof (parkingService as any).getSlots === "function") {
          const res = await (parkingService as any).getSlots();
          if (mounted && Array.isArray(res)) setSlots(res);
        } else {
          // fallback to empty
          if (mounted) setSlots([]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("useSlots fetch error:", err);
        if (mounted) setSlots([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Expose the fetchOnce function to module-level `refreshFn`
    refreshFn = async () => {
      try {
        await fetchOnce();
      } catch (e) {
        // swallow; already logged by fetchOnce
      }
    };

    // initial fetch and polling
    fetchOnce();
    timer = setInterval(fetchOnce, pollMs);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      // if this hook instance set refreshFn, clear it
      refreshFn = null;
    };
  }, [pollMs]);

  return { slots, loading };
}

/**
 * Call this from anywhere to trigger an immediate fetch in the active hook instance.
 * If no hook is mounted, this is a no-op.
 */
export function refreshSlots() {
  if (refreshFn) {
    // fire and forget; errors are handled inside fetchOnce
    void refreshFn();
  } else {
    // no active hook instance; nothing to refresh
    // eslint-disable-next-line no-console
    console.warn("refreshSlots(): no active useSlots instance");
  }
}
