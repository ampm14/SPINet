import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { theme } from "../../styles/theme";

export default function Welcome({ navigation }: any) {
  const logo = require("../../../assets/images/logo.png");

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>SPINet</Text>
      <Text style={styles.subtitle}>Smart Parking IoT Network</Text>

      <View style={styles.section}>
        <Text style={styles.prompt}>Continue as</Text>
        <View style={styles.roleRow}>
          <Pressable
            style={({ pressed }) => [
              styles.roleBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => navigation.navigate("AdminLogin")}
          >
            <Text style={styles.roleText}>Admin</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.roleBtnOutline,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => navigation.navigate("UserLogin")}
          >
            <Text style={styles.roleTextOutline}>Parker</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          New user?{" "}
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: { width: 160, height: 160, marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontSize: 14,
  },
  section: { marginTop: 40, width: "100%", alignItems: "center" },
  prompt: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  roleRow: { flexDirection: "row", gap: 16 },
  roleBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  roleBtnOutline: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  roleText: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  roleTextOutline: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  footer: { position: "absolute", bottom: 40 },
  footerText: { color: theme.colors.textSecondary },
  linkText: { color: theme.colors.primary, fontWeight: "600" },
});
