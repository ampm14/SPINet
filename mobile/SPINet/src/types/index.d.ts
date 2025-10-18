// Global app types
export type SlotStatus = "free" | "occupied";

export interface Slot {
  id: string;
  name: string;         // human label like "A1"
  status: SlotStatus;
  lat?: number;         // optional for future map integration
  lng?: number;
}
