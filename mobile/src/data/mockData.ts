// mockData.ts
// TypeScript - usable in React Native / Node. No external deps.
// Updated: reserved slots now include owner/reservation details.

type Status = "parked" | "reserved" | "vacant";

export type Slot = {
  slotId: string;               // "A1"
  area?: string;                // "A"
  status: Status;
  updatedAt: string;            // ISO timestamp of last status change
  owner?: {
    fullName: string;
    email: string;
    phone?: string;
    parkedAt?: string;          // ISO timestamp when they parked (only for parked)
    reservedAt?: string;        // ISO timestamp when they reserved (only for reserved)
    carNumber?: string;         // registration plate (may be missing for reservations)
    notes?: string;
  };
};

export type Sensor = {
  sensorId: string;             // "S-A1" or unique id
  slotId: string;               // link to slot
  type: "ultrasonic";
  distanceCm: number | null;    // last measured distance in cm (null if no reading)
  isConnected: boolean;         // whether device currently connected (last heartbeat ok)
  lastSeen: string | null;      // ISO timestamp of last data sent
  batteryPercent?: number;      // 0-100
  rssiDbm?: number;             // signal strength in dBm
  readingHistory?: Array<{
    ts: string;                 // ISO timestamp
    distanceCm: number;
  }>;                           // small rolling history
};

/* ---------- Static example data (deterministic) ---------- */

export const mockSlots: Slot[] = [
  // Area A
  {
    slotId: "A1",
    area: "A",
    status: "parked",
    updatedAt: "2025-10-19T01:02:00+05:30",
    owner: {
      fullName: "Rahul Mehta",
      email: "rahul.mehta@example.com",
      phone: "+91-9876543210",
      parkedAt: "2025-10-19T00:50:00+05:30",
      carNumber: "MH12AB1234",
      notes: "VIP pass",
    },
  },
  { slotId: "A2", area: "A", status: "vacant", updatedAt: "2025-10-18T22:15:00+05:30" },
  {
    slotId: "A3",
    area: "A",
    status: "reserved",
    updatedAt: "2025-10-19T00:30:00+05:30",
    owner: {
      fullName: "Priya Desai",
      email: "priya.desai@example.com",
      phone: "+91-9012345678",
      reservedAt: "2025-10-19T00:25:00+05:30",
      carNumber: "DL1AA1234",
      notes: "Reservation for client meeting",
    },
  },
  { slotId: "A4", area: "A", status: "vacant", updatedAt: "2025-10-18T20:00:00+05:30" },

  // Area B
  {
    slotId: "B1",
    area: "B",
    status: "parked",
    updatedAt: "2025-10-19T00:45:00+05:30",
    owner: {
      fullName: "Ananya Roy",
      email: "ananya.roy@example.com",
      phone: "+91-9123456780",
      parkedAt: "2025-10-19T00:40:00+05:30",
      carNumber: "DL4CAF5032",
      notes: "EV charging",
    },
  },
  { slotId: "B2", area: "B", status: "vacant", updatedAt: "2025-10-18T19:00:00+05:30" },
  {
    slotId: "B3",
    area: "B",
    status: "reserved",
    updatedAt: "2025-10-19T00:00:00+05:30",
    owner: {
      fullName: "Karan Gupta",
      email: "karan.gupta@example.com",
      phone: "+91-9980011223",
      reservedAt: "2025-10-18T23:55:00+05:30",
      carNumber: "KA05ZZ7777",
      notes: "Reserved by contractor",
    },
  },
  { slotId: "B4", area: "B", status: "vacant", updatedAt: "2025-10-18T18:30:00+05:30" },

  // Area C
  { slotId: "C1", area: "C", status: "vacant", updatedAt: "2025-10-18T16:00:00+05:30" },
  {
    slotId: "C2",
    area: "C",
    status: "parked",
    updatedAt: "2025-10-19T00:55:00+05:30",
    owner: {
      fullName: "Vikas Sharma",
      email: "vikas.sharma@example.com",
      phone: "+91-9988776655",
      parkedAt: "2025-10-19T00:20:00+05:30",
      carNumber: "KA03MN9001",
    },
  },
  { slotId: "C3", area: "C", status: "vacant", updatedAt: "2025-10-18T15:10:00+05:30" },
  {
    slotId: "C4",
    area: "C",
    status: "reserved",
    updatedAt: "2025-10-18T23:00:00+05:30",
    owner: {
      fullName: "Meera Iyer",
      email: "meera.iyer@example.com",
      phone: "+91-9765432100",
      reservedAt: "2025-10-18T22:45:00+05:30",
      carNumber: "",
      notes: "Reservation for evening event",
    },
  },

  // Area D
  { slotId: "D1", area: "D", status: "vacant", updatedAt: "2025-10-18T09:30:00+05:30" },
  {
    slotId: "D2",
    area: "D",
    status: "parked",
    updatedAt: "2025-10-19T00:10:00+05:30",
    owner: {
      fullName: "Sanjay Kulkarni",
      email: "sanjay.k@example.com",
      phone: "+91-9445566778",
      parkedAt: "2025-10-19T00:05:00+05:30",
      carNumber: "TN07XY4321",
      notes: "Monthly pass",
    },
  },
  { slotId: "D3", area: "D", status: "vacant", updatedAt: "2025-10-18T21:00:00+05:30" },
  {
    slotId: "D4",
    area: "D",
    status: "reserved",
    updatedAt: "2025-10-18T20:50:00+05:30",
    owner: {
      fullName: "Rohit Patel",
      email: "rohit.patel@example.com",
      phone: "+91-9001122334",
      reservedAt: "2025-10-18T20:45:00+05:30",
      carNumber: "MH20AB4321",
      notes: "Reserved for VIP guest",
    },
  },
];

/* ---------- Static sensors mapping (one sensor per slot) ---------- */

export const mockSensors: Sensor[] = mockSlots.map((slot, idx) => {
  const baseTs =
    new Date("2025-10-19T01:00:00+05:30").getTime() - idx * 60_000; // stagger times
  // produce a plausible distance: if parked -> short distance (car close to sensor),
  // reserved/vacant -> larger distance
  const isParked = slot.status === "parked";
  const distance = isParked ? 12 + (idx % 6) : 90 + (idx % 10) * 2;
  const recent = new Date(baseTs - Math.round(Math.random() * 3 * 60_000)); // last seen within last 3 minutes
  const connected = Math.random() > 0.02; // 98% connected in mock
  const battery = Math.max(20, Math.round(70 + (Math.random() * 30 - 15))); // 55-100 roughly
  const rssi = Math.round(-60 + (Math.random() * 12 - 6)); // -66 .. -54 dBm typical

  const history = new Array(6).fill(0).map((_, h) => ({
    ts: new Date(recent.getTime() - (5 - h) * 30_000).toISOString(),
    distanceCm: Math.max(2, Math.round(distance + (Math.random() * 6 - 3))),
  }));

  return {
    sensorId: `S-${slot.slotId}`,
    slotId: slot.slotId,
    type: "ultrasonic",
    distanceCm: connected ? Math.round(history[history.length - 1].distanceCm) : null,
    isConnected: connected,
    lastSeen: connected ? recent.toISOString() : null,
    batteryPercent: battery,
    rssiDbm: rssi,
    readingHistory: history,
  } as Sensor;
});

/* ---------- Generator helper: produce randomized test sets ---------- */

export function generateMockData(seed?: number) {
  // lightweight deterministic-ish generator using seed (optional)
  const rand = (function (s = seed ?? Date.now()) {
    let x = s % 2147483647;
    if (x <= 0) x += 2147483646;
    return () => (x = (x * 16807) % 2147483647) / 2147483647;
  })();

  const slots: Slot[] = [];
  const areas = ["A", "B", "C", "D"];
  for (const area of areas) {
    for (let i = 1; i <= 4; i++) {
      const slotId = `${area}${i}`;
      const r = rand();
      const status: Status = r < 0.25 ? "parked" : r < 0.5 ? "reserved" : "vacant";
      const now = new Date();
      const updatedAt = new Date(
        now.getTime() - Math.round(rand() * 1000 * 60 * 60)
      ).toISOString();
      const slot: Slot = { slotId, area, status, updatedAt };

      if (status === "parked") {
        const parkedAt = new Date(
          now.getTime() - Math.round(rand() * 1000 * 60 * 90)
        ).toISOString();
        slot.owner = {
          fullName: `User ${area}${i}`,
          email: `user${area}${i}@example.com`,
          phone: `+91-9${Math.floor(100000000 + rand() * 900000000)}`,
          parkedAt,
          carNumber: `${["MH", "DL", "KA", "TN"][Math.floor(rand() * 4)]}${Math.floor(
            10 + rand() * 90
          )}XY${Math.floor(1000 + rand() * 9000)}`,
          notes: "",
        };
      } else if (status === "reserved") {
        const reservedAt = new Date(
          now.getTime() - Math.round(rand() * 1000 * 60 * 90)
        ).toISOString();
        slot.owner = {
          fullName: `Reserved ${area}${i}`,
          email: `reserved${area}${i}@example.com`,
          phone: `+91-8${Math.floor(100000000 + rand() * 900000000)}`,
          reservedAt,
          carNumber: Math.random() > 0.5 ? `${["MH", "DL", "KA", "TN"][Math.floor(rand() * 4)]}${Math.floor(
            10 + rand() * 90
          )}XY${Math.floor(1000 + rand() * 9000)}` : "",
          notes: "Auto-generated reservation",
        };
      }

      slots.push(slot);
    }
  }

  const sensors: Sensor[] = slots.map((s, idx) => {
    const now = Date.now();
    const jitter = Math.round(rand() * 5 * 60_000);
    const lastSeen = new Date(now - jitter).toISOString();
    const connected = rand() > 0.03;
    const baseDistance =
      s.status === "parked" ? 10 + Math.round(rand() * 10) : 80 + Math.round(rand() * 40);
    const history = new Array(6).fill(0).map((_, h) => ({
      ts: new Date(now - (5 - h) * 30_000 - Math.round(rand() * 15_000)).toISOString(),
      distanceCm: Math.max(2, Math.round(baseDistance + (rand() * 6 - 3))),
    }));
    return {
      sensorId: `S-${s.slotId}`,
      slotId: s.slotId,
      type: "ultrasonic",
      distanceCm: connected ? history[history.length - 1].distanceCm : null,
      isConnected: connected,
      lastSeen: connected ? lastSeen : null,
      batteryPercent: Math.max(10, Math.round(60 + rand() * 40)),
      rssiDbm: Math.round(-70 + rand() * 20),
      readingHistory: history,
    } as Sensor;
  });

  return { slots, sensors };
}
