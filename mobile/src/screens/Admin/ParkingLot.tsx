// src/screens/Admin/ParkingLot.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { mockSlots } from "../../data/mockData";
import { fetchLiveSensor } from "../../api/sensors";

type Slot = typeof mockSlots[number];

const SLOT_COLORS: Record<string, string> = {
  parked: "#EF4444",
  reserved: "#FACC15",
  vacant: "#22C55E",
};

function formatTs(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ParkingLot(): JSX.Element {
  const [selected, setSelected] = useState<Slot | null>(null);
  const [slots, setSlots] = useState(mockSlots);

  // 🧠 Fetch all devices every 3 seconds — dynamic multi-sensor support
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchLiveSensor();
      if (!data) return;

      setSlots((prev) =>
        prev.map((slot) => {
          const deviceData = data[slot.slotId]; // sensor.id must match slotId (A1, A2, B4…)

          if (!deviceData) {
            return slot; // no sensor for this slot
          }

          const { state, distance, timestamp } = deviceData;
          const newStatus = state ? "vacant" : "parked";

          // Do NOT override reserved slots unless YOU want to
          // const finalStatus = slot.status === "reserved" ? "reserved" : newStatus;

          return {
            ...slot,
            status: newStatus,
            updatedAt: timestamp,
            distance, // extra field, UI will show if present
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const orderedSlots = [...slots].sort((a, b) => a.slotId.localeCompare(b.slotId));

  // grid setup
  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor(
    (screenW - gridPadding * 2 - gap * (columns - 1)) / columns
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Parking Lot</Text>
      <Text style={styles.subheader}>Tap a slot to view details</Text>

      <View style={[styles.gridContainer, { paddingHorizontal: gridPadding }]}>
        <View
          style={{
            width: tileSize * columns + gap * (columns - 1),
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {orderedSlots.map((slot, index) => {
            const bg = SLOT_COLORS[slot.status];
            return (
              <TouchableOpacity
                key={slot.slotId}
                style={[
                  styles.tile,
                  {
                    backgroundColor: bg,
                    width: tileSize,
                    height: tileSize,
                    marginRight: (index + 1) % columns === 0 ? 0 : gap,
                    marginBottom: gap,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => setSelected(slot)}
                accessibilityRole="button"
                accessibilityLabel={`${slot.slotId} ${slot.status}`}
              >
                <Text style={styles.tileLabel}>{slot.slotId}</Text>

                {/* status capsule / pill */}
                <View
                  style={[
                    styles.statusPill,
                    slot.status === "parked" ? styles.statusPillDark : styles.statusPillLight,
                  ]}
                >
                  <Text style={styles.statusPillText}>{slot.status.toUpperCase()}</Text>
                </View>

                {/* optional small distance info */}
                {"distance" in slot && slot.distance != null && (
                  <Text style={styles.tileSmall}>{slot.distance.toFixed(0)} cm</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modal for details */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selected?.slotId} — {selected?.status.toUpperCase()}
                </Text>
                <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
                  <Text style={styles.closeTxt}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Slot Info</Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Area:</Text> {selected?.area ?? "—"}
                </Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Last updated:</Text>{" "}
                  {formatTs(selected?.updatedAt)}
                </Text>
                {"distance" in (selected || {}) && selected?.distance != null && (
                  <Text style={styles.sectionRow}>
                    <Text style={styles.bold}>Distance:</Text> {selected.distance.toFixed(1)} cm
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  subheader: {
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  gridContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  tile: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  tileLabel: { color: "#fff", fontWeight: "800", fontSize: 20 },
  tileSmall: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
    marginTop: 6,
    opacity: 0.95,
  },

  // status pill (top-right)
  statusPill: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusPillText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  statusPillDark: { backgroundColor: "rgba(0,0,0,0.22)" },
  statusPillLight: { backgroundColor: "rgba(255,255,255,0.12)" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 14,
    width: "90%",
    maxHeight: "85%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  closeBtn: { padding: 6 },
  closeTxt: { color: theme.colors.primary, fontWeight: "700" },
  section: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 10 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },
});
