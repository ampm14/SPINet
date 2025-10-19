import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";

export default function Splash({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Welcome"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 230, height: 100 },
});
