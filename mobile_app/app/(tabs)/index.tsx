import { useQuery } from "@tanstack/react-query";
import HomeScreen from "../../src/screens/HomeScreen";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import React from "react";

export default function Index() {
  const router = useRouter();

  const { data, refetch } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => {
      const res = await fetch("http://192.168.1.4:8000/api/tracking/summary/");
      return res.json();
    },
  });

  useFocusEffect(
  React.useCallback(() => {
    refetch();
  }, [])
);

  return (
    <HomeScreen
      userName="Faizal"
      summary={{
        calories: data?.totals?.calories || 0,
        caloriesGoal: 2000,
        protein: data?.totals?.protein || 0,
        proteinGoal: 100,
        carbs: data?.totals?.carbs || 0,
        carbsGoal: 250,
        fat: data?.totals?.fat || 0,
        fatGoal: 70,
        water: 1.5,
        waterGoal: 2.5,
      }}
      meals={data?.meals || []}
      onScanPress={() => router.push("/scan")}
      onAddMealPress={() => router.push("/log")}
    />
  );
}