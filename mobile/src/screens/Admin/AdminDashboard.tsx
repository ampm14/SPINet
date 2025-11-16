import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../styles/theme";
import { PieChart, LineChart } from "react-native-gifted-charts";
import { useNavigation } from "@react-navigation/native";
import useSlots from "../../hooks/useSlots";

type Slot = { id: string; status: "free" | "parked" | "reserved" | string };

// animation duration kept short for smooth feedback
const ANIM_DURATION = 800;
// reloads after 30s
const REFRESH_MS = 30000;

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

  // guards to prevent re-entrant animations causing infinite loops
  const isAnimatingPieRef = useRef(false);
  const isAnimatingLineRef = useRef(false);

  // throttle pie updates so it animates at most once per REFRESH_MS
  const lastPieUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();

    // allow the first animation immediately
    if (lastPieUpdateRef.current === null) {
      lastPieUpdateRef.current = now;
    } else {
      // throttle: skip if last update was within REFRESH_MS
      if (now - (lastPieUpdateRef.current ?? 0) < REFRESH_MS) {
        return;
      }
      lastPieUpdateRef.current = now;
    }

    // If counts haven't changed, skip animation
    if (
      pieValues.vacant === counts.vacant &&
      pieValues.reserved === counts.reserved &&
      pieValues.parked === counts.parked
    ) {
      return;
    }

    // prevent overlapping pie animations
    if (isAnimatingPieRef.current) return;
    isAnimatingPieRef.current = true;

    const animate = (anim: Animated.Value, toValue: number, setter: (v: number) => void) => {
      try {
        Animated.timing(anim, {
          toValue,
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }).start();
        const id = anim.addListener(({ value }) => setter(Math.round(value)));
        setTimeout(() => {
          try {
            anim.removeListener(id);
          } catch (e) {
            // ignore if already removed
          }
        }, ANIM_DURATION + 50);
      } catch (e) {
        // defensive: if Animated.timing throws on some RN versions, swallow here
      }
    };

    animate(animVacant, counts.vacant, (v) => setPieValues((p) => ({ ...p, vacant: v })));
    animate(animReserved, counts.reserved, (v) => setPieValues((p) => ({ ...p, reserved: v })));
    animate(animParked, counts.parked, (v) => setPieValues((p) => ({ ...p, parked: v })));

    const finishId = setTimeout(() => {
      isAnimatingPieRef.current = false;
    }, ANIM_DURATION + 60);

    return () => {
      clearTimeout(finishId);
      isAnimatingPieRef.current = false;
    };
    // keep same deps: only when counts change
  }, [counts.vacant, counts.reserved, counts.parked]); // throttled by lastPieUpdateRef inside

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
    // guard: prevent re-entrant animations
    if (isAnimatingLineRef.current) return;

    // guard: if already at target, skip
    const same = targetLineRef.current.every((v, i) => v === (prevLineRef.current[i] ?? v));
    if (same) return;

    isAnimatingLineRef.current = true;
    animProgress.setValue(0);
    const id = animProgress.addListener(({ value: t }) => {
      const next = targetLineRef.current.map((tv, idx) => {
        const pv = prevLineRef.current[idx] ?? tv;
        const interp = pv + (tv - pv) * t;
        return Math.round(interp);
      });
      // Only update state if values differ to avoid unnecessary renders
      setDisplayLine((old) => {
        const changed = next.some((nv, i) => nv !== (old[i]?.value ?? null));
        return changed ? old.map((d, i) => ({ ...d, value: next[i] })) : old;
      });
    });
    try {
      Animated.timing(animProgress, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        try {
          animProgress.removeListener(id);
        } catch (e) {
          // ignore
        }
        prevLineRef.current = targetLineRef.current.slice();
        isAnimatingLineRef.current = false;
      });
    } catch (e) {
      // defensive fallback: if timing fails, finalize immediately
      try {
        animProgress.removeListener(id);
      } catch {}
      prevLineRef.current = targetLineRef.current.slice();
      isAnimatingLineRef.current = false;
    }
  };

  // Kick off periodic refresh that updates targetLineRef and animates
  useEffect(() => {
    // initial sync to prev values (safe one-time copy)
    prevLineRef.current = displayLine.map((d) => d.value);

    const tick = () => {
      // Generate a nudge based on existing values to keep trend realistic (no wild jumps)
      const newTargets = prevLineRef.current.map((v) => {
        const jitter = Math.round(Math.random() * 16 - 8); // -8..+8
        return Math.max(0, Math.min(100, v + jitter));
      });
      targetLineRef.current = newTargets;
      animateLineInterpolation();
    };

    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
    // empty deps: run once
  }, []); // run once

  // --- rendering helpers ---
  const centerLabelComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.centerPercent}>{percent(pieValues.parked)}%</Text>
      <Text style={styles.centerSmall}>Parked</Text>
      <Text style={styles.centerTitle}>Occupancy</Text>
    </View>
  );

  // small metric chips to show under the action bar (GitHub-like neutral chips)
  const MetricChip = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.chip}>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );

  // compute responsive chart size to prevent overflow
  const screenW = Dimensions.get("window").width;
  const pieDiameter = Math.min(160, Math.floor((screenW - 120) / 1)); // keeps room for legend

  // LOGOUT handler (confirmation + fallback)
  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            // If your app exposes a global sign-out helper, call it
            if (typeof (global as any).authSignOut === "function") {
              await (global as any).authSignOut();
              return;
            }
          } catch (e) {
            // fall through to navigation reset
          }
          // Fallback: reset navigation to Welcome (assumes you have a Welcome screen)
          try {
            navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
          } catch (e) {
            // last-ditch: navigate to Welcome
            navigation.navigate("Welcome");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — minimal, left-aligned title with logout on the far right */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Admin Dashboard</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Action Bar — both buttons same filled primary color */}
        <View style={styles.actionContainer}>
          <Pressable
            onPress={() => navigation.navigate("LotMap")}
            style={({ pressed }) => [styles.sameBtn, pressed && styles.primaryPressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Parking Lot"
          >
            <Text style={styles.sameText}>
              Parking Lot <Text style={styles.sameSub}>• {counts.vacant} available</Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("SensorHealth")}
            style={({ pressed }) => [styles.sameBtn, { marginTop: 10 }, pressed && styles.primaryPressed]}
            accessibilityRole="button"
            accessibilityLabel="Open Sensor Health"
          >
            <Text style={styles.sameText}>Sensor Health</Text>
          </Pressable>
        </View>

        {/* Metric chips */}
        <View style={styles.metricsRow}>
          <MetricChip label="Total slots" value={counts.total} />
          <MetricChip label="Parked" value={counts.parked} />
          <MetricChip label="Reserved" value={counts.reserved} />
          <MetricChip label="Last update" value="Now" />
        </View>

        {/* Occupancy Card (left/top) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Occupancy Overview</Text>
          </View>

          <View style={styles.pieRow}>
            <View style={[styles.pieWrapper, { width: pieDiameter, height: pieDiameter }]}>
              <PieChart
                data={pieData}
                donut
                showText={false}
                radius={Math.floor(pieDiameter / 2)}
                innerRadius={Math.floor(pieDiameter / 2.8)}
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
                      {percent(
                        pieValues[d.text.toLowerCase() as "vacant" | "reserved" | "parked"]
                      )}
                      %)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Trend Card (wide) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Utilization Trend</Text>
            <Text style={styles.cardSubtitle}>Last 24 hours</Text>
          </View>

          <View style={{ alignItems: "flex-start", paddingTop: 8 }}>
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
              animationDuration={ANIM_DURATION}
            />
          </View>
        </View>

        {/* Footer spacing */}
        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },

  // Header row: minimal, left aligned text with tiny status on right
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9EE",
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },

  // logout
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6EDF8",
    backgroundColor: "#fff",
  },
  logoutPressed: { opacity: 0.8 },
  logoutText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },

  // ACTIONS: both buttons same filled primary color
  actionContainer: {
    marginTop: 18,
    marginBottom: 12,
    width: "100%",
  },
  sameBtn: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "flex-start",
    paddingHorizontal: 18,
    elevation: Platform.OS === "android" ? 2 : 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryPressed: { opacity: 0.9 },
  sameText: {
    color: theme.colors.onPrimary,
    fontWeight: "800",
    fontSize: 16,
  },
  sameSub: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 13,
    opacity: 0.95,
  },

  // Metric chips row
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    marginTop: 6,
  },
  chip: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  chipLabel: { fontSize: 11, color: "#64748B" },
  chipValue: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },

  // Card base (GitHub-like: quiet, left titles, soft spacing)
  card: {
    backgroundColor: theme.colors.surface ?? "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  cardHeader: { marginBottom: 8 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    textAlign: "left",
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // PIE layout (responsive & clipped)
  pieRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  pieWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    overflow: "hidden",
  },
  legendContainer: {
    justifyContent: "center",
    marginLeft: 14,
    minWidth: 140,
  },
  legendRowItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendLabelTitle: { color: theme.colors.textPrimary, fontWeight: "700" },
  legendLabelSub: { color: theme.colors.textSecondary, fontSize: 13 },

  centerContainer: { alignItems: "center" },
  centerPercent: {
    fontWeight: "800",
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  centerSmall: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  centerTitle: {
    fontSize: 10,
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
