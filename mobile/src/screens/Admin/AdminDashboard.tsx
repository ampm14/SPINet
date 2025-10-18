import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Dashboard (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" },
  text: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "600" },
});
