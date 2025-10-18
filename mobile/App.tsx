import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AppNavigator from "./src/navigation/AppNavigator";

SplashScreen.preventAutoHideAsync(); // stop the default white splash

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      // Add any async loading (fonts, data, etc.) here if needed
      await new Promise((r) => setTimeout(r, 500)); // brief delay
      await SplashScreen.hideAsync(); // hide only when ready
    };
    prepare();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
