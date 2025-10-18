// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Splash from "../screens/Auth/Splash";
import Welcome from "../screens/Auth/Welcome";
import AdminLogin from "../screens/Auth/AdminLogin";
import UserLogin from "../screens/Auth/UserLogin";
import Signup from "../screens/Auth/Signup";

import AdminDashboard from "../screens/Admin/AdminDashboard";
import ParkingLot from "../screens/Admin/ParkingLot";
import SensorHealth from "../screens/Admin/SensorHealth";

import UserDashboard from "../screens/Parker/UserDashboard";
import ReservationForm from "../screens/Parker/ReservationForm";
import ReservationSuccess from "../screens/Parker/ReservationSuccess";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* AUTH */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen name="UserLogin" component={UserLogin} />
        <Stack.Screen name="Signup" component={Signup} />

        {/* ADMIN */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="LotMap" component={ParkingLot} />
        <Stack.Screen name="SensorHealth" component={SensorHealth} />

        {/* USER (alias included temporarily) */}
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="ParkerDashboard" component={UserDashboard} />
        <Stack.Screen name="ReservationForm" component={ReservationForm} />
        <Stack.Screen name="ReservationSuccess" component={ReservationSuccess} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
