import { useEffect } from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from
"@react-native-async-storage/async-storage";

export default function Index() {

  console.log("INDEX SCREEN");

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const token =
          await AsyncStorage.getItem(
            "@auth_access_token"
          );

        console.log(
          "INDEX TOKEN:",
          token
        );

        if (token) {

          router.replace("/(tabs)");

        } else {

          router.replace(
            "/(auth)/login"
          );
        }

      } catch (error) {

        console.log(
          "AUTH CHECK ERROR:",
          error
        );

        router.replace(
          "/(auth)/login"
        );
      }
    };

    checkAuth();

  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator
        size="large"
        color="#f59e0b"
      />
    </View>
  );
}