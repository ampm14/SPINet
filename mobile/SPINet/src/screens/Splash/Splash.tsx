// src/screens/Splash/Splash.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  AccessibilityRole,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SvgUri } from "react-native-svg";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";

export default function Splash(): JSX.Element {
  const router = useRouter();
  const { signIn } = useAuth();
  const [svgFailed, setSvgFailed] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleContinue = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (typeof signIn === "function") {
        // lightweight guest sign-in so downstream screens can read user if needed
        await signIn({ id: "guest", name: "Guest" });
      } else {
        // defensive: don't crash if signIn isn't wired yet
        // eslint-disable-next-line no-console
        console.warn("signIn is not a function:", signIn);
      }

      // navigate using expo-router; replace to avoid back stack to splash
      router.replace("/onboarding");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("handleContinue error:", err);
      Alert.alert("Navigation error", "Unable to continue. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (typeof signIn === "function") {
        await signIn({ id: "guest", name: "Guest" });
      } else {
        // eslint-disable-next-line no-console
        console.warn("signIn is not a function:", signIn);
      }
      router.replace("/dashboard");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("handleGuest error:", err);
      Alert.alert("Navigation error", "Unable to continue as guest. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  // local assets
  const svgModule = require("../../../assets/icons/spinet-logo.svg");
  const pngModule = require("../../../assets/images/logo.png");

  return (
    <SafeAreaView style={styles.container}>
      <View accessible accessibilityRole="header" style={styles.brandWrap}>
        <View style={styles.logoBox} accessible accessibilityLabel="SPINet logo">
          {!svgFailed ? (
            <SvgUri
              width={160}
              height={160}
              uri={svgModule as any} // keep existing behaviour; if this causes issues, swap to Image or SvgXml
              onLoad={() => setLogoLoading(false)}
              onError={() => {
                setSvgFailed(true);
                setLogoLoading(false);
              }}
            />
          ) : (
            <Image
              source={pngModule}
              style={styles.logoImg}
              onLoadEnd={() => setLogoLoading(false)}
              resizeMode="contain"
              accessible
              accessibilityLabel="SPINet logo"
            />
          )}

          {logoLoading && (
            <ActivityIndicator
              style={styles.logoSpinner}
              size="small"
              color={theme.colors.primary}
            />
          )}
        </View>

        <Text style={styles.title}>SPINet</Text>
        <Text style={styles.tagline}>Smart Parking IoT Network</Text>
      </View>

      <View style={styles.ctaWrap}>
        <Pressable
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel="Continue to onboarding"
          onPress={handleContinue}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            busy && styles.primaryButtonDisabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Get started</Text>
          )}
        </Pressable>

        <Pressable
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel="Continue as guest"
          onPress={handleGuest}
          disabled={busy}
          style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}
        >
          <Text style={styles.linkText}>Continue as guest</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Detect. Connect. Park smart with SPINet.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  brandWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  logoBox: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoImg: {
    width: 160,
    height: 160,
  },
  logoSpinner: {
    position: "absolute",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 6,
    letterSpacing: 0.6,
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  ctaWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  linkPressed: {
    opacity: 0.7,
  },
  footer: {
    paddingBottom: 8,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
