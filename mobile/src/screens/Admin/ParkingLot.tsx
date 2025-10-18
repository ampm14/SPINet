// src/screens/Admin/ParkingLot.tsx
import React, { useState } from "react";
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

type Slot = typeof mockSlots[number];

const SLOT_COLORS: Record<string, string> = {
  parked: "#EF4444", // red
  reserved: "#FACC15", // amber
  vacant: "#22C55E", // green
};

function formatTs(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ParkingLot(): JSX.Element {
  const [selected, setSelected] = useState<Slot | null>(null);

  const orderedSlots = [...mockSlots].sort((a, b) => a.slotId.localeCompare(b.slotId));

  // Grid config
  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor((screenW - gridPadding * 2 - gap * (columns - 1)) / columns);

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
              >
                <Text style={styles.tileLabel}>{slot.slotId}</Text>
                <Text style={styles.tileStatus}>{slot.status.toUpperCase()}</Text>
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
                  <Text style={styles.bold}>Last updated:</Text> {formatTs(selected?.updatedAt)}
                </Text>
              </View>

              {(selected?.status === "parked" || selected?.status === "reserved") && selected.owner ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {selected.status === "parked" ? "Owner / Vehicle" : "Reservation Details"}
                  </Text>
                  <Text style={styles.sectionRow}>
                    <Text style={styles.bold}>Name:</Text> {selected.owner.fullName}
                  </Text>
                  <Text style={styles.sectionRow}>
                    <Text style={styles.bold}>Email:</Text> {selected.owner.email}
                  </Text>
                  <Text style={styles.sectionRow}>
                    <Text style={styles.bold}>Phone:</Text> {selected.owner.phone ?? "—"}
                  </Text>
                  {selected.owner.parkedAt || selected.owner.reservedAt ? (
                    <Text style={styles.sectionRow}>
                      <Text style={styles.bold}>
                        {selected.status === "parked" ? "Parked at:" : "Reserved at:"}
                      </Text>{" "}
                      {formatTs(selected.owner.parkedAt || selected.owner.reservedAt)}
                    </Text>
                  ) : null}
                  <Text style={styles.sectionRow}>
                    <Text style={styles.bold}>Car number:</Text>{" "}
                    {selected.owner.carNumber || "—"}
                  </Text>
                  {selected.owner.notes ? (
                    <Text style={styles.sectionRow}>
                      <Text style={styles.bold}>Notes:</Text> {selected.owner.notes}
                    </Text>
                  ) : null}
                </View>
              ) : null}
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

  gridContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tile: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: { elevation: 5 },
    }),
    transform: [{ scale: 1 }],
  },
  tileLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },
  tileStatus: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 4,
    textTransform: "uppercase",
  },

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
  sectionTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 6 },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },
});
