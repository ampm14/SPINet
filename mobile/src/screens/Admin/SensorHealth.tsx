// src/screens/Admin/SensorHealth.tsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { mockSensors, generateMockData } from "../../data/mockData";
import { LineChart } from "react-native-gifted-charts";

type Sensor = typeof mockSensors[number];
const STALE_MS = 2 * 60 * 1000; // 2 minutes

function fmtTimeShort(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString();
}
function isStale(lastSeen?: string | null) {
  if (!lastSeen) return true;
  return Date.now() - new Date(lastSeen).getTime() > STALE_MS;
}

export default function SensorHealth(): JSX.Element {
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [selected, setSelected] = useState<Sensor | null>(null);

  // Pulse animation
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const ordered = useMemo(() => [...sensors].sort((a, b) => a.slotId.localeCompare(b.slotId)), [sensors]);

  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor((screenW - gridPadding * 2 - gap * (columns - 1)) / columns);

  const onRefresh = useCallback(() => {
    const { sensors: newSensors } = generateMockData();
    setSensors(newSensors);
  }, []);

  const sensorIcon = require("../../../assets/images/sensor.png");

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Sensor Health</Text>
          <Text style={styles.subheader}>Ultrasonic sensors — grid view</Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshTxt}>Refresh</Text>
        </Pressable>
      </View>

      <View style={[styles.gridContainer, { paddingHorizontal: gridPadding }]}>
        <View
          style={{
            width: tileSize * columns + gap * (columns - 1),
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {ordered.map((s, idx) => {
            const stale = isStale(s.lastSeen);
            const status = !s.isConnected ? "DOWN" : stale ? "STALE" : "OK";
            const statusColor = !s.isConnected ? "#EF4444" : stale ? "#F59E0B" : "#10B981";

            const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

            return (
              <View key={s.sensorId} style={{ alignItems: "center", marginBottom: gap }}>
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => setSelected(s)}
                  style={[
                    styles.tile,
                    {
                      width: tileSize,
                      height: tileSize,
                      marginRight: (idx + 1) % columns === 0 ? 0 : gap,
                      borderColor: statusColor,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Animated.View style={[styles.iconContainer, { transform: [{ scale: status === "OK" ? scale : 1 }] }]}>
                    <Image source={sensorIcon} style={[styles.iconImage, { tintColor: statusColor }]} resizeMode="contain" />
                  </Animated.View>

                  <View style={[styles.statusPill, { backgroundColor: status === "OK" ? `${statusColor}20` : `${statusColor}22` }]}>
                    <Text style={[styles.statusPillText, { color: statusColor }]}>{status}</Text>
                  </View>
                </TouchableOpacity>

                {/* Slot label OUTSIDE the box, below */}
                <Text style={styles.slotBelow}>{s.slotId}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Modal: sensor details */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selected?.sensorId} · {selected?.slotId}</Text>
                <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
                  <Text style={styles.closeTxt}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Connected:</Text> {selected?.isConnected ? "Yes" : "No"}
                </Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Last seen:</Text> {fmtTimeShort(selected?.lastSeen)}
                </Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Signal:</Text> {selected?.rssiDbm ?? "—"} dBm
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent readings</Text>
                {selected?.readingHistory?.length ? (
                  selected.readingHistory.map((r) => (
                    <View key={r.ts} style={styles.readRow}>
                      <Text style={styles.readTs}>{new Date(r.ts).toLocaleTimeString()}</Text>
                      <Text style={styles.readVal}>{r.distanceCm} cm</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sectionRow}>No recent readings</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sparkline</Text>
                <View style={{ alignItems: "center" }}>
                  <LineChart
                    data={(selected?.readingHistory ?? []).map((r) => ({ value: r.distanceCm, label: "" }))}
                    hideDataPoints
                    hideRules
                    color={theme.colors.primary}
                    thickness={2}
                    areaChart
                    curved
                    noOfSections={2}
                    startFillOpacity={0.08}
                    endFillOpacity={0.02}
                    width={Dimensions.get("window").width * 0.9}
                    height={120}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  header: { fontSize: 20, fontWeight: "800", color: theme.colors.textPrimary },
  subheader: { color: theme.colors.textSecondary, fontSize: 13 },

  refreshBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  refreshTxt: { color: theme.colors.onPrimary, fontWeight: "800" },

  gridContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 8 },

  tile: {
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    // removed shadow on purpose per request
  },

  iconContainer: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconImage: {
    width: 48,
    height: 48,
  },

  statusPill: {
    position: "absolute",
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 12, fontWeight: "800" },

  slotBelow: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 },
  modalCard: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 12,
    maxHeight: "85%",
    padding: 14,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary },
  closeBtn: { padding: 6 },
  closeTxt: { color: theme.colors.primary, fontWeight: "700" },

  section: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 6 },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },

  readRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  readTs: { color: theme.colors.textSecondary },
  readVal: { color: theme.colors.textPrimary, fontWeight: "700" },
});
