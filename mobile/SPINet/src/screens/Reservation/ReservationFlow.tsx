import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { reserveSlot, freeSlot } from "../../api/parkingService";
import { refreshSlots } from "../../hooks/useSlots";

export default function ReservationFlow(): JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const slotId = route.params?.slotId ?? "Unknown";

  const [reserved, setReserved] = useState(false);
  const [timer, setTimer] = useState(300); // 5-minute countdown

  async function handleReserve() {
    const res = await reserveSlot(slotId);
    if (res.ok) {
      setReserved(true);
      refreshSlots(); // trigger Dashboard update instantly
    }
  }

  async function handleCancel() {
    const res = await freeSlot(slotId);
    if (res.ok) {
      setReserved(false);
      setTimer(300);
      refreshSlots(); // update Dashboard stats
    }
  }

  // countdown logic
  useEffect(() => {
    if (!reserved) return;
    const t = setInterval(() => {
      setTimer((x) => (x > 0 ? x - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [reserved]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Reservation</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Slot ID:</Text>
        <Text style={styles.value}>{slotId}</Text>
      </View>

      {!reserved ? (
        <Pressable
          style={({ pressed }) => [
            styles.reserveBtn,
            pressed && styles.reserveBtnPressed,
          ]}
          onPress={handleReserve}
        >
          <Text style={styles.reserveText}>Confirm Reservation</Text>
        </Pressable>
      ) : (
        <View style={styles.timerBox}>
          <Text style={styles.success}>Slot Reserved!</Text>
          <Text style={styles.timerText}>
            Time remaining: {minutes}:{seconds.toString().padStart(2, "0")}
          </Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.cancelText}>Cancel Reservation</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.backText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontSize: 16, color: theme.colors.textSecondary },
  value: { fontSize: 20, fontWeight: "600", color: theme.colors.textPrimary },
  reserveBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  reserveBtnPressed: { opacity: 0.85 },
  reserveText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  timerBox: {
    alignItems: "center",
    gap: 16,
  },
  success: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 10,
  },
  timerText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F87171",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
