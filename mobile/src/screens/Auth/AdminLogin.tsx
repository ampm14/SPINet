import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";

export default function AdminLogin() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Login Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
  text: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "600" },
});
