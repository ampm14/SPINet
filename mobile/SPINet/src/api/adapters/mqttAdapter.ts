// src/api/adapters/mqttAdapter.ts
// Fake IoT feed for development

import type { Slot } from "../../types";
import { refreshSlots } from "../../hooks/useSlots";

let interval: NodeJS.Timer | null = null;

export function connectMQTT() {
  console.log("[FakeMQTT] Starting simulated sensor feed...");

  // every 7 seconds, randomly flip one slot’s status
  interval = setInterval(() => {
    const slotId = `S${Math.ceil(Math.random() * 5)}`; // S1–S5
    const newStatus = Math.random() > 0.5 ? "free" : "occupied";

    console.log(`[FakeMQTT] Simulated update → ${slotId} = ${newStatus}`);

    // Simulate an IoT payload
    const update: Slot = {
      id: slotId,
      name: slotId,
      status: newStatus,
    };

    // apply it to local cache (pretend like MQTT pushed it)
    try {
      import("../parkingService").then((svc) => {
        svc.updateSlotStatus(update.id, update.status);
        refreshSlots();
      });
    } catch (err) {
      console.error("[FakeMQTT] error applying update", err);
    }
  }, 7000);

  return { end: disconnectMQTT };
}

export function disconnectMQTT() {
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log("[FakeMQTT] Stopped simulated feed");
  }
}

export function onSlotUpdate() {
  // no-op in fake mode
}

export function offSlotUpdate() {
  // no-op in fake mode
}
