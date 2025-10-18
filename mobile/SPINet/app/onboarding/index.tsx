// app/onboarding/index.tsx
import React from "react";
import { useRouter } from "expo-router";
import Onboarding from "../../src/screens/Onboarding/Onboarding";

/**
 * Navigation shim for existing components that call navigation.navigate("X").
 * This wrapper passes a `navigation` prop implementing navigate(screen: string).
 * IMPORTANT: do not render <Slot /> here — that created an empty nested navigator.
 */
export default function OnboardingRoute(): JSX.Element {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      const s = (screen || "").toLowerCase();
      if (s === "dashboard" || s === "/dashboard") return router.replace("/dashboard");
      if (s === "login" || s === "/login") return router.replace("/login");
      if (s === "onboarding" || s === "/onboarding") return router.replace("/onboarding");
      if (screen.startsWith("/")) return router.replace(screen);
      return router.replace(`/${s}`);
    },
  };

  // Pass the shim only; do NOT render <Slot /> here.
  return <Onboarding {...({} as any)} navigation={navigation} />;
}
