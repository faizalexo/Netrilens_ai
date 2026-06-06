import React, { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

import { searchFood } from "../src/services/foodService";
import { addMeal } from "../src/services/trackingService";

type Food = {
  fat: number;
  carbs: number;
  protein: number;
  calories: number;
  id: number;
  name: string;
};

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", emoji: "☀️" },
  { key: "lunch", label: "Lunch", emoji: "🍛" },
  { key: "dinner", label: "Dinner", emoji: "🌙" },
  { key: "snack", label: "Snack", emoji: "🍿" },
];

// ─── Animated TouchableOpacity wrapper ───────────────────────────────────────
function PressableScale({
  children,
  onPress,
  style,
  activeOpacity = 0.85,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: object | object[];
  activeOpacity?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── FoodCard ─────────────────────────────────────────────────────────────────
function FoodCard({
  item,
  isSelected,
  onPress,
}: {
  item: Food;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.foodCard,
          isSelected && styles.foodCardSelected,
          { transform: [{ scale }] },
        ]}
      >
        {/* Left accent bar */}
        <View style={[styles.foodCardAccent, isSelected && styles.foodCardAccentSelected]} />

        <View style={styles.foodCardContent}>
          <Text style={[styles.foodCardName, isSelected && styles.foodCardNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.foodCardHint}>
            {isSelected ? "✓ Selected" : "Tap to select"}
          </Text>
        </View>

        <View style={[styles.chevronWrap, isSelected && styles.chevronWrapSelected]}>
          <Text style={[styles.chevron, isSelected && styles.chevronSelected]}>›</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Nutrition Pill ───────────────────────────────────────────────────────────
function NutritionPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.nutritionPill, { borderColor: color + "30" }]}>
      <Text style={[styles.nutritionValue, { color }]}>{value}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LogScreen() {
  const [mealType, setMealType] = useState("lunch");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {

    const trimmedQuery =
      query.trim();

    if (
      trimmedQuery.length < 2
    ) {

      setFoods([]);

      return;
    }

    const timer =
      setTimeout(() => {

        handleSearch();

      }, 400);

    return () =>
      clearTimeout(timer);

  }, [query]);

  // ─── SEARCH ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      Alert.alert("Validation", "Please enter a food name");
      return;
    }
    try {
      const res = await searchFood(trimmedQuery);
      console.log("FOOD SEARCH RAW:", JSON.stringify(res, null, 2));
      const foodsData =
        Array.isArray(res) ? res : res?.foods ?? res?.results ?? res?.data ?? [];
      setFoods(foodsData);
    } catch (error) {
      console.log("SEARCH ERROR:", error);
      Alert.alert("Error", "Food search failed");
    }
  };

  // ─── ADD MEAL ─────────────────────────────────────────────────────────────
  const gramsValue =
    Number(grams) || 0;

  const multiplier =
    gramsValue / 100;

  const caloriesPreview =
    selectedFood
      ? Math.round(
        selectedFood.calories *
        multiplier
      )
      : 0;

  const proteinPreview =
    selectedFood
      ? (
        selectedFood.protein *
        multiplier
      ).toFixed(1)
      : "0";

  const carbsPreview =
    selectedFood
      ? (
        selectedFood.carbs *
        multiplier
      ).toFixed(1)
      : "0";

  const fatPreview =
    selectedFood
      ? (
        selectedFood.fat *
        multiplier
      ).toFixed(1)
      : "0";
  const handleAddMeal = async () => {
    if (!selectedFood) { Alert.alert("Select food first"); return; }
    if (!grams || isNaN(Number(grams))) { Alert.alert("Enter valid grams"); return; }
    try {
      await addMeal({
        food_id: Number(selectedFood.id),
        grams: Number(grams),
        meal_type: mealType.toLowerCase(),
      });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      Alert.alert("Success", "Meal added");
      router.replace("/(tabs)?refresh=true");
    } catch {
      Alert.alert("Error", "Failed to add meal");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── TOP HEADER ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <View style={styles.aiDot} />
            <Text style={styles.brandText}>Netrilens AI</Text>
          </View>

          <Text style={styles.headerTitle}>Add Meal</Text>
          <Text style={styles.headerSubtitle}>
            Search foods and log nutrition instantly
          </Text>

          {/* Decorative gradient line */}
          <View style={styles.headerRule} />
        </View>

        {/* ─── SEARCH BAR ───────────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            placeholder="Search foods, meals, brands..."
            placeholderTextColor="#4A4A5E"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            selectionColor="#8B5CF6"
            cursorColor="#8B5CF6"
            style={styles.searchInput}
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setFoods([]);
                setSelectedFood(null);
              }}
            >
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ─── MEAL TYPE PILLS ──────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {MEAL_TYPES.map(({ key, label, emoji }) => {
            const isActive = mealType === key;
            return (
              <PressableScale key={key} onPress={() => setMealType(key)}>
                <View style={[styles.pill, isActive && styles.pillActive]}>
                  <Text style={styles.pillEmoji}>{emoji}</Text>
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {label}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* ─── SEARCH BUTTON ────────────────────────────────────────────── */}
        {/*<PressableScale onPress={handleSearch} style={styles.searchBtn}>
          <View style={styles.searchBtnInner}>
            <Text style={styles.searchBtnIcon}>⌕</Text>
            <Text style={styles.searchBtnText}>Search Foods</Text>
          </View>
        </PressableScale>*/}

        {/* ─── FOOD RESULTS LIST ────────────────────────────────────────── */}
        {foods.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsMeta}>
              <Text style={styles.resultsTitle}>Results</Text>
              <Text style={styles.resultsCount}>{foods.length} found</Text>
            </View>

            {foods.map((item) => (
              <FoodCard
                key={String(item.id)}
                item={item}
                isSelected={selectedFood?.id === item.id}
                onPress={() => setSelectedFood(item)}
              />
            ))}
          </View>
        )}

        {foods.length === 0 && query.length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No foods found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}

        {/* ─── SELECTED FOOD CARD ───────────────────────────────────────── */}
        {selectedFood && (
          <View style={styles.selectedCard}>
            {/* Card header */}
            <View style={styles.selectedCardHeader}>
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓ Selected Food</Text>
              </View>
            </View>

            <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>

            <View style={styles.selectedDivider} />

            {/* Grams input */}
            <Text style={styles.gramsLabel}>Amount</Text>
            <View style={styles.gramsInputWrap}>
              <TextInput
                placeholder="Enter grams"
                placeholderTextColor="#3A3A50"
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                style={styles.gramsInput}
              />
              <View style={styles.gramsUnit}>
                <Text style={styles.gramsUnitText}>g</Text>
              </View>
            </View>

            {/* Nutrition Preview */}
            <Text style={styles.nutritionTitle}>
              Nutrition Preview
            </Text>

            <View style={styles.nutritionGrid}>

              <NutritionPill
                label="Calories"
                value={`${caloriesPreview}`}
                color="#F59E0B"
              />

              <NutritionPill
                label="Protein"
                value={`${proteinPreview}g`}
                color="#8B5CF6"
              />

              <NutritionPill
                label="Carbs"
                value={`${carbsPreview}g`}
                color="#3B82F6"
              />

              <NutritionPill
                label="Fat"
                value={`${fatPreview}g`}
                color="#EC4899"
              />

            </View>

            {/* CTA */}
            <PressableScale onPress={handleAddMeal} style={styles.logBtn}>
              <View style={styles.logBtnInner}>
                <Text style={styles.logBtnText}>+ Log Meal</Text>
              </View>
            </PressableScale>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#070B14",
  surface: "rgba(255,255,255,0.04)",
  surfaceHigh: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderHigh: "rgba(139,92,246,0.40)",
  accent: "#8B5CF6",
  accentBlue: "#3B82F6",
  accentHigh: "#A855F7",
  textPrimary: "#FFFFFF",
  textSecondary: "#8B8B9E",
  textDim: "#4A4A5E",
  success: "#4ADE80",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  // ─── HEADER ────────────────────────────────────────────────────────────────
  header: {
    marginBottom: 32,
  },

  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
    marginRight: 8,
    shadowColor: C.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  brandText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.accent,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  headerTitle: {
    fontSize: 38,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: -1,
    lineHeight: 44,
  },

  headerSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    marginTop: 6,
    letterSpacing: 0.1,
    lineHeight: 22,
  },

  headerRule: {
    marginTop: 20,
    height: 1,
    backgroundColor: C.border,
    borderRadius: 1,
  },

  // ─── SEARCH BAR ────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },

  searchWrapFocused: {
    borderColor: "rgba(139,92,246,0.5)",
    backgroundColor: C.surfaceHigh,
    shadowColor: C.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  searchIcon: {
    fontSize: 20,
    color: C.textDim,
    marginRight: 10,
    fontWeight: "300",
  },

  searchInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 16,
    letterSpacing: 0.1,
  },

  searchClear: {
    color: C.textDim,
    fontSize: 13,
    paddingLeft: 10,
  },

  // ─── MEAL TYPE PILLS ───────────────────────────────────────────────────────
  pillRow: {
    flexDirection: "row",
    paddingBottom: 4,
    marginBottom: 20,
    gap: 10,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 6,
  },

  pillActive: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderColor: C.borderHigh,
    shadowColor: C.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  pillEmoji: {
    fontSize: 14,
  },

  pillText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.textSecondary,
    letterSpacing: 0.2,
  },

  pillTextActive: {
    color: C.textPrimary,
    fontWeight: "700",
  },

  // ─── SEARCH BUTTON ─────────────────────────────────────────────────────────
  searchBtn: {
    marginBottom: 28,
  },

  searchBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.30)",
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
    shadowColor: C.accent,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },

  searchBtnIcon: {
    fontSize: 17,
    color: C.accent,
  },

  searchBtnText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  resultsSection: {
    marginBottom: 24,
  },

  resultsMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: -0.2,
  },

  resultsCount: {
    fontSize: 12,
    color: C.textDim,
    fontWeight: "500",
  },

  // ─── FOOD CARD ─────────────────────────────────────────────────────────────
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
  },

  foodCardSelected: {
    borderColor: C.borderHigh,
    backgroundColor: "rgba(139,92,246,0.10)",
    shadowColor: C.accent,
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },

  foodCardAccent: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },

  foodCardAccentSelected: {
    backgroundColor: C.accent,
  },

  foodCardContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },

  foodCardName: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  foodCardNameSelected: {
    color: C.textPrimary,
  },

  foodCardHint: {
    color: C.textDim,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "400",
  },

  chevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  chevronWrapSelected: {
    backgroundColor: "rgba(139,92,246,0.25)",
    borderColor: C.borderHigh,
  },

  chevron: {
    color: C.textDim,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "300",
  },

  chevronSelected: {
    color: C.accent,
  },

  // ─── EMPTY STATE ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },

  emptyTitle: {
    color: C.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  emptySubtitle: {
    color: C.textDim,
    fontSize: 13,
    marginTop: 4,
  },

  // ─── SELECTED FOOD CARD ────────────────────────────────────────────────────
  selectedCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: C.accent,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },

  selectedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  selectedBadge: {
    backgroundColor: "rgba(139,92,246,0.18)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.35)",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  selectedBadgeText: {
    fontSize: 12,
    color: C.accentHigh,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  selectedFoodName: {
    color: C.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 20,
  },

  selectedDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 20,
  },

  gramsLabel: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  gramsInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    marginBottom: 24,
    overflow: "hidden",
  },

  gramsInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "500",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  gramsUnit: {
    paddingHorizontal: 18,
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    paddingVertical: 14,
  },

  gramsUnitText: {
    color: C.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

  // ─── NUTRITION PILLS ───────────────────────────────────────────────────────
  nutritionTitle: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  nutritionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  nutritionPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  nutritionValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  nutritionLabel: {
    color: C.textDim,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ─── LOG MEAL BUTTON ───────────────────────────────────────────────────────
  logBtn: {},

  logBtnInner: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    // Simulate gradient via a layered approach if LinearGradient is unavailable:
    // Use a solid accent with glow for maximum compatibility.
  },

  logBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});