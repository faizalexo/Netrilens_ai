/**
 * app/onboarding/goal-selection.tsx
 * Onboarding Step 3 — Goal Selection
 * Netrilens AI · Expo Router · React Native · Reanimated · Moti
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';


// ─── Design System ────────────────────────────────────────────────────────────
import { GlassCard, TOKENS } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { colors } from '@/src/theme/colors';
import { radius as R, componentSpacing, dimensions } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { useOnboardingStore } from "@/src/store/onboardingStore";

// ─── Types ────────────────────────────────────────────────────────────────────
export type GoalId =  'aggressive_cut'  | 'lose_fat' | 'maintain' | 'lean_bulk';

interface Goal {
  id: GoalId;
  label: string;
  icon: string;
  desc: string;
  gradColors: [string, string];
  borderColor: string;
  glowColor: string;
}

const GOALS: Goal[] = [
  {
    id: "aggressive_cut",
    label: "Aggressive Cut",
    icon: "⚡",
    desc: "Rapid fat loss with a large calorie deficit for faster results.",
    gradColors: ["rgba(239,68,68,0.14)", "rgba(249,115,22,0.08)"],
    borderColor: "#EF4444",
    glowColor: "#EF4444",
  },
  {
    id: "lose_fat",
    label: "Fat Loss",
    icon: "🔥",
    desc: "Burn excess fat while preserving lean muscle mass.",
    gradColors: ["rgba(249,115,22,0.12)", "rgba(236,72,153,0.08)"],
    borderColor: TOKENS.orange,
    glowColor: TOKENS.orange,
  },
  {
    id: "maintain",
    label: "Maintain Weight",
    icon: "⚖️",
    desc: "Maintain your current weight and physique.",
    gradColors: ["rgba(6,182,212,0.12)", "rgba(124,58,237,0.08)"],
    borderColor: TOKENS.cyan,
    glowColor: TOKENS.cyan,
  },
  {
    id: "lean_bulk",
    label: "Lean Bulk",
    icon: "🚀",
    desc: "Build muscle steadily with minimal fat gain.",
    gradColors: ["rgba(34,197,94,0.12)", "rgba(16,185,129,0.08)"],
    borderColor: "#22C55E",
    glowColor: "#22C55E",
  },
];
// ─── GlowOrbs ─────────────────────────────────────────────────────────────────
function GlowOrbs() {
  const makeOrb = (duration: number, delay = 0) => {
    const s = useSharedValue(0.5);
    useEffect(() => {
      s.value = withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }, []);
    return useAnimatedStyle(() => ({
      opacity: s.value,
      transform: [{ scale: interpolate(s.value, [0.5, 1], [1, 1.07]) }],
    }));
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const s1 = makeOrb(4000);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const s2 = makeOrb(5000, 1200);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const s3 = makeOrb(6000, 2000);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.glowOrb, styles.glowOrb1, s1]}>
        <LinearGradient
          colors={['rgba(124,58,237,0.22)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.glowOrb, styles.glowOrb2, s2]}>
        <LinearGradient
          colors={['rgba(249,115,22,0.18)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.glowOrb, styles.glowOrb3, s3]}>
        <LinearGradient
          colors={['rgba(6,182,212,0.16)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────
interface GoalCardProps {
  goal: Goal;
  selected: boolean;
  onSelect: (id: GoalId) => void;
  index: number;
}

function GoalCard({ goal, selected, onSelect, index }: GoalCardProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.022 : 1, { damping: 18, stiffness: 200 });
  }, [selected]);

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowShadow = selected
    ? {
      shadowColor: goal.glowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      elevation: 10,
    }
    : { elevation: 0 };

  return (
    <Animated.View>
      <Animated.View
        style={[
          cardAnimStyle,
          glowShadow,
          { borderRadius: R["7xl"] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => onSelect(goal.id)}
          style={[
            styles.goalCard,
            {
              borderColor: selected
                ? goal.borderColor
                : TOKENS.glassBorder,

              borderWidth: selected ? 1.5 : 1,
            },
          ]}
        >
          {/* Gradient fill (selected) */}
          {selected ? (
            <LinearGradient
              colors={goal.gradColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: R["7xl"] },
              ]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: R["7xl"],
                  backgroundColor: TOKENS.glass,
                },
              ]}
            />
          )}

          {/* Top shimmer edge on selection */}
          {selected && (
            <LinearGradient
              colors={[
                "transparent",
                goal.borderColor,
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topShimmer}
            />
          )}

          {/* Content */}
          <View style={styles.goalRow}>
            {/* Icon box */}
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.09)"
                    : "rgba(255,255,255,0.04)",

                  borderColor: selected
                    ? goal.borderColor + "55"
                    : TOKENS.glassBorder,
                },
              ]}
            >
              <Text style={styles.goalIcon}>
                {goal.icon}
              </Text>
            </View>

            {/* Text */}
            <View style={styles.goalTextWrap}>
              <Text style={styles.goalLabel}>
                {goal.label}
              </Text>

              <Text style={styles.goalDesc}>
                {goal.desc}
              </Text>
            </View>

            {/* Radio */}
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: selected
                    ? goal.borderColor
                    : TOKENS.glassBorder,

                  backgroundColor: selected
                    ? goal.borderColor
                    : "transparent",
                },
              ]}
            >
              {selected && (
                <Text style={styles.radioCheck}>
                  ✓
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function GoalSelection() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string; age: string; gender: string;
    height: string; weight: string;
    heightUnit: string; weightUnit: string;
  }>();

  const {
    goal,
    setGoal,
  } = useOnboardingStore();
  const {
    goal: goalStore,
    setGoal: setgoalStore,
  } = useOnboardingStore();

  const handleContinue = useCallback(() => {
    router.push({
      pathname: '/onboarding/activity-level',
      params: { ...params, goal: goal },
    });
  }, [goal, params, router]);

  const handleBack = useCallback(() => router.back(), [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <LinearGradient
        colors={['#0A0514', TOKENS.bg]}
        style={StyleSheet.absoluteFill}
      />
      <GlowOrbs />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Stepper */}
        <Animated.View>
          <ProgressStepper
            currentStep={3}
            totalSteps={5}
            onBack={handleBack}
            style={styles.stepper}
          />
        </Animated.View>

        {/* Title block */}
        <Animated.View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>
            What's Your Goal?
          </Text>

          <Text style={styles.screenSubtitle}>
            Choose your primary objective. Our AI adapts your entire plan around it.
          </Text>
        </Animated.View>

        {/* Goal cards */}
        <View style={styles.goalList}>
          {GOALS.map((goal, idx) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              selected={goalStore === goal.id}
              onSelect={() => setgoalStore(goal.id)}
              index={idx}
            />
          ))}
        </View>

        {/* CTA */}
        <Animated.View>
          <GradientButton
            label="Continue →"
            onPress={handleContinue}
            variant="primary"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },
  scrollContent: {
    paddingTop: componentSpacing.screenPaddingTop,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
    paddingBottom: componentSpacing.screenPaddingBottom + 16,
  },
  stepper: {
    marginBottom: 4,
  },
  titleBlock: {
    marginBottom: 22,
  },
  screenTitle: {
    ...typography.sectionHeading,
    color: '#fff',
    marginBottom: 4,
  },
  screenSubtitle: {
    ...typography.body,
    color: colors.text.tertiary,
    lineHeight: 21,
  },
  goalList: {
    gap: 13,
    marginBottom: 26,
  },
  goalCard: {
    borderRadius: R['7xl'],
    overflow: 'hidden',
    position: 'relative',
  },
  topShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 10,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: componentSpacing.goalCardPadding,
  },
  iconBox: {
    width: dimensions.goalIconBox,
    height: dimensions.goalIconBox,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    fontSize: 22,
  },
  goalTextWrap: {
    flex: 1,
  },
  goalLabel: {
    ...typography.cardTitle,
    color: '#fff',
    marginBottom: 3,
  },
  goalDesc: {
    ...typography.bodyXs,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 17,
  },
  radioOuter: {
    width: dimensions.goalRadioSize,
    height: dimensions.goalRadioSize,
    borderRadius: dimensions.goalRadioSize / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioCheck: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
  },
  // Glow orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  glowOrb1: { width: 260, height: 260, top: -70, left: -70 },
  glowOrb2: { width: 200, height: 200, bottom: 50, right: -50 },
  glowOrb3: { width: 150, height: 150, top: '40%', right: -40 },
});
