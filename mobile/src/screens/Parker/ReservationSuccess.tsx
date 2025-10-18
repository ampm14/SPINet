// src/screens/Parker/ReservationSuccess.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { theme } from "../../styles/theme";

export default function ReservationSuccess(): JSX.Element {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { slotId, name } = route.params ?? {};

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reserved!</Text>
      <Text style={styles.msg}>Slot <Text style={{fontWeight:'800'}}>{slotId}</Text> has been reserved for <Text style={{fontWeight:'800'}}>{name}</Text>.</Text>

      <Pressable style={styles.cta} onPress={() => nav.reset({ index: 0, routes: [{ name: "UserDashboard" }] })}>
        <Text style={styles.ctaText}>Back to Map</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:'center', backgroundColor: theme.colors.background },
  title: { fontSize:24, fontWeight:'900', color: theme.colors.textPrimary, marginBottom: 8 },
  msg: { color: theme.colors.textSecondary, marginBottom: 20 },
  cta: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems:'center' },
  ctaText: { color: theme.colors.onPrimary, fontWeight:'800' },
});
