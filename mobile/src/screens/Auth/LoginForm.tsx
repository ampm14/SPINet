import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../../styles/theme";

/**
 * LoginForm
 * Props:
 *  - expectedRole?: "Admin" | "Parker" (if provided, require user.role === expectedRole)
 *  - onSuccess: (user) => void
 */
export default function LoginForm({
  expectedRole,
  onSuccess,
  showGuest = true,
}: {
  expectedRole?: "Admin" | "Parker";
  onSuccess: (user: any) => void;
  showGuest?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing credentials", "Please provide email and password.");
      return;
    }

    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem("users");
      const users = raw ? JSON.parse(raw) : [];

      const found = users.find(
        (u: any) =>
          u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (!found) {
        Alert.alert("Invalid credentials", "Email or password is incorrect.");
        return;
      }

      if (expectedRole && found.role !== expectedRole) {
        Alert.alert(
          "Wrong role",
          `This login requires role "${expectedRole}". Your account is "${found.role}".`
        );
        return;
      }

      // success
      onSuccess(found);
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Unable to read users storage.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign in</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.btnText}>Sign in</Text>
        )}
      </Pressable>

      {showGuest && (
        <View style={styles.guestRow}>
          <Text style={styles.guestText}>Or</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, width: "100%" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border ?? "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    backgroundColor: theme.colors.surface ?? "#fff",
  },
  btn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: theme.colors.onPrimary, fontWeight: "600", fontSize: 16 },
  guestRow: { alignItems: "center", marginTop: 12 },
  guestText: { color: theme.colors.textSecondary },
});
