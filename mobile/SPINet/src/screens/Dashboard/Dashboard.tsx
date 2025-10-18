import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../styles/theme";
import useSlots from "../../hooks/useSlots";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";


/**
 * Slot shape (kept local to avoid TS import complexity).
 * If you have a shared Slot type, replace with import.
 */
type Slot = {
  id: string;
  name: string;
  status: "free" | "occupied" | string;
  lat?: number;
  lng?: number;
};

function StatusPill({ status }: { status: string }) {
  const isFree = status === "free";
  const bg = isFree ? "#DFF7E6" : "#FFE6E6";
  const text = isFree ? "Free" : "Occupied";
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

/**
 * Try to require MapRenderer at runtime. If it's missing we simply render a placeholder.
 * Using require inside try/catch avoids hard build-time failure when the file isn't present.
 */
let MapRenderer: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("../../components/maps/MapRenderer");
  MapRenderer = mod?.default ?? null;
} catch (e) {
  MapRenderer = null;
}

export default function Dashboard(): JSX.Element {
   const router = useRouter();

  const logo = require("../../../assets/images/logo.png");
  const { slots, loading } = useSlots(5000);

  // derive stats
  const available = slots.filter((s) => s.status === "free").length;
  const occupied = slots.length - available;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>SPINet</Text>
          <Text style={styles.headerSubtitle}>Welcome back — live status below</Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available</Text>
          <Text style={styles.cardValue}>{loading ? "…" : String(available)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Occupied</Text>
          <Text style={styles.cardValue}>{loading ? "…" : String(occupied)}</Text>
        </View>
      </View>

      <View style={styles.mapPlaceholder}>
        {MapRenderer ? (
          // MapRenderer should accept slots prop; adapt if your component expects different props
          <MapRenderer style={{ flex: 1, width: "100%" }} slots={slots as Slot[]} />
        ) : (
          <>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.mapText}>
                [ Map placeholder — install/implement MapRenderer to replace this ]
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.listWrap}>
        <Text style={styles.sectionTitle}>Nearby slots</Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading slots…</Text>
          </View>
        ) : (
          <FlatList
            data={slots as Slot[]}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.slotRow}>
                <View>
                  <Text style={styles.slotName}>{item.name}</Text>
                  <Text style={styles.slotId}>#{item.id}</Text>
                </View>

                <View style={styles.rowRight}>
                  <StatusPill status={item.status} />
                  <Pressable
                    onPress={() => router.push({ pathname: "/reservation", params: { slotId: item.id } })}

                    style={styles.reserveBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Reserve slot ${item.name}`}
                  >
                    <Text style={styles.reserveText}>Reserve</Text>
                  </Pressable>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No slots available.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  headerLogo: { width: 56, height: 56, marginRight: 12 },
  headerInfo: {},
  headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary },
  headerSubtitle: { color: theme.colors.textSecondary, fontSize: 13 },
  quickRow: { flexDirection: "row", paddingHorizontal: 16, justifyContent: "space-between" },
  card: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground ?? theme.colors.surface ?? "#fff",
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { color: theme.colors.textSecondary, fontSize: 13 },
  cardValue: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginTop: 6 },
  mapPlaceholder: {
    height: 180,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border ?? "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mapText: { color: theme.colors.textSecondary },
  listWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    alignItems: "center",
  },
  separator: { height: 1, backgroundColor: theme.colors.border ?? "#E5E7EB" },
  slotName: { fontSize: 16, fontWeight: "600", color: theme.colors.textPrimary },
  slotId: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center" },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "600" },
  reserveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  reserveText: { color: theme.colors.onPrimary, fontWeight: "600" },
  loadingWrap: { alignItems: "center", paddingVertical: 24 },
  loadingText: { color: theme.colors.textSecondary, marginTop: 8 },
  emptyWrap: { alignItems: "center", paddingVertical: 24 },
  emptyText: { color: theme.colors.textSecondary },
});
