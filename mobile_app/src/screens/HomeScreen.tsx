import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getSummary, getTodayMeals } from "../services/trackingService";
import { getGoals } from "../services/api";
import * as Haptics from 'expo-haptics';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  logoutUser,
} from "../services/api";
// ─── Design Tokens ──────────────────────────────────────────────────────────
const formatNumber = (
  value?: number
) => {
  return Math.round(value || 0);
};
const C = {
  bg0: '#0A0B0E',
  bg1: '#111318',
  bg2: '#1A1C23',
  bg3: '#22252F',
  bg4: '#2A2E3A',
  accent: '#4FFFB0',
  accent2: '#00D4FF',
  accent3: '#7B6EF6',
  text1: '#F0F2FF',
  text2: '#8B90A0',
  text3: '#555A6E',
  warn: '#FFB347',
  danger: '#FF6B6B',
} as const;

const CARD_R = 20;
const SM_R = 12;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NutritionSummary {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  water: number;       // litres consumed
  waterGoal: number;   // litres goal
}

export interface Meal {
  id: number;
  food_name: string;
  grams: number;
  calories: number;
  protein?: number;
  carbs?: number;
  meal_type?: string;   // e.g. "Breakfast", "Lunch"
  time?: string;        // e.g. "8:30 AM"
  emoji?: string;
}

export interface AIInsight {
  id: string;
  emoji: string;
  title: string;
  body: string;
  color: string;               // accent color for title
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface HomeScreenProps {
  userName?: string;
  onScanPress?: () => void;
  onAddMealPress?: () => void;
  onSeeAllMealsPress?: () => void;
}

// ─── Default / Demo Data ─────────────────────────────────────────────────────

const DEFAULT_SUMMARY: NutritionSummary = {
  calories: 1640,
  caloriesGoal: 2100,
  protein: 124,
  proteinGoal: 170,
  carbs: 186,
  carbsGoal: 310,
  fat: 38,
  fatGoal: 75,
  water: 1.8,
  waterGoal: 2.5,
};

const DEFAULT_MEALS: Meal[] = [
  {
    id: 1,
    food_name: 'Oat Bowl',
    grams: 280,
    calories: 420,
    protein: 18,
    carbs: 62,
    meal_type: 'Breakfast',
    time: '8:30 AM',
    emoji: '🥣',
  },
  {
    id: 2,
    food_name: 'Grilled Salad',
    grams: 350,
    calories: 610,
    protein: 48,
    carbs: 52,
    meal_type: 'Lunch',
    time: '1:15 PM',
    emoji: '🥗',
  },
];

const DEFAULT_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    emoji: '✨',
    title: 'AI Insight',
    body: "You're 26g short on protein today. Add a chicken breast or Greek yogurt to hit your goal.",
    color: C.accent3,
    borderColor: 'rgba(123,110,246,0.25)',
    gradientStart: 'rgba(123,110,246,0.12)',
    gradientEnd: 'rgba(79,255,176,0.06)',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Greeting header row with avatar */
function Header({ name }: { name: string }) {

  const router = useRouter();

  const initial =
    name.charAt(0).toUpperCase();

  const handleProfilePress =
    async () => {

      const token =
        await AsyncStorage.getItem(
          "access"
        );

      // USER LOGGED IN
      if (token) {

        Alert.alert(
          "Account",
          "Choose an option",
          [
            {
              text: "Profile",
              onPress: () => {
                console.log("PROFILE");
              },
            },

            {
              text: "Settings",
              onPress: () => {
                console.log("SETTINGS");
              },
            },

            {
              text: "Logout",
              style: "destructive",

              onPress: async () => {

                await logoutUser();

                router.replace(
                  "/login"
                );
              },
            },

            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );

      }

      // USER NOT LOGGED IN
      else {

        Alert.alert(
          "Authentication",
          "Login to continue",
          [
            {
              text: "Login",

              onPress: () =>
                router.push(
                  "/login"
                ),
            },

            {
              text: "Create Account",

              onPress: () =>
                router.push(
                  "/register"
                ),
            },

            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    };

  return (
    <View style={s.headerRow}>

      <View>
        <Text style={s.labelXs}>
          Good morning
        </Text>

        <Text style={s.headerName}>
          {name} 👋
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleProfilePress}
      >
        <LinearGradient
          colors={[
            C.accent3,
            C.accent2
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.avatar}
        >
          <Text style={s.avatarText}>
            {initial}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
}

// ─── Animated Circular Ring ───────────────────────────────────────────────────

const RING_SIZE = 88;
const RING_RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CalorieRing({ progress }: { progress: number }) {
  // 🛡️ Clamp progress (0 → 1)
  const safeProgress = Math.min(progress || 0, 1);

  const anim = useRef(new Animated.Value(0)).current;
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: safeProgress,
      duration: 900,
      useNativeDriver: false,
    }).start();

    const id = anim.addListener(({ value }) => {
      setOffset(CIRCUMFERENCE * (1 - value));
    });

    return () => anim.removeListener(id);
  }, [safeProgress]);

  // 🎨 Dynamic color logic
  const getColors = () => {
    if (safeProgress < 0.7) return [C.accent, C.accent2];
    if (safeProgress < 1) return ["#ffaa00", "#ffcc00"]; // yellow
    return ["#ff4444", "#ff0000"]; // red
  };

  const [startColor, endColor] = getColors();

  const pct = Math.round(progress * 100);
  const isOver = progress > 1;

  return (
    <View style={s.ringWrap}>
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={startColor} />
            <Stop offset="100%" stopColor={endColor} />
          </SvgLinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={C.bg4}
          strokeWidth={8}
        />

        {/* Progress */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </Svg>

      {/* 🔥 Center Text */}
      <View style={s.ringCenter}>
        <Text
          style={[
            s.ringPct,
            isOver && { color: "#ff4444" } // red if exceeded
          ]}
        >
          {pct}%
        </Text>

        {/* Optional label */}
        {isOver && (
          <Text style={{ fontSize: 10, color: "#ff4444" }}>
            Over
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Animated Macro Bar ───────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  gradientColors: [string, string];
}

function MacroBar({
  label,
  current,
  goal,
  unit = "g",
  gradientColors,
}: MacroBarProps) {
  // 🛡️ Safe values
  const safeGoal = goal || 1;
  const safeCurrent = current || 0;

  const pct = Math.min(safeCurrent / safeGoal, 1);
  const isOver = safeCurrent > safeGoal;

  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  // 🎨 Dynamic color logic
  const getColor = () => {
    if (pct < 0.7) return gradientColors;
    if (pct < 1) return ["#ffaa00", "#ffcc00"]; // yellow
    return ["#ff4444", "#ff0000"]; // red
  };

  const displayColors = getColor();

  return (
    <View style={s.macroItem}>
      <Text style={s.labelXs}>{label}</Text>

      {/* 🔥 Progress Bar */}
      <View style={s.macroTrack}>
        <Animated.View
          style={[
            s.macroFillBase,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={displayColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* 🔢 Values */}
      <View style={s.macroValueRow}>
        <Text
          style={[
            s.macroValue,
            isOver && { color: "#ff4444" } // 🔥 red if exceeded
          ]}
        >
          {safeCurrent}
          {unit}
        </Text>

        <Text style={s.macroGoal}>
          /{safeGoal}
          {unit}
        </Text>
      </View>

      {/* ⚡ Optional % */}
      <Text style={{ fontSize: 10, opacity: 0.6 }}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}

// ─── Calorie Card (FINAL SAFE VERSION) ───────────────────────────────────────

function CalorieCard({ summary }: { summary: NutritionSummary }) {
  if (!summary) return null;

  // 🛡️ Safe values
  const goal = summary.caloriesGoal || 1;
  const consumed = summary.calories || 0;

  // remaining (never negative)
  const remaining = Math.max(goal - consumed, 0);

  // progress clamp (0 → 1)
  const progress = Math.min(consumed / goal, 1);

  const isOver = consumed > goal;

  return (
    <View style={s.sectionPad}>
      <LinearGradient
        colors={['#151820', '#1e2130']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.calorieCard}
      >
        {/* 🔥 Top row */}
        <View style={s.calorieTopRow}>
          <View>
            <Text style={s.labelXs}>Calories Today</Text>

            <View style={s.calorieNumRow}>
              <Text style={s.calorieNum}>
                {Math.round(consumed).toLocaleString()}
              </Text>
              <Text style={s.calorieGoal}>
                / {Math.round(goal).toLocaleString()}
              </Text>
            </View>

            {/* 🟢 remaining / 🔴 over */}
            <View
              style={[
                s.badgeGreen,
                isOver && { backgroundColor: '#ff4d4d' }
              ]}
            >
              <Text style={s.badgeGreenText}>
                {isOver
                  ? `${Math.round(consumed - goal).toLocaleString()} over`
                  : `${Math.round(remaining).toLocaleString()} remaining`}
              </Text>
            </View>
          </View>

          <CalorieRing progress={progress} />
        </View>

        {/* 🔥 Macro bars */}
        <View style={s.macroRow}>
          <MacroBar
            label="Protein"
            current={summary.protein || 0}
            goal={summary.proteinGoal || 1}
            gradientColors={[C.accent, C.accent2]}
          />
          <MacroBar
            label="Carbs"
            current={summary.carbs || 0}
            goal={summary.carbsGoal || 1}
            gradientColors={[C.accent3, C.accent2]}
          />
          <MacroBar
            label="Fat"
            current={summary.fat || 0}
            goal={summary.fatGoal || 1}
            gradientColors={[C.warn, C.danger]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

interface QuickActionsProps {
  onScanPress: () => void;
  onAddMealPress: () => void;
}

function QuickActions({ onScanPress, onAddMealPress }: QuickActionsProps) {
  return (
    <View style={[s.sectionPad, s.quickActionsContainer]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onScanPress}
        style={s.quickActionTouchable}
      >
        <LinearGradient
          colors={['rgba(79,255,176,0.15)', 'rgba(0,212,255,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.quickCard, s.quickCardGreenBorder]}
        >
          <Text style={s.quickIcon}>📷</Text>
          <Text style={s.quickTitle}>Scan Food</Text>
          <Text style={s.labelSm}>AI-powered</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAddMealPress}
        style={s.quickActionTouchable}
      >
        <LinearGradient
          colors={['rgba(123,110,246,0.15)', 'rgba(0,212,255,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.quickCard, s.quickCardPurpleBorder]}
        >
          <Text style={s.quickIcon}>🍽️</Text>
          <Text style={s.quickTitle}>Add Meal</Text>
          <Text style={s.labelSm}>Manual entry</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Water Tracker ────────────────────────────────────────────────────────────

function WaterTracker({
  consumed,
  goal,
}: {
  consumed: number;
  goal: number;
}) {
  const totalBars = 5;
  const filledBars = Math.round((consumed / goal) * totalBars);
  const pct = Math.round((consumed / goal) * 100);

  return (
    <View style={s.sectionPad}>
      <View style={s.waterCard}>
        <View style={s.waterLeft}>
          <Text style={s.waterEmoji}>💧</Text>
          <View>
            <Text style={s.waterTitle}>Hydration</Text>
            <Text style={s.labelSm}>{consumed}L of {goal}L</Text>
          </View>
        </View>
        <View style={s.waterRight}>
          <View style={s.waterBars}>
            {Array.from({ length: totalBars }).map((_, i) => (
              <View
                key={i}
                style={[
                  s.waterBar,
                  { opacity: i < filledBars ? 1 : 0.35 },
                ]}
              />
            ))}
          </View>
          <View style={s.badgeBlue}>
            <Text style={s.badgeBlueText}>{pct}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────
const mapInsights = (rawInsights: string[]): AIInsight[] => {
  const unique = [...new Set(rawInsights)];

  return unique.map((text, index) => {
    const lower = text.toLowerCase();

    if (lower.includes("protein")) {
      return {
        id: "protein-" + index,
        emoji: "💪",
        title: "Protein Low",
        body: text,
        color: "#00ff88",
        borderColor: "#00ff88",
        gradientStart: "#0f2027",
        gradientEnd: "#2c5364",
      };
    }

    if (lower.includes("calorie")) {
      return {
        id: "calorie-" + index,
        emoji: "🔥",
        title: "Calories Alert",
        body: text,
        color: "#ffaa00",
        borderColor: "#ffaa00",
        gradientStart: "#3a1c71",
        gradientEnd: "#d76d77",
      };
    }

    return {
      id: "general-" + index,
      emoji: "⚡",
      title: "Insight",
      body: text,
      color: "#ccc",
      borderColor: "#555",
      gradientStart: "#232526",
      gradientEnd: "#414345",
    };
  });
};
function AIInsightCard({ insight }: { insight: AIInsight }) {
  return (
    <LinearGradient
      colors={[insight.gradientStart, insight.gradientEnd] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.aiInsightCard, { borderColor: insight.borderColor }]}
    >
      <View style={s.aiInsightIconWrap}>
        <Text style={s.aiInsightIconText}>{insight.emoji}</Text>
      </View>

      <View style={s.aiInsightBody}>
        <Text style={[s.aiInsightTitle, { color: insight.color }]}>
          {insight.title}
        </Text>

        <Text style={s.aiInsightText}>{insight.body}</Text>
      </View>
    </LinearGradient>
  );
}

// ─── Meal Card ────────────────────────────────────────────────────────────────

const MEAL_ICON_COLORS: Record<string, string> = {
  Breakfast: 'rgba(255,179,71,0.12)',
  Lunch: 'rgba(79,255,176,0.10)',
  Dinner: 'rgba(123,110,246,0.12)',
  Snack: 'rgba(0,212,255,0.10)',
};

function MealCard({ meal }: { meal: any }) {
  const type = meal.meal_type?.toLowerCase() || "lunch";

  const emojiMap: Record<string, string> = {
    breakfast: "🥣",
    lunch: "🥗",
    dinner: "🍽",
    snack: "🍎",
  };

  const bgColor =
    MEAL_ICON_COLORS[type] ?? "rgba(255,255,255,0.06)";

  const time = new Date(meal.consumed_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log("MEALS:", meal);

  return (
    <View style={styles.card}>
      {/* ICON */}
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Text style={styles.emoji}>
          {emojiMap[type] || "🍴"}
        </Text>
      </View>

      {/* LEFT */}
      <View style={styles.info}>
        <Text style={styles.title}>
          {meal.food_name || "Food"}
        </Text>

        <Text style={styles.subtitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} · {time}
        </Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <Text style={styles.calories}>
          {meal.calories ?? 0} kcal
        </Text>

        <Text style={styles.macros}>
          P {meal.protein ?? 0}g · C {meal.carbs ?? 0}g
        </Text>
      </View>
    </View>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────────────────

import { useLocalSearchParams } from "expo-router";

export default function HomeScreen({

  onScanPress,
  onAddMealPress,
  onSeeAllMealsPress,
}: HomeScreenProps) {

  const router = useRouter();

  const params =
    useLocalSearchParams();

  // 🥇 STATE
  const [summary, setSummary] =
    useState<NutritionSummary | null>(
      null
    );
  const [userName, setUserName] =
    useState("User");
  const [meals, setMeals] =
    useState<Meal[]>([]);

  const [insights, setInsights] =
    useState<AIInsight[]>([]);

  const [loading, setLoading] =
    useState(true);

  // 🥈 SAFE SUMMARY
  const safeSummary = summary ?? {
    calories: 0,
    caloriesGoal: 1,

    protein: 0,
    proteinGoal: 1,

    carbs: 0,
    carbsGoal: 1,

    fat: 0,
    fatGoal: 1,

    water: 0,
    waterGoal: 3,
  };

  // 🥉 NAV HANDLERS
  const handleScan = onScanPress ?? (() => router.push("/scan"));
  const handleAddMeal = onAddMealPress ?? (() => router.push("/log"));
  const handleSeeAll = onSeeAllMealsPress ?? (() => router.push("/log"));

  // 🟢 INITIAL LOAD (MOST IMPORTANT FIX)
  useEffect(() => {
    loadData();
  }, []);

  // 🟡 REFRESH ONLY WHEN NEEDED
  useEffect(() => {
    if (params.refresh === "true") {
      loadData();
    }
  }, [params.refresh]);

  // 🔥 DATA LOADER
  const loadData = async () => {
    try {
      setLoading(true);

      const [
        summaryResponse,
        mealsResponse,
        goalsResponse,
      ] = await Promise.all([
        getSummary(),
        getTodayMeals(),
        getGoals(),
      ]);

      console.log(
        "SUMMARY RESPONSE:",
        summaryResponse
      );
      setUserName(
        summaryResponse?.user_name
        || "User"
      );

      console.log(
        "MEALS RESPONSE:",
        mealsResponse
      );

      console.log(
        "GOALS RESPONSE:",
        goalsResponse
      );

      /*
      |--------------------------------------------------------------------------
      | SAFE DATA EXTRACTION
      |--------------------------------------------------------------------------
      */





      const goalsData =
        goalsResponse?.success
          ? goalsResponse.data
          : null;

      /*
      |--------------------------------------------------------------------------
      | INSIGHTS
      |--------------------------------------------------------------------------
      */

      const formattedInsights =
        mapInsights(
          goalsData?.insights || []
        );

      setInsights(formattedInsights);



      /*
      |--------------------------------------------------------------------------
      | TOTALS
      |--------------------------------------------------------------------------
      */


      const totals =
        summaryResponse?.totals || {};

      const meals =
        mealsResponse?.meals || [];

      const goals =
        goalsResponse?.data || {};
      /*
      |--------------------------------------------------------------------------
      | MERGED SUMMARY
      |--------------------------------------------------------------------------
      */

      const mergedSummary = {
        calories:
          totals.calories || 0,

        protein:
          totals.protein || 0,

        carbs:
          totals.carbs || 0,

        fat:
          totals.fat || 0,

        caloriesGoal:
          goalsResponse?.data?.calories || 0,

        proteinGoal:
          goalsResponse?.data?.protein || 0,

        carbsGoal:
          goalsResponse?.data?.carbs || 0,

        fatGoal:
          goalsResponse?.data?.fats || 0,

        water:
          totals.water || 0,

        waterGoal:
          goalsResponse?.data?.waterGoal || 3,
      };

      /*
      |--------------------------------------------------------------------------
      | UPDATE STATE
      |--------------------------------------------------------------------------
      */

      setSummary(mergedSummary);

      setMeals(
        mealsResponse?.data?.meals || []
      )

      console.log(
        "FINAL SUMMARY:",
        mergedSummary
      );

      console.log(
        "FINAL MEALS:",
        mealsResponse?.data?.meals
      );

    } catch (err) {
      console.log(
        "LOAD ERROR:",
        err
      );
    } finally {
      setLoading(false);
    }
  };


  // 🥈 THEN CONDITIONAL UI
  if (loading) {
    return (
      <Text style={{ color: "white", marginTop: 50 }}>
        Loading...
      </Text>
    );
  }



  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg0} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header name={userName} />

        {/* 🔥 CALORIES + MACROS */}
        <CalorieCard summary={safeSummary} />

        {/* ACTIONS */}
        <QuickActions
          onScanPress={handleScan}
          onAddMealPress={handleAddMeal}
        />

        {/* 💧 WATER */}
        <WaterTracker
          consumed={safeSummary.water}
          goal={safeSummary.waterGoal}
        />

        {/* 🤖 AI INSIGHTS */}
        {insights.length > 0 && (
          <View style={[s.sectionPad, { marginBottom: 14 }]}>
            {insights.map((ins) => (
              <AIInsightCard key={ins.id} insight={ins} />
            ))}
          </View>
        )}

        {/* 🍽️ MEALS */}
        <View style={s.sectionPad}>
          <View style={s.mealsHeader}>
            <Text style={s.h3}>Recent Meals</Text>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={s.mealsList}>
            {meals.length > 0 ? (
              meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))
            ) : (
              <Text style={{ color: "#888", marginTop: 10 }}>
                No meals added yet 🍽️
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Root
  root: {
    flex: 1,
    backgroundColor: C.bg0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },

  // ── Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text1,
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Shared
  sectionPad: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  labelXs: {
    fontSize: 11,
    fontWeight: '500',
    color: C.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  labelSm: {
    fontSize: 12,
    color: C.text2,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text1,
  },

  // ── Calorie Card
  calorieCard: {
    borderRadius: CARD_R,
    padding: 18,
    borderWidth: 1,
    borderColor: C.bg3,
  },
  calorieTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
  },
  calorieNum: {
    fontSize: 44,
    fontWeight: '700',
    color: C.text1,
    lineHeight: 48,
  },
  calorieGoal: {
    fontSize: 15,
    color: C.text2,
    marginLeft: 4,
  },

  // ── Badge green
  badgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(79,255,176,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeGreenText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.accent,
  },

  // ── Ring
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text1,
  },

  // ── Macro bars
  macroRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  macroItem: {
    flex: 1,
  },
  macroTrack: {
    height: 6,
    borderRadius: 10,
    backgroundColor: C.bg3,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 5,
  },
  macroFillBase: {
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  macroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text1,
  },
  macroGoal: {
    fontSize: 11,
    fontWeight: '400',
    color: C.text2,
    marginLeft: 1,
  },

  // ── Quick actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionTouchable: {
    flex: 1,
  },
  quickCard: {
    borderRadius: CARD_R,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickCardGreenBorder: {
    borderColor: 'rgba(79,255,176,0.20)',
  },
  quickCardPurpleBorder: {
    borderColor: 'rgba(123,110,246,0.20)',
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text1,
    marginBottom: 3,
  },

  // ── Water tracker
  waterCard: {
    backgroundColor: C.bg2,
    borderRadius: SM_R,
    padding: 14,
    borderWidth: 1,
    borderColor: C.bg3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterEmoji: {
    fontSize: 22,
  },
  waterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text1,
    marginBottom: 2,
  },
  waterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waterBars: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  waterBar: {
    width: 8,
    height: 24,
    borderRadius: 4,
    backgroundColor: C.accent2,
  },
  badgeBlue: {
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeBlueText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.accent2,
  },

  // ── AI Insight
  aiInsightCard: {
    borderRadius: CARD_R,
    padding: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  aiInsightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(123,110,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiInsightIconText: {
    fontSize: 16,
  },
  aiInsightBody: {
    flex: 1,
  },
  aiInsightTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiInsightText: {
    fontSize: 13,
    color: C.text2,
    lineHeight: 19,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: C.accent,
  },
  mealsList: {
    gap: 10,
  },
});

// ── Meal Card (in Log Screen) ───────────────────────────────────────────────

// ── Recent Meals
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1F2A",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2A2F3D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  emoji: {
    fontSize: 22,
  },

  info: {
    flex: 1,
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    color: "#8A90A2",
    fontSize: 13,
    marginTop: 2,
  },

  right: {
    alignItems: "flex-end",
  },

  calories: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  macros: {
    color: "#8A90A2",
    fontSize: 12,
    marginTop: 2,
  },
});
