import { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import { LinearGradient }
  from "expo-linear-gradient";
import { authApi } from "@/src/services/api";

// ========================================

export default function Index() {

  const [loading, setLoading] =
    useState(true);



  useEffect(() => {

    const bootstrap =
      async () => {
      await authApi.hydrateAuth();
        try {

          const token =
            await AsyncStorage.getItem(
              "@auth_access_token"
            );

          console.log(
            "TOKEN:",
            token
          );

          if (!token) {

            router.replace(
              "/onboarding/welcome"
            );

            return;
          }

          router.replace(
            "/(tabs)"
          );

        } catch (error) {

          console.log(
            "BOOTSTRAP ERROR:",
            error
          );

          router.replace(
            "/onboarding/welcome"
          );

        } finally {

          setLoading(false);
        }
      };

    bootstrap();

  }, []);

  // ========================================
  // AUTH LOADER UI
  // ========================================

  if (loading) {

    return (

      <LinearGradient
        colors={[
          "#05010A",
          "#0D0618",
          "#05010A",
        ]}
        style={styles.container}
      >

        {/* AI ORB */}
        <View style={styles.orb} />

        {/* TITLE */}
        <Text style={styles.title}>
          Netrilens AI
        </Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          Initializing AI Nutrition Engine...
        </Text>

        {/* LOADER */}
        <ActivityIndicator
          size="small"
          color="#8B5CF6"
          style={{
            marginTop: 24,
          }}
        />

      </LinearGradient>
    );
  }

  return null;
}

// ========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#05010A",
  },

  orb: {
    width: 120,
    height: 120,

    borderRadius: 999,

    backgroundColor:
      "rgba(124,58,237,0.18)",

    shadowColor: "#8B5CF6",

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.8,
    shadowRadius: 40,

    elevation: 30,

    marginBottom: 40,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 28,
    fontWeight: "800",

    letterSpacing: -0.8,
  },

  subtitle: {
    color:
      "rgba(255,255,255,0.55)",

    fontSize: 14,

    marginTop: 10,
  },
});