// src/hooks/useSlots.ts
import { useEffect, useState } from "react";

export type Slot = {
  id: string;
  name: string;
  status: "free" | "reserved" | "parked";
};

const demoSlots: Slot[] = [
  { id: "S1", name: "A1", status: "free" },
  { id: "S2", name: "A2", status: "reserved" },
  { id: "S3", name: "A3", status: "parked" },
  { id: "S4", name: "A4", status: "free" },
  { id: "S5", name: "B1", status: "parked" },
  { id: "S6", name: "B2", status: "free" },
  { id: "S7", name: "B3", status: "reserved" },
  { id: "S8", name: "B4", status: "parked" },
  { id: "S9", name: "C1", status: "free" },
  { id: "S10", name: "C2", status: "parked" },
  { id: "S11", name: "C3", status: "reserved" },
  { id: "S12", name: "C4", status: "free" },
  { id: "S13", name: "D1", status: "free" },
  { id: "S14", name: "D2", status: "reserved" },
  { id: "S15", name: "D3", status: "free" },
  { id: "S16", name: "D4", status: "parked" },
];

export default function useSlots(pollMs = 5000) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    function randomizeStatuses() {
      if (!active) return;
      const updated = demoSlots.map((slot) => {
        const states = ["free", "reserved", "parked"];
        const newStatus = states[Math.floor(Math.random() * states.length)] as Slot["status"];
        return { ...slot, status: newStatus };
      });
      setSlots(updated);
      setLoading(false);
    }

    randomizeStatuses();
    const timer = setInterval(randomizeStatuses, pollMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pollMs]);

  return { slots, loading };
}
