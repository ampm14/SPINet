// src/screens/Auth/Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../styles/theme";

export default function Login(): JSX.Element {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (busy) return;
    if (!username.trim()) {
      Alert.alert("Validation", "Please enter a username.");
      return;
    }

    setBusy(true);
    try {
      // signIn is a placeholder in the provided AuthContext; it accepts {id,name}
      if (typeof signIn === "function") {
        await signIn({ id: username.trim(), name: username.trim() });
      } else {
        // defensive fallback
        // eslint-disable-next-line no-console
        console.warn("signIn not available:", signIn);
      }
      router.replace("/dashboard");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("login failed:", err);
      Alert.alert("Login error", "Unable to sign in. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.sub}>Use any username for now (guest mode).</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor={theme.colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          accessibilityLabel="Sign in"
          accessibilityRole="button"
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.replace("/dashboard")}
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
          accessibilityLabel="Continue as guest"
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>Continue as guest</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: "center", padding: 20 },
  card: { backgroundColor: theme.colors.cardBackground ?? "#0a0a0a", padding: 20, borderRadius: 12 },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 6 },
  sub: { color: theme.colors.textSecondary, marginBottom: 12 },
  input: {
    backgroundColor: theme.colors.surface ?? "#111",
    color: theme.colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: theme.colors.onPrimary, fontWeight: "700" },
  link: { alignItems: "center", paddingVertical: 8 },
  linkPressed: { opacity: 0.7 },
  linkText: { color: theme.colors.primary, fontWeight: "600" },
});
