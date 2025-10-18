import React from "react";
import MapView, { Marker } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import type { Slot } from "../../types";
import { theme } from "../../styles/theme";

type Props = {
  slots: Slot[];
};

export default function MapRenderer({ slots }: Props): JSX.Element {
  if (!slots.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No slot data</Text>
      </View>
    );
  }

  // Default view — fit to markers later
  const initial = {
    latitude: slots[0].lat ?? 0,
    longitude: slots[0].lng ?? 0,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initial}
        mapType="standard"
      >
        {slots.map((s) => (
          <Marker
            key={s.id}
            coordinate={{
              latitude: s.lat ?? 0,
              longitude: s.lng ?? 0,
            }}
            pinColor={s.status === "free" ? "#16A34A" : "#DC2626"}
            title={`Slot ${s.name}`}
            description={`Status: ${s.status}`}
          />
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
        <Text style={styles.legendText}>Free</Text>
        <View style={{ width: 12 }} />
        <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
        <Text style={styles.legendText}>Occupied</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: 12, overflow: "hidden" },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  emptyText: { color: theme.colors.textSecondary },
  legend: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  legendDot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  legendText: { color: theme.colors.textPrimary },
});
