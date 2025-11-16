import React from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";

export default function ReservationSuccess(): JSX.Element {
  const nav = useNavigation<any>();
  const route = useRoute<any>();

  const { slotId } = route.params ?? {};

  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 25 }}>
        <MaterialIcons name="check-circle" size={130} color="#2ecc71" />
      </Animated.View>

      <Text style={styles.title}>Reserved!</Text>

      <Text style={styles.msg}>
        Slot <Text style={styles.bold}>{slotId}</Text> has been successfully reserved.
      </Text>

      <Pressable
        style={styles.cta}
        onPress={() =>
          nav.reset({
            index: 0,
            routes: [
              {
                name: "UserDashboard",
                params: { reservedSlot: { slotId, status: "reserved" } },
              },
            ],
          })
        }
      >
        <Text style={styles.ctaText}>Back to Map</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  msg: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  bold: { fontWeight: "800", color: theme.colors.textPrimary },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: { color: theme.colors.onPrimary, fontWeight: "800", fontSize: 16 },
});
