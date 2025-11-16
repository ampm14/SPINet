// src/screens/Parker/ReservationForm.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { theme } from "../../styles/theme";

export default function ReservationForm(): JSX.Element {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const slotId = route?.params?.slotId ?? "Unknown";

  const [phone, setPhone] = useState("");
  const [car, setCar] = useState("");

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;
  const isCarValid = /^[A-Z0-9- ]{4,12}$/i.test(car.trim());

  const onConfirm = () => {
    const errors: string[] = [];

    if (!isPhoneValid) errors.push("Phone must be a 10-digit mobile number.");
    if (!isCarValid) errors.push("Car number should be 4–12 letters or numbers.");

    if (errors.length) {
      Alert.alert("Invalid input", errors.join("\n"));
      return;
    }

    // Navigate to success page with the slot info
    nav.navigate("ReservationSuccess", {
      slotId,
      phone: phoneDigits,
      car: car.trim().toUpperCase(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.title}>Reserve {slotId}</Text>

            {/* Phone FIELD */}
            <View style={styles.field}>
              <Text style={[styles.label, styles.labelBold]}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="98765 43210"
                placeholderTextColor="#9AA3B2"
                returnKeyType="next"
                maxLength={16}
              />
            </View>

            {/* Car FIELD */}
            <View style={styles.field}>
              <Text style={[styles.label, styles.labelBold]}>Car number</Text>
              <TextInput
                style={styles.input}
                value={car}
                onChangeText={setCar}
                placeholder="KA01AB1234"
                placeholderTextColor="#9AA3B2"
                autoCapitalize="characters"
                returnKeyType="done"
              />
            </View>

            {/* Confirm button */}
            <Pressable
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
              onPress={onConfirm}
            >
              <Text style={styles.ctaText}>Confirm Reservation</Text>
            </Pressable>

            {/* Cancel button */}
            <Pressable
              style={({ pressed }) => [styles.cancel, pressed && styles.cancelPressed]}
              onPress={() => nav.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 20, justifyContent: "center", flexGrow: 1 },
  card: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary, marginBottom: 18, textAlign: "center" },
  field: { marginBottom: 14 },
  label: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  labelBold: { fontWeight: "800", color: theme.colors.textPrimary },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 10,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E6EDF8",
  },
  cta: { marginTop: 10, backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: "center" },
  ctaPressed: { opacity: 0.92 },
  ctaText: { color: theme.colors.onPrimary, fontWeight: "800" },
  cancel: { marginTop: 12, alignItems: "center" },
  cancelPressed: { opacity: 0.7 },
  cancelText: { color: theme.colors.textSecondary },
});
