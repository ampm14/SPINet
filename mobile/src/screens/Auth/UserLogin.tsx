import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoginForm from "./LoginForm";
import { theme } from "../../styles/theme";

export default function UserLogin() {
  const navigation = useNavigation<any>();

  const onSuccess = (user: any) => {
    // replace with your real parker dashboard route name if different
    navigation.reset({ index: 0, routes: [{ name: "ParkerDashboard" }] });
  };

  return (
    <View style={styles.screen}>
      <LoginForm expectedRole="Parker" onSuccess={onSuccess} showGuest={true} />
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
