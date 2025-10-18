import type { Slot } from "../types";
import mockData from "../data/mockSlots.json";

let slotsCache: Slot[] = mockData.map((s) => ({ ...s }));

export async function getSlots(): Promise<Slot[]> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 200));
  return slotsCache;
}

export async function reserveSlot(slotId: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = slotsCache.findIndex((s) => s.id === slotId);
  if (idx !== -1) slotsCache[idx].status = "occupied";
  return { ok: true };
}

export async function freeSlot(slotId: string): Promise<{ ok: boolean }> {
  await new Promise((r) => setTimeout(r, 200));
  const idx = slotsCache.findIndex((s) => s.id === slotId);
  if (idx !== -1) slotsCache[idx].status = "free";
  return { ok: true };
}

export function updateSlotStatus(slotId: string, status: string) {
  const idx = slotsCache.findIndex((s) => s.id === slotId);
  if (idx !== -1) slotsCache[idx].status = status;
}
