import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { getGoals } from "../services/api";
import { getTodayMeals, getSummary } from "../services/trackingService";

export default function HomeScreen() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
 const [goals, setGoals] = useState(null);
  useEffect(() => {
    loadData();
  }, []);

 const goalsData = await getGoals();

const loadData = async () => {
  try {
    const mealData = await getTodayMeals();
    setMeals(mealData.meals);

    const summaryData = await getSummary();
    setSummary(summaryData.totals);

    const goalsData = await getGoals(token);
    setGoals(goalsData);

  } catch (err) {
    console.log(err);
  }
};

  return (
    <ScrollView style={{ padding: 20 }}>

      {/* 🔥 SUMMARY */}
      {summary && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Today's Summary
          </Text>

          <Text>Calories: {summary.calories}</Text>
          <Text>Protein: {summary.protein}</Text>
          <Text>Carbs: {summary.carbs}</Text>
          <Text>Fat: {summary.fat}</Text>
        </View>
      )}

      {/* 🔥 MEALS LIST */}
      <View>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Today's Meals
        </Text>

        {meals.map((item) => (
          <View
            key={item.id}
            style={{
              padding: 10,
              marginVertical: 5,
              backgroundColor: "#eee",
              borderRadius: 8,
            }}
          >
            <Text>{item.food_name}</Text>
            <Text>{item.grams}g</Text>
            <Text>{item.calories} kcal</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}