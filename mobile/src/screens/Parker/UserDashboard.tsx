// src/screens/Parker/UserDashboard.tsx
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../styles/theme";
import { mockSlots } from "../../data/mockData";
import { fetchLiveSensor } from "../../api/sensors";

type Slot = typeof mockSlots[number];

const SLOT_COLORS: Record<string, string> = {
  parked: "#EF4444",
  reserved: "#FACC15",
  vacant: "#22C55E",
  mine: "#3B82F6",
};

const SLOT_PRICE = 50; // Fixed price for all slots

export default function UserDashboard(): JSX.Element {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([...mockSlots]);

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("currentUser");
      if (stored) setCurrentUser(JSON.parse(stored));
    };
    loadUser();
  }, []);

  // Update slot if navigated from ReservationSuccess
  useEffect(() => {
    if (currentUser && route.params?.reservedSlot) {
      const { slotId } = route.params.reservedSlot;
      setSlots((prev) =>
        prev.map((s) =>
          s.slotId === slotId
            ? { ...s, status: "reserved", owner: currentUser.email }
            : s
        )
      );
      navigation.setParams({ reservedSlot: undefined });
    }
  }, [route.params, currentUser]);

  // Live sensor updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const liveData = await fetchLiveSensor();
      if (!liveData) return;

      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          if (slot.status === "reserved") return slot;

          const deviceData = liveData[slot.slotId];
          if (!deviceData) return slot;

          const { distance, state, timestamp } = deviceData;
          return {
            ...slot,
            distance,
            status: state ? "vacant" : "parked",
            updatedAt: timestamp,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const myReservation = slots.find(
    (s) => s.status === "reserved" && s.owner === currentUser?.email
  );

  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor(
    (screenW - gridPadding * 2 - gap * (columns - 1)) / columns
  );

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
        s.slotId === myReservation.slotId
          ? { ...s, status: "vacant", owner: undefined }
          : s
      )
    );
  };

  // --- LOGOUT like AdminDashboard ---
  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            // If a global auth sign-out exists, call it
            if (typeof (global as any).authSignOut === "function") {
              await (global as any).authSignOut();
              return;
            }
          } catch (e) {
            // fallback
          }

          try {
            // Clear local storage
            await AsyncStorage.removeItem("currentUser");

            // Reset navigation to Welcome
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          } catch (e) {
            // fallback
            navigation.navigate("Welcome");
          }
        },
      },
    ]);
  };

  const orderedSlots = [...slots].sort((a, b) => a.slotId.localeCompare(b.slotId));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSimple}>
        <Text style={styles.header}>Available Slots</Text>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={styles.greetingBox}>
        <Text style={styles.greeting}>
          Hey {currentUser?.name || currentUser?.email || "User"},
        </Text>
        {myReservation ? (
          <Text style={styles.reservedText}>
            You have reserved <Text style={styles.highlight}>{myReservation.slotId}</Text>
          </Text>
        ) : (
          <Text style={styles.reservedText}>You have no active reservations</Text>
        )}
      </View>

      {/* My Reservation */}
      {myReservation && (
        <View style={styles.reservationCard}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={styles.resTitle}>My Reservation</Text>
              <Text style={styles.resSubtitle}>
                Slot {myReservation.slotId} — ₹{SLOT_PRICE}/hr
              </Text>
            </View>
            <Pressable style={styles.cancelBtn} onPress={cancelReservation}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Slot Grid */}
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
            const bg =
              slot.status === "reserved" && slot.owner === currentUser?.email
                ? SLOT_COLORS.mine
                : SLOT_COLORS[slot.status];

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
                onPress={() => handleSlotPress(slot)}
              >
                <Text style={styles.tileLabel}>{slot.slotId}</Text>

                <View
                  style={[
                    styles.statusPillCentered,
                    slot.status === "parked" ? styles.statusPillDark : styles.statusPillLight,
                  ]}
                >
                  <Text style={styles.statusPillText}>{slot.status.toUpperCase()}</Text>
                </View>

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
                <Pressable onPress={() => setSelected(null)}>
                  <Text style={styles.closeTxt}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Slot Info</Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Area:</Text> {selected?.area || "—"}
                </Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Status:</Text> {selected?.status.toUpperCase()}
                </Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Price:</Text> ₹{SLOT_PRICE}/hr
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
  headerSimple: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    paddingBottom: 8, 
    alignItems: "center", 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  header: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary },

  // --- Logout styling same as Admin ---
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EDF8",
    backgroundColor: "#fff",
  },
  logoutPressed: { opacity: 0.8 },
  logoutText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },

  greetingBox: { marginTop: 8, paddingHorizontal: 20, marginBottom: 10 },
  greeting: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary },
  reservedText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  highlight: { fontWeight: "800", color: theme.colors.primary },

  reservationCard: { backgroundColor: theme.colors.surface ?? "#fff", borderRadius: 10, padding: 12, marginHorizontal: 16, marginTop: 10, marginBottom: 20 },
  resTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary },
  resSubtitle: { fontSize: 13, color: theme.colors.textSecondary },
  cancelBtn: { borderWidth: 1, borderColor: "#EF4444", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  cancelTxt: { color: "#EF4444", fontWeight: "700" },

  gridWrapper: { flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 40 },
  tile: { borderRadius: 12, alignItems: "center", justifyContent: "center", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 4 }, android: { elevation: 3 } }) },
  tileLabel: { color: "#fff", fontWeight: "800", fontSize: 20 },
  tileSmall: { color: "rgba(255,255,255,0.9)", fontSize: 10, marginTop: 6 },
  statusPillCentered: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusPillText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  statusPillDark: { backgroundColor: "rgba(0,0,0,0.22)" },
  statusPillLight: { backgroundColor: "rgba(255,255,255,0.12)" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalCard: { backgroundColor: theme.colors.surface ?? "#fff", borderRadius: 14, width: "90%", maxHeight: "85%", padding: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.textPrimary },
  closeTxt: { color: theme.colors.primary, fontWeight: "700" },
  section: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: theme.colors.textPrimary },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },
});
