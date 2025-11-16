// src/screens/Parker/UserDashboard.tsx
// only layout tweaks from previous version (styling aligned with Admin ParkingLot)
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
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../styles/theme";
import { mockSlots } from "../../data/mockData";

type Slot = typeof mockSlots[number];

const SLOT_COLORS: Record<string, string> = {
  parked: "#EF4444",
  reserved: "#FACC15",
  vacant: "#22C55E",
};

export default function UserDashboard(): JSX.Element {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<Slot | null>(null);
  const [slots, setSlots] = useState([...mockSlots]);

  const myReservation = slots.find((s) => s.status === "reserved" && s.slotId === "A2");

  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor((screenW - gridPadding * 2 - gap * (columns - 1)) / columns);

  const handleSlotPress = (slot: Slot) => {
    if (slot.status === "vacant") {
      navigation.navigate("ReservationForm", { slotId: slot.slotId });
    } else {
      setSelected(slot);
    }
  };

  const cancelReservation = () => {
    if (!myReservation) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.slotId === myReservation.slotId ? { ...s, status: "vacant", owner: undefined } : s
      )
    );
  };

  const orderedSlots = [...slots].sort((a, b) => a.slotId.localeCompare(b.slotId));

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered, minimal header */}
      <View style={styles.headerSimple}>
        <Text style={styles.header}>Available Slots</Text>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingBox}>
        <Text style={styles.greeting}>Hey Grant Sanderson,</Text>
        <Text style={styles.reservedText}>
          You have reserved <Text style={styles.highlight}>A3</Text>
        </Text>
      </View>

      {/* My Reservation Section */}
      {myReservation && (
        <View style={styles.reservationCard}>
          <View style={styles.resRow}>
            <View>
              <Text style={styles.resTitle}>My Reservation</Text>
              <Text style={styles.resSubtitle}>Slot {myReservation.slotId}</Text>
            </View>
            <Pressable style={styles.cancelBtn} onPress={cancelReservation}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Grid placed centrally */}
      <View style={[styles.gridWrapper, { paddingHorizontal: gridPadding }]}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: tileSize * columns + gap * (columns - 1),
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
                activeOpacity={0.9}
                onPress={() => handleSlotPress(slot)}
              >
                <Text style={styles.tileLabel}>{slot.slotId}</Text>

                {/* centered capsule inside the tile below the label */}
                <View
                  style={[
                    styles.statusPillCentered,
                    slot.status === "parked" ? styles.statusPillDark : styles.statusPillLight,
                  ]}
                >
                  <Text style={styles.statusPillText}>{slot.status.toUpperCase()}</Text>
                </View>

                {/* optional small distance info (kept if present) */}
                {"distance" in slot && slot.distance != null && (
                  <Text style={styles.tileSmall}>{slot.distance.toFixed(0)} cm</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modal */}
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
                  <Text style={styles.bold}>Status:</Text> {selected?.status.toUpperCase()}
                </Text>
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

  headerSimple: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },

  header: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },

  greetingBox: {
    marginTop: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  reservedText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  highlight: {
    fontWeight: "800",
    color: theme.colors.primary,
  },

  reservationCard: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  resRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary },
  resSubtitle: { fontSize: 13, color: theme.colors.textSecondary },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelTxt: { color: "#EF4444", fontWeight: "700" },

  gridWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
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

  // centered status pill (capsule inside tile)
  statusPillCentered: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "center",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
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

  section: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },
});
