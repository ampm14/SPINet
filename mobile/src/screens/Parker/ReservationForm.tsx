// src/screens/Parker/ReservationForm.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { theme } from "../../styles/theme";
import { mockSlots } from "../../data/mockData";

export default function ReservationForm(): JSX.Element {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const slotId = route?.params?.slotId ?? "Unknown";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [car, setCar] = useState("");

  function onConfirm() {
    // For demo: update in-memory mockSlots (not persistent).
    // In real app, call API or context update.
    // Navigate to success with details
    nav.navigate("ReservationSuccess", { slotId, name, phone, car });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reserve {slotId}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Car number</Text>
        <TextInput style={styles.input} value={car} onChangeText={setCar} placeholder="KA01AB1234" />
      </View>

      <Pressable style={styles.cta} onPress={onConfirm}>
        <Text style={styles.ctaText}>Confirm Reservation</Text>
      </Pressable>

      <Pressable style={styles.cancel} onPress={() => nav.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 20 },
  field: { marginBottom: 12 },
  label: { color: theme.colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, color: theme.colors.textPrimary },
  cta: { marginTop: 20, backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: "center" },
  ctaText: { color: theme.colors.onPrimary, fontWeight: "800" },
  cancel: { marginTop: 12, alignItems: "center" },
  cancelText: { color: theme.colors.textSecondary },
});
