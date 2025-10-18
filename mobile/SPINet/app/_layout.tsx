// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
// Replace provider names if your context files export different identifiers.
import { AuthProvider } from "../src/context/AuthContext";
import { ModeProvider } from "../src/context/ModeContext";

export default function Layout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ModeProvider>
          <Slot />
        </ModeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
