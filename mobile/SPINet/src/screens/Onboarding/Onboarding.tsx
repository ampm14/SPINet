// src/screens/Onboarding/Onboarding.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
  Pressable,
  Platform,
  AccessibilityRole,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../styles/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  image?: any;
};

const slides: Slide[] = [
  {
    key: "s1",
    title: "Detect smarter",
    subtitle: "Sensors identify every free parking slot instantly — no more circling.",
  },
  {
    key: "s2",
    title: "View in real-time",
    subtitle: "See live availability and slot health at a glance.",
  },
  {
    key: "s3",
    title: "Reserve & navigate",
    subtitle: "Reserve a slot, get directions, and arrive with confidence.",
  },
];

export default function Onboarding(): JSX.Element {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(0);

  const pngLogo = require("../../../assets/images/logo.png");

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / SCREEN_WIDTH);
    if (newIndex !== index) setIndex(newIndex);
  }

  function goToSlide(i: number) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
    setIndex(i);
  }

  function handleNext() {
    if (index < slides.length - 1) {
      goToSlide(index + 1);
    } else {
      // finish onboarding -> go to Login (or Dashboard)
      router.replace("/login"); // create app/login or app/login/index.tsx as needed
    }
  }

  function handleSkip() {
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRight}>
        <Pressable
          onPress={handleSkip}
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel="Skip onboarding"
          style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {slides.map((s) => (
          <View key={s.key} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.imageWrap}>
              <Image
                source={pngLogo}
                style={styles.image}
                resizeMode="contain"
                accessible
                accessibilityLabel="SPINet logo"
              />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsRow} accessible accessibilityRole="tablist">
          {slides.map((_, i) => (
            <Pressable
              key={`dot-${i}`}
              onPress={() => goToSlide(i)}
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel={`Go to slide ${i + 1}`}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            onPress={handleNext}
            accessibilityRole={"button" as AccessibilityRole}
            accessibilityLabel={index < slides.length - 1 ? "Next" : "Get started"}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>
              {index < slides.length - 1 ? "Next" : "Get started"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/dashboard")}
            accessibilityRole={"button" as AccessibilityRole}
            accessibilityLabel="Continue as guest"
            style={({ pressed }) => [styles.ghostButton, pressed && styles.ghostPressed]}
          >
            <Text style={styles.ghostText}>Continue as guest</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topRight: {
    alignItems: "flex-end",
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    paddingRight: 20,
  },
  skipBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  skipPressed: { opacity: 0.6 },
  skipText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "500" },
  scrollContent: { alignItems: "center" },
  slide: { flex: 1, alignItems: "center", paddingHorizontal: 28, paddingTop: 10 },
  imageWrap: { height: 260, alignItems: "center", justifyContent: "center", marginTop: 8 },
  image: { width: 220, height: 220 },
  textWrap: { marginTop: 6, alignItems: "center", paddingHorizontal: 6 },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", color: theme.colors.textSecondary, lineHeight: 20 },
  footer: { paddingBottom: 32, paddingHorizontal: 20 },
  dotsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  dot: { width: 10, height: 10, borderRadius: 6, marginHorizontal: 6 },
  dotActive: { backgroundColor: theme.colors.primary, transform: [{ scale: 1.1 }] },
  dotInactive: { backgroundColor: theme.colors.textSecondary, opacity: 0.25 },
  ctaRow: { flexDirection: "column", alignItems: "center", gap: 10 },
  primaryButton: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonPressed: { opacity: 0.9 },
  primaryButtonText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: "600" },
  ghostButton: { paddingVertical: 8 },
  ghostPressed: { opacity: 0.7 },
  ghostText: { color: theme.colors.primary, fontSize: 15, fontWeight: "500" },
});
