import React from "react";
import { ColorSchemeName } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../screens/Splash/Splash";
import Onboarding from "../screens/Onboarding/Onboarding";
import Dashboard from "../screens/Dashboard/Dashboard";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import GuestAccess from "../screens/Auth/GuestAccess";
import LotMap from "../screens/LotMap/LotMap";
import SlotDetails from "../screens/SlotDetails/SlotDetails";
import ReservationFlow from "../screens/Reservation/ReservationFlow";
import Notifications from "../screens/Notifications/Notifications";
import AdminDashboard from "../screens/Admin/AdminDashboard";
import Settings from "../screens/Settings/Settings";
import { useColorScheme } from "react-native";
import { ModeContext } from "../context/ModeContext";
import { AuthContext } from "../context/AuthContext";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  GuestAccess: undefined;
  Dashboard: undefined;
  LotMap: undefined;
  SlotDetails: { slotId?: string } | undefined;
  ReservationFlow: { slotId?: string } | undefined;
  Notifications: undefined;
  AdminDashboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator(): JSX.Element {
  const colorScheme: ColorSchemeName = useColorScheme();
  // Basic theme switch: extend as needed
  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  // Simple contexts: real implementations live in src/context/*
  return (
    <ModeContext.Provider value={{ mode: "mock", setMode: () => {} }}>
      <AuthContext.Provider value={{ user: null, signIn: async () => {}, signOut: async () => {} }}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            {/* Public / onboarding flow */}
            <Stack.Screen name="Splash" component={Splash} />
            <Stack.Screen name="Onboarding" component={Onboarding} />

            {/* Auth flow */}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="GuestAccess" component={GuestAccess} />

            {/* Main app */}
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="LotMap" component={LotMap} />
            <Stack.Screen name="SlotDetails" component={SlotDetails} />
            <Stack.Screen name="ReservationFlow" component={ReservationFlow} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Settings" component={Settings} />

            {/* Admin (guarded in UI; nav only here) */}
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </ModeContext.Provider>
  );
}
