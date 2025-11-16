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
  Animated,
  Easing,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { LineChart } from "react-native-gifted-charts";
import { fetchLiveSensor } from "../../api/sensors";

// Status thresholds
const OK_MS = 5 * 60 * 1000;      // 5 minutes
const STALE_MS = 10 * 60 * 1000;  // 10 minutes

type Reading = { ts: string; distanceCm: number };

export interface Sensor {
  sensorId: string;
  distanceCm: number | null;
  isConnected: boolean;
  lastSeen: string | null;
  rssiDbm: number | null;
  readingHistory: Reading[];
}

function fmtTimeShort(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString();
}

// --- Hardcoded 4x4 sensor grid ---
const initialSensors: Sensor[] = [
  { sensorId: "A1", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "A2", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "A3", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "A4", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "B1", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "B2", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "B3", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "B4", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "C1", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "C2", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "C3", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "C4", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "D1", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "D2", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "D3", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
  { sensorId: "D4", distanceCm: null, isConnected: false, lastSeen: null, rssiDbm: null, readingHistory: [] },
];

export default function SensorHealth(): JSX.Element {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [selected, setSelected] = useState<Sensor | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  /** Merge live backend readings INTO hardcoded sensors */
  const loadSensors = useCallback(async () => {
    const data = await fetchLiveSensor();
    if (!data) return;

    const now = Date.now();

    setSensors((prev) => {
      return prev.map((s) => {
        const live = data[s.sensorId];

        if (live) {
          return {
            ...s,
            distanceCm: live.distance,
            lastSeen: live.timestamp,
            isConnected: true,
            readingHistory: [
              { ts: live.timestamp, distanceCm: live.distance },
              ...(s.readingHistory?.slice(0, 20) ?? []),
            ],
          };
        } else {
          const last = s.lastSeen ? new Date(s.lastSeen).getTime() : 0;
          const diff = now - last;

          const isConnected = diff <= OK_MS ? true : diff <= STALE_MS ? false : false;

          return { ...s, isConnected };
        }
      });
    });
  }, []);

  useEffect(() => {
    loadSensors();
  }, []);

  const ordered = useMemo(() => [...sensors].sort((a, b) => a.sensorId.localeCompare(b.sensorId)), [sensors]);

  const columns = 4;
  const screenW = Dimensions.get("window").width;
  const gridPadding = 24;
  const gap = 14;
  const tileSize = Math.floor((screenW - gridPadding * 2 - gap * (columns - 1)) / columns);

  const sensorIcon = require("../../../assets/images/sensor.png");

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Sensor Health</Text>
          <Text style={styles.subheader}>Live ultrasonic sensor status</Text>
        </View>

        <Pressable style={styles.refreshBtn} onPress={loadSensors}>
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
            const now = Date.now();
            const last = s.lastSeen ? new Date(s.lastSeen).getTime() : 0;
            const diff = now - last;

            let status = "DOWN";
            let color = "#EF4444";

            if (diff <= OK_MS) {
              status = "OK";
              color = "#10B981";
            } else if (diff <= STALE_MS) {
              status = "STALE";
              color = "#F59E0B";
            }

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
                      borderColor: color,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Animated.View
                    style={[styles.iconContainer, { transform: [{ scale: status === "OK" ? scale : 1 }] }]}
                  >
                    <Image source={sensorIcon} style={[styles.iconImage, { tintColor: color }]} resizeMode="contain" />
                  </Animated.View>

                  <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
                    <Text style={[styles.statusPillText, { color }]}>{status}</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.slotBelow}>{s.sensorId}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selected?.sensorId}
                </Text>
                <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
                  <Text style={styles.closeTxt}>Close</Text>
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <Text style={styles.sectionRow}>
                  <Text style={styles.bold}>Last seen:</Text> {fmtTimeShort(selected?.lastSeen)}
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

// --- Styles (unchanged) ---
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

  gridContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  tile: {
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },

  iconContainer: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconImage: { width: 48, height: 48 },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 12,
    maxHeight: "85%",
    padding: 14,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary },
  closeBtn: { padding: 6 },
  closeTxt: { color: theme.colors.primary, fontWeight: "700" },

  section: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: "#eee", paddingTop: 8 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  sectionRow: { color: theme.colors.textSecondary, marginBottom: 6, fontSize: 13 },
  bold: { fontWeight: "700", color: theme.colors.textPrimary },

  readRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  readTs: { color: theme.colors.textSecondary },
  readVal: { color: theme.colors.textPrimary, fontWeight: "700" },
});
