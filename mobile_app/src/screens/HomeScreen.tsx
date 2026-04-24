/**
 * NutriLens — Home Screen
 * app/(tabs)/index.tsx
 *
 * Stack: Expo Router · React Native · TypeScript
 * Dependencies:
 *   expo install react-native-svg
 *   expo install expo-linear-gradient
 *   expo install @expo-google-fonts/inter expo-font
 */
 
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
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
 
// ─── Design Tokens ──────────────────────────────────────────────────────────
 
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
 
interface HomeScreenProps {
  userName?: string;
  summary?: NutritionSummary;
  meals?: Meal[];
  insights?: AIInsight[];
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
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={s.headerRow}>
      <View>
        <Text style={s.labelXs}>Good morning</Text>
        <Text style={s.headerName}>{name} 👋</Text>
      </View>
      <LinearGradient
        colors={[C.accent3, C.accent2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.avatar}
      >
        <Text style={s.avatarText}>{initial}</Text>
      </LinearGradient>
    </View>
  );
}
 
// ─── Animated Circular Ring ───────────────────────────────────────────────────
 
const RING_SIZE = 88;
const RING_RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 226
 
function CalorieRing({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);
 
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });
 
  // react-native-svg doesn't accept Animated.Value directly on strokeDashoffset,
  // so we use a JS-driven workaround with a listener → state.
  const [offset, setOffset] = React.useState(CIRCUMFERENCE);
 
  useEffect(() => {
    const id = anim.addListener(({ value }) => {
      setOffset(CIRCUMFERENCE * (1 - value));
    });
    return () => anim.removeListener(id);
  }, [anim]);
 
  const pct = Math.round(progress * 100);
 
  return (
    <View style={s.ringWrap}>
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={C.accent} />
            <Stop offset="100%" stopColor={C.accent2} />
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
      <View style={s.ringCenter}>
        <Text style={s.ringPct}>{pct}%</Text>
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
 
function MacroBar({ label, current, goal, unit = 'g', gradientColors }: MacroBarProps) {
  const pct = Math.min(current / goal, 1);
  const widthAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);
 
  return (
    <View style={s.macroItem}>
      <Text style={s.labelXs}>{label}</Text>
      <View style={s.macroTrack}>
        <Animated.View
          style={[
            s.macroFillBase,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={s.macroValueRow}>
        <Text style={s.macroValue}>{current}{unit}</Text>
        <Text style={s.macroGoal}>/{goal}{unit}</Text>
      </View>
    </View>
  );
}
 
// ─── Calorie Card ─────────────────────────────────────────────────────────────
 
function CalorieCard({ summary }: { summary: NutritionSummary }) {
  const remaining = summary.caloriesGoal - summary.calories;
  const progress = summary.calories / summary.caloriesGoal;
 
  return (
    <View style={s.sectionPad}>
      <LinearGradient
        colors={['#151820', '#1e2130']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.calorieCard}
      >
        {/* Top row: numbers + ring */}
        <View style={s.calorieTopRow}>
          <View>
            <Text style={s.labelXs}>Calories Today</Text>
            <View style={s.calorieNumRow}>
              <Text style={s.calorieNum}>
                {summary.calories.toLocaleString()}
              </Text>
              <Text style={s.calorieGoal}>/ {summary.caloriesGoal.toLocaleString()}</Text>
            </View>
            <View style={s.badgeGreen}>
              <Text style={s.badgeGreenText}>{remaining} remaining</Text>
            </View>
          </View>
          <CalorieRing progress={progress} />
        </View>
 
        {/* Macro bars */}
        <View style={s.macroRow}>
          <MacroBar
            label="Protein"
            current={summary.protein}
            goal={summary.proteinGoal}
            gradientColors={[C.accent, C.accent2]}
          />
          <MacroBar
            label="Carbs"
            current={summary.carbs}
            goal={summary.carbsGoal}
            gradientColors={[C.accent3, C.accent2]}
          />
          <MacroBar
            label="Fat"
            current={summary.fat}
            goal={summary.fatGoal}
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
 
function AIInsightCard({ insight }: { insight: AIInsight }) {
  return (
    <LinearGradient
      colors={[insight.gradientStart, insight.gradientEnd]}
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
          {meal.food?.name || "Food"}
        </Text>

        <Text style={styles.subtitle}>
          {type.charAt(0).toUpperCase() + type.slice(1)} · {time}
        </Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <Text style={styles.calories}>
          {meal.nutrition?.calories ?? 0} kcal
        </Text>

        <Text style={styles.macros}>
          P {meal.nutrition?.protein ?? 0}g · C {meal.nutrition?.carbs ?? 0}g
        </Text>
      </View>
    </View>
  );
}
 
// ─── Main Home Screen ─────────────────────────────────────────────────────────
 
export default function HomeScreen({
  userName = 'Alex',
  summary = DEFAULT_SUMMARY,
  meals = DEFAULT_MEALS,
  insights = DEFAULT_INSIGHTS,
  onScanPress,
  onAddMealPress,
  onSeeAllMealsPress,
}: HomeScreenProps) {
  const router = useRouter();
 
  const handleScan = onScanPress ?? (() => router.push('/scan'));
  const handleAddMeal = onAddMealPress ?? (() => router.push('/log'));
  const handleSeeAll = onSeeAllMealsPress ?? (() => router.push('/log'));
 
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
 
        {/* Calorie Card + Macro Bars */}
        <CalorieCard summary={summary} />
 
        {/* Quick Actions */}
        <QuickActions onScanPress={handleScan} onAddMealPress={handleAddMeal} />
 
        {/* Water Tracker */}
        <WaterTracker consumed={summary.water} goal={summary.waterGoal} />
 
        {/* AI Insight */}
        <View style={[s.sectionPad, { marginBottom: 14 }]}>
          {insights.map((ins) => (
            <AIInsightCard key={ins.id} insight={ins} />
          ))}
        </View>
 
        {/* Recent Meals */}
        <View style={s.sectionPad}>
          <View style={s.mealsHeader}>
            <Text style={s.h3}>Recent Meals</Text>
            <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.7}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.mealsList}>
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
              
            ))}
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
