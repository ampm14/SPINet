import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { PieChart, LineChart } from "react-native-gifted-charts";
import { useNavigation } from "@react-navigation/native";
import useSlots from "../../hooks/useSlots";

type Slot = { id: string; status: "free" | "parked" | "reserved" | string };

const ANIM_DURATION = 800;
const REFRESH_MS = 5000;

export default function AdminDashboard(): JSX.Element {
  const navigation = useNavigation<any>();
  const { slots = [], loading } = useSlots?.(4000) ?? { slots: [], loading: false };

  // --- PIE (unchanged logic) ---
  const [localSlots, setLocalSlots] = useState<Slot[]>(slots ?? []);
  useEffect(() => setLocalSlots(slots ?? []), [slots]);
  const safeSlots = localSlots.length
    ? localSlots
    : [
        { id: "S1", status: "free" },
        { id: "S2", status: "parked" },
        { id: "S3", status: "reserved" },
        { id: "S4", status: "free" },
      ];
  const computeCounts = (list: Slot[]) => {
    const total = list.length || 1;
    const vacant = list.filter((s) => s.status === "free").length;
    const reserved = list.filter((s) => s.status === "reserved").length;
    const parked = list.filter((s) => s.status === "parked").length;
    return { total, vacant, reserved, parked };
  };
  const counts = useMemo(() => computeCounts(safeSlots), [safeSlots]);

  // Animated numeric pie values (keeps previous behavior)
  const animVacant = useRef(new Animated.Value(0)).current;
  const animReserved = useRef(new Animated.Value(0)).current;
  const animParked = useRef(new Animated.Value(0)).current;
  const [pieValues, setPieValues] = useState({ vacant: 0, reserved: 0, parked: 0 });
  useEffect(() => {
    const animate = (anim: Animated.Value, toValue: number, setter: (v: number) => void) => {
      Animated.timing(anim, {
        toValue,
        duration: ANIM_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }).start();
      const id = anim.addListener(({ value }) => setter(Math.round(value)));
      setTimeout(() => anim.removeListener(id), ANIM_DURATION + 50);
    };
    animate(animVacant, counts.vacant, (v) => setPieValues((p) => ({ ...p, vacant: v })));
    animate(animReserved, counts.reserved, (v) => setPieValues((p) => ({ ...p, reserved: v })));
    animate(animParked, counts.parked, (v) => setPieValues((p) => ({ ...p, parked: v })));
  }, [counts.vacant, counts.reserved, counts.parked]);

  const pieData = [
    { value: pieValues.vacant, color: "#22C55E", text: "Vacant" },
    { value: pieValues.reserved, color: "#FACC15", text: "Reserved" },
    { value: pieValues.parked, color: "#EF4444", text: "Parked" },
  ];
  const totalForPercent = Math.max(1, pieValues.vacant + pieValues.reserved + pieValues.parked);
  const percent = (n: number) => Math.round((n / totalForPercent) * 100);

  // --- UTILIZATION TREND: fixed & animated ---
  // targetLine is the new values we want to animate to.
  const defaultLine = [
    { value: 20, label: "9 AM" },
    { value: 50, label: "11 AM" },
    { value: 75, label: "1 PM" },
    { value: 60, label: "3 PM" },
    { value: 90, label: "5 PM" },
    { value: 40, label: "7 PM" },
  ];
  // prevLineRef stores the last fully-rendered array; displayLine is what's passed to chart.
  const prevLineRef = useRef(defaultLine.map((d) => d.value));
  const [displayLine, setDisplayLine] = useState(defaultLine);
  const targetLineRef = useRef(defaultLine.map((d) => d.value));
  const animProgress = useRef(new Animated.Value(1)).current; // start at 1 so initial set is immediate

  // helper: smoothly interpolate from prevLineRef -> targetLineRef
  const animateLineInterpolation = (duration = ANIM_DURATION) => {
    animProgress.setValue(0);
    const id = animProgress.addListener(({ value: t }) => {
      const next = targetLineRef.current.map((tv, idx) => {
        const pv = prevLineRef.current[idx] ?? tv;
        const interp = pv + (tv - pv) * t;
        return Math.round(interp);
      });
      // update displayLine with labels preserved
      setDisplayLine((old) => old.map((d, i) => ({ ...d, value: next[i] })));
    });
    Animated.timing(animProgress, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      animProgress.removeListener(id);
      // finalize prevLineRef
      prevLineRef.current = targetLineRef.current.slice();
    });
  };

  // Kick off periodic refresh that updates targetLineRef and animates
  useEffect(() => {
    const tick = () => {
      // Generate a nudge based on existing values to keep trend realistic (no wild jumps)
      const newTargets = prevLineRef.current.map((v) => {
        const jitter = Math.round((Math.random() * 16 - 8)); // -8..+8
        return Math.max(0, Math.min(100, v + jitter));
      });
      targetLineRef.current = newTargets;
      animateLineInterpolation();
    };

    // initial sync to prev values (in case prev was default)
    prevLineRef.current = displayLine.map((d) => d.value);
    // start periodic
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []); // run once

  // also allow reacting to explicit external updates (if you later set targetLineRef externally)
  // example: whenever line source changes you can set targetLineRef.current and call animateLineInterpolation()

  // --- rendering helpers ---
  const centerLabelComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.centerPercent}>{percent(pieValues.parked)}%</Text>
      <Text style={styles.centerSmall}>Parked</Text>
      <Text style={styles.centerTitle}>Occupancy</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <Text style={styles.subheader}>
          {loading ? "Loading live slot data..." : `Monitoring ${counts.total} slots`}
        </Text>

        {/* PIE */}
        <View style={styles.card}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.cardTitleCentered}>Occupancy Overview</Text>
            <View style={styles.pieRow}>
              <View style={styles.pieWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  showText={false}
                  radius={100}
                  innerRadius={60}
                  showValuesAsLabels={false}
                  centerLabelComponent={centerLabelComponent}
                  animationDuration={ANIM_DURATION}
                />
              </View>
              <View style={styles.legendContainer}>
                {pieData.map((d) => (
                  <View key={d.text} style={styles.legendRowItem}>
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <View>
                      <Text style={styles.legendLabelTitle}>{d.text}</Text>
                      <Text style={styles.legendLabelSub}>
                        {pieValues[d.text.toLowerCase() as "vacant" | "reserved" | "parked"]} (
                        {percent(pieValues[d.text.toLowerCase() as "vacant" | "reserved" | "parked"])}
                        %)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* LINE CHART (fixed utilization trend) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Utilization Trend</Text>
          <View style={{ alignItems: "center" }}>
            <LineChart
              data={displayLine}
              hideDataPoints={false}
              dataPointsColor={theme.colors.primary}
              color={theme.colors.primary}
              curved
              yAxisTextStyle={{ color: theme.colors.textSecondary }}
              xAxisLabelTextStyle={{ color: theme.colors.textSecondary }}
              thickness={3}
              noOfSections={4}
              yAxisLabelTexts={["0%", "25%", "50%", "75%", "100%"]}
              yAxisLabelWidth={35}
              hideRules
              animationDuration={ANIM_DURATION} // many versions accept this; safety: we animate values ourselves
            />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("LotMap")}
          >
            <Text style={styles.navText}>Parking Lot</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.85 }]}
            onPress={() => navigation.navigate("SensorHealth")}
          >
            <Text style={styles.navText}>Sensor Health</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  subheader: { color: theme.colors.textSecondary, marginBottom: 16 },
  card: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  cardTitleCentered: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  pieRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  pieWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    height: 220,
  },
  legendContainer: {
    justifyContent: "center",
    marginLeft: 12,
    minWidth: 130,
  },
  legendRowItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendLabelTitle: { color: theme.colors.textPrimary, fontWeight: "600" },
  legendLabelSub: { color: theme.colors.textSecondary, fontSize: 13 },

  centerContainer: { alignItems: "center" },
  centerPercent: {
    fontWeight: "800",
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  centerSmall: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  centerTitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  btnRow: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 8 },
  navBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  navText: { color: theme.colors.onPrimary, fontWeight: "600", fontSize: 15 },
});
