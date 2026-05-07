import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { searchFood } from "../services/foodService";
import { calculateNutrition } from "../services/nutritionService";
import { useNavigation } from "@react-navigation/native";
export default function ScanScreen() {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const handleSearch = async () => {
    try {
      setError("");
      setResult(null);
      setSelectedFood(null);
      setLoading(true);

      const data = await searchFood(query);
      setFoods(data);
    } catch (err) {
      setError("Food search failed. Check backend/IP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setError("");
      setResult(null);
      setLoading(true);

      const data = await calculateNutrition(selectedFood?.id, grams);
      setResult(data);
    } catch (err) {
      setError(err.message || "Nutrition calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriLens</Text>

      <Text style={styles.label}>Search Food</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Enter food name"
        autoCapitalize="none"
      />

      <Button
        title={loading ? "Please wait..." : "Search"}
        onPress={handleSearch}
        disabled={loading || !query.trim()}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? <ActivityIndicator style={styles.loader} /> : null}

      <FlatList
        data={foods}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          !loading && query.trim() ? (
            <Text style={styles.empty}>No foods found.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.foodItem,
              selectedFood?.id === item.id && styles.selectedFoodItem,
            ]}
            onPress={() => {
              setSelectedFood(item);
              setResult(null);
              setGrams("");
            }}
          >
            <Text style={styles.foodName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedFood ? (
        <View style={styles.section}>
          <Text style={styles.label}>Selected: {selectedFood.name}</Text>

          <TextInput
            style={styles.input}
            value={grams}
            onChangeText={setGrams}
            placeholder="Enter grams"
            keyboardType="numeric"
          />

          <Button
            title="Calculate"
            onPress={handleCalculate}
            disabled={loading || !grams.trim()}
          />
        </View>
      ) : null}

      {result?.nutrition ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Calories: {result.nutrition.calories}
          </Text>
          <Text style={styles.resultText}>
            Protein: {result.nutrition.protein}g
          </Text>
          <Text style={styles.resultText}>
            Carbs: {result.nutrition.carbs}g
          </Text>
          <Text style={styles.resultText}>
            Fat: {result.nutrition.fat}g
          </Text>
          <Button
          title="Add to Meal"
          onPress={async () => {
            try {
              await addMeal(selectedFood.id, grams, "lunch");

              alert("Meal added");

              navigation.navigate("Home", { refresh: true }); // 👈 IMPORTANT
            } catch (err) {
              console.log(err);
            }
          }} 
         />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 16,
  },
  error: {
    marginTop: 12,
    color: "#b42318",
  },
  empty: {
    marginTop: 16,
    color: "#667085",
  },
  foodItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eaecf0",
  },
  selectedFoodItem: {
    backgroundColor: "#ecfdf3",
  },
  foodName: {
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  resultBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  resultText: {
    fontSize: 16,
    marginBottom: 6,
  },
});
