/**
 * app/onboarding/activity-level.tsx
 * Onboarding Step 4 — Activity Level
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
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { TOKENS } from '@/components/ui/GlassCard';
import { colors } from "@/src/theme/colors";
import { radius as R, componentSpacing, dimensions } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import type { ActivityId } from "@/src/store/onboardingStore";
// ─── Types ────────────────────────────────────────────────────────────────────


type ActivityCard = {
  id: ActivityId;
  label: string;
  icon: string;
  desc: string;
  multiplier: string;
  color: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACTIVITY_LEVELS: ActivityCard[] = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    icon: '🪑',
    desc: 'Little to no exercise',
    multiplier: '×1.2',
    color: '#64748B',
  },
  {
    id: 'light',
    label: 'Lightly Active',
    icon: '🚶',
    desc: 'Light exercise 1–3 days/week',
    multiplier: '×1.38',
    color: TOKENS.cyan,
  },
  {
    id: 'moderate',
    label: 'Moderate',
    icon: '🏃',
    desc: 'Exercise 3–5 days/week',
    multiplier: '×1.55',
    color: '#22C55E',
  },
  {
    id: 'active',
    label: 'Very Active',
    icon: '⚡',
    desc: 'Hard exercise 6–7 days/week',
    multiplier: '×1.73',
    color: TOKENS.orange,
  },
  {
    id: 'athlete',
    label: 'Athlete',
    icon: '🏆',
    desc: 'Professional elite training',
    multiplier: '×1.9',
    color: TOKENS.pink,
  },
];

// ─── GlowOrbs ─────────────────────────────────────────────────────────────────
function GlowOrbs() {
  const makePulse = (dur: number) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const s = useSharedValue(0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      s.value = withRepeat(
        withSequence(
          withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }, []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAnimatedStyle(() => ({
      opacity: s.value,
      transform: [{ scale: interpolate(s.value, [0.5, 1], [1, 1.07]) }],
    }));
  };

  const s1 = makePulse(4000);
  const s2 = makePulse(5200);
  const s3 = makePulse(6000);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {([
        [styles.glowOrb1, 'rgba(124,58,237,0.20)', s1],
        [styles.glowOrb2, 'rgba(249,115,22,0.16)', s2],
        [styles.glowOrb3, 'rgba(6,182,212,0.14)', s3],
      ] as const).map(([posStyle, color, animStyle], i) => (
        <Animated.View key={i} style={[styles.glowOrb, posStyle, animStyle]}>
          <LinearGradient
            colors={[color as string, 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      ))}
    </View>
  );
}

// ─── ActivityRow ──────────────────────────────────────────────────────────────
interface ActivityRowProps {
  level: ActivityCard;
  selected: boolean;
  onSelect: (id: ActivityId) => void;
  index: number;
}

function ActivityRow({ level, selected, onSelect, index }: ActivityRowProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.012 : 1, { damping: 18, stiffness: 200 });
    glow.value = withTiming(selected ? 1 : 0, { duration: 260 });
  }, [selected]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.22]),
  }));

  const iconBg = selected ? `${level.color}1E` : 'rgba(255,255,255,0.04)';
  const iconBorder = selected ? `${level.color}40` : TOKENS.glassBorder;

  return (
    <Animated.View
      style={[
        wrapStyle,
        {
          borderRadius: R['5xl'],
          shadowColor: level.color,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 18,
          elevation: selected ? 8 : 0,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelect(level.id)}
        style={[
          styles.activityRow,
          {
            backgroundColor: selected ? `${level.color}14` : TOKENS.glass,
            borderColor: selected ? `${level.color}55` : TOKENS.glassBorder,
            borderWidth: selected ? 1.5 : 1,
          },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.activityIconBox,
            {
              backgroundColor: iconBg,
              borderColor: iconBorder,
            },
          ]}
        >
          <Text style={styles.activityIcon}>{level.icon}</Text>
        </View>

        {/* Label + desc */}
        <View style={styles.activityTextWrap}>
          <Text style={styles.activityLabel}>
            {level.label}
          </Text>

          <Text style={styles.activityDesc}>
            {level.desc}
          </Text>
        </View>

        {/* Multiplier */}
        <Text
          style={[
            styles.activityMult,
            {
              color: selected
                ? level.color
                : 'rgba(255,255,255,0.26)',
            },
          ]}
        >
          {level.multiplier}
        </Text>

        {/* Radio */}
        <View
          style={[
            styles.radioOuter,
            {
              borderColor: selected
                ? level.color
                : TOKENS.glassBorder,

              backgroundColor: selected
                ? level.color
                : 'transparent',
            },
          ]}
        >
          {selected && (
            <Text style={styles.radioCheck}>
              ✓
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ActivityLevelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string; age: string; gender: string;
    height: string; weight: string;
    heightUnit: string; weightUnit: string;
    goal: string;
  }>();

  const {
  activityLevel,
  setActivityLevel,
} = useOnboardingStore();

  const handleGenerate = useCallback(() => {
    router.push({
      pathname: '/onboarding/ai-processing',
      params: { ...params, activity: activityLevel },
    });
  }, [activityLevel, params, router]);

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
            currentStep={4}
            totalSteps={5}
            onBack={handleBack}
            style={styles.stepper}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>Activity Level</Text>

          <Text style={styles.screenSubtitle}>
            How active are you during a typical week?
          </Text>
        </Animated.View>

        {/* Activity rows */}
        <View style={styles.levelList}>
          {ACTIVITY_LEVELS.map((level, idx) => (
            <ActivityRow
              key={level.id}
              level={level}
              selected={activityLevel === level.id}
              onSelect={(id) => setActivityLevel(id)}
              index={idx}
            />
          ))}
        </View>

        {/* CTA */}
        <Animated.View>
          <GradientButton
            label="Generate My AI Plan →"
            onPress={handleGenerate}
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
  stepper: { marginBottom: 4 },
  titleBlock: { marginBottom: 20 },

  screenTitle: {
    ...typography.sectionHeading,
    color: '#fff',
    marginBottom: 4,
  },
  screenSubtitle: {
    ...typography.body,
    color: colors.text.tertiary,
  },

  levelList: {
    gap: 9,
    marginBottom: 24,
  },

  // Activity row
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: componentSpacing.activityRowPaddingV,
    paddingHorizontal: componentSpacing.activityRowPaddingH,
    borderRadius: R['5xl'],
  },
  activityIconBox: {
    width: dimensions.activityIconBox,
    height: dimensions.activityIconBox,
    borderRadius: R['2xl'],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityIcon: { fontSize: 18 },
  activityTextWrap: { flex: 1 },
  activityLabel: {
    ...typography.activityTitle,
    color: '#fff',
    marginBottom: 2,
  },
  activityDesc: {
    ...typography.activityDesc,
    color: 'rgba(255,255,255,0.4)',
  },
  activityMult: {
    ...typography.activityMultiplier,
    fontWeight: '600',
  },

  radioOuter: {
    width: dimensions.activityRadioSize,
    height: dimensions.activityRadioSize,
    borderRadius: dimensions.activityRadioSize / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioCheck: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 12,
  },

  // Glow orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  glowOrb1: { width: 260, height: 260, top: -70, left: -70 },
  glowOrb2: { width: 200, height: 200, bottom: 100, right: -50 },
  glowOrb3: { width: 150, height: 150, top: '35%', right: -40 },
});
