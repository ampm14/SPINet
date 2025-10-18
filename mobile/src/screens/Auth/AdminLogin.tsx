import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginForm from "./LoginForm";
import { theme } from "../../styles/theme";

/**
 * AdminLogin wrapper: requires role === "Admin"
 */
export default function AdminLogin() {
  const navigation = useNavigation<any>();

  const onSuccess = (user: any) => {
    // navigate to admin dashboard
    navigation.reset({ index: 0, routes: [{ name: "AdminDashboard" }] });
  };

  return (
    <View style={styles.screen}>
      <LoginForm
        expectedRole="Admin"
        onSuccess={onSuccess}
        showGuest={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
