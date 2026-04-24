import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { searchFood } from "../src/services/foodService";
import { addMeal } from "../src/services/trackingService";

type Food = {
  id: number;
  name: string;
};

export default function LogScreen() {
  const [mealType, setMealType] = useState("lunch");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState("");

  // 🔍 SEARCH
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await searchFood(query);
      setFoods(res);
    } catch {
      Alert.alert("Error", "Food search failed");
    }
  };

  // ➕ ADD MEAL
  const handleAddMeal = async () => {
    if (!selectedFood) {
      Alert.alert("Select food first");
      return;
    }

    if (!grams || isNaN(Number(grams))) {
      Alert.alert("Enter valid grams");
      return;
    }

    try {
      await addMeal({
        food_id: Number(selectedFood.id),
        grams: Number(grams),
        meal_type: mealType.toLowerCase(),
      });

      queryClient.invalidateQueries({ queryKey: ["summary"] });

      Alert.alert("Success", "Meal added");
      router.back();
    } catch {
      Alert.alert("Error", "Failed to add meal");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Meal</Text>

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search food..."
        placeholderTextColor="#666"
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {/* 🔥 MEAL TYPE SELECTOR */}
      <View style={styles.selectorRow}>
        {["breakfast", "lunch", "dinner", "snack"].map((type) => {
          const isActive = mealType === type;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => setMealType(type)}
              style={[
                styles.selectorBtn,
                isActive && styles.selectorActive,
              ]}
            >
              <Text
                style={[
                  styles.selectorText,
                  isActive && styles.selectorTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {/* 🍽 FOOD LIST */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.foodItem,
              selectedFood?.id === item.id && styles.selectedFood,
            ]}
            onPress={() => setSelectedFood(item)}
          >
            <Text style={styles.foodText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* ✅ SELECTED FOOD */}
      {selectedFood && (
        <View style={{ marginTop: 15 }}>
          <Text style={{ color: "white" }}>
            Selected: {selectedFood.name}
          </Text>

          <TextInput
            placeholder="Enter grams"
            placeholderTextColor="#666"
            value={grams}
            onChangeText={setGrams}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
            <Text style={styles.buttonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F1A",
    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#1C1F2A",
    color: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },

  foodItem: {
    backgroundColor: "#1C1F2A",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  selectedFood: {
    backgroundColor: "#2563EB",
  },

  foodText: {
    color: "white",
  },

  // 🔥 SELECTOR STYLES
  selectorRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  selectorBtn: {
    flex: 1,
    padding: 10,
    marginRight: 6,
    borderRadius: 10,
    backgroundColor: "#1C1F2A",
  },

  selectorActive: {
    backgroundColor: "#2563EB",
  },

  selectorText: {
    color: "white",
    textAlign: "center",
  },

  selectorTextActive: {
    fontWeight: "600",
  },
});