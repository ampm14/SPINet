import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { theme } from "../../styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Signup({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Parker" | null>(null);
  const [loading, setLoading] = useState(false);

const handleSignup = async () => {
  if (!name || !email || !password || !role) {
    Alert.alert("Missing info", "Please fill out all fields.");
    return;
  }

  setLoading(true);

  try {
    const existingRaw = await AsyncStorage.getItem("users");
    const existing = existingRaw ? JSON.parse(existingRaw) : [];

    // Check for existing email
    const alreadyExists = existing.some(
      (u: any) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert("Duplicate Account", "An account with this email already exists.");
      setLoading(false);
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...existing, newUser];
    await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

    Alert.alert("Success", `Account created for ${name} (${role}).`);
    navigation.navigate("Welcome");
  } catch (err) {
    console.error("Signup error:", err);
    Alert.alert("Error", "Something went wrong during signup.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={theme.colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={theme.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.roleLabel}>Select Role</Text>
      <View style={styles.roleRow}>
        <Pressable
          style={[
            styles.roleBtn,
            role === "Admin" && styles.roleBtnActive,
          ]}
          onPress={() => setRole("Admin")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Admin" && styles.roleTextActive,
            ]}
          >
            Admin
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleBtn,
            role === "Parker" && styles.roleBtnActive,
          ]}
          onPress={() => setRole("Parker")}
        >
          <Text
            style={[
              styles.roleText,
              role === "Parker" && styles.roleTextActive,
            ]}
          >
            Parker
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.submitBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </Pressable>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("Welcome")}
        >
          Log in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 24,
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
  roleLabel: {
    color: theme.colors.textSecondary,
    fontWeight: "500",
    marginTop: 8,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  roleBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  roleTextActive: {
    color: theme.colors.onPrimary,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    marginTop: 18,
    color: theme.colors.textSecondary,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
