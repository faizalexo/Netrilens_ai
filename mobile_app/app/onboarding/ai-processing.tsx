/**
 * app/onboarding/ai-processing.tsx
 * Onboarding Step 5 — AI Processing → Results Reveal
 * Netrilens AI · Expo Router · React Native · Reanimated · Moti
 *
 * Phase 1: Animated processing orb with spinning rings, scan-line, step checklist
 * Phase 2: Results reveal — calories hero card + macro chips + macro split bar
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';



// ─── Design System ────────────────────────────────────────────────────────────
import { GradientButton } from '@/components/ui/GradientButton';
import { TOKENS } from '@/components/ui/GlassCard';
import { colors } from '@/src/theme/colors';
import { radius as R, componentSpacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import {
  useOnboardingStore,
} from '@/src/store/onboardingStore';

import api from '@/src/services/api';
// ─── Processing step thresholds ───────────────────────────────────────────────
const PROCESSING_STEPS = [
  { label: 'Basal Metabolic Rate', threshold: 20 },
  { label: 'Activity Multiplier', threshold: 45 },
  { label: 'Goal Calibration', threshold: 70 },
  { label: 'Macro Distribution', threshold: 90 },
] as const;

const PHASE_LABELS = [
  'Scanning body data...',
  'Analyzing metabolic rate...',
  'Generating blueprint...',
  'Blueprint complete!',
];

// ─── GlowOrbs ─────────────────────────────────────────────────────────────────
function GlowOrbs() {
  const p1 = useSharedValue(0.5);
  const p2 = useSharedValue(0.5);

  useEffect(() => {
    p1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
    p2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: p1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: p2.value }));

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
          colors={['rgba(249,115,22,0.16)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Spinning Processing Orb ──────────────────────────────────────────────────
interface ProcessingOrbProps {
  progress: number; // 0–100
}

function ProcessingOrb({ progress }: ProcessingOrbProps) {
  // Outer ring spin
  const outerSpin = useSharedValue(0);
  // Inner ring counter-spin
  const innerSpin = useSharedValue(0);
  // Scan line position (0–1 = top to bottom of circle)
  const scanPos = useSharedValue(0);

  useEffect(() => {
    outerSpin.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1, false,
    );
    innerSpin.value = withRepeat(
      withTiming(-1, { duration: 3000, easing: Easing.linear }),
      -1, false,
    );
    scanPos.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1, false,
    );
  }, []);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerSpin.value * 360}deg` }],
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${innerSpin.value * 360}deg` }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    // Animate top from 0% to 100% of the orb height (190px)
    top: `${scanPos.value * 100}%`,
  }));

  const ORB_SIZE = 190;
  const CORE_SIZE = 114;
  const RING_INSET = 18;

  return (
    <View style={[styles.orbContainer, { width: ORB_SIZE, height: ORB_SIZE }]}>
      {/* Outer spinning ring — purple top, cyan right */}
      <Animated.View
        style={[
          styles.spinRing,
          outerRingStyle,
          {
            width: ORB_SIZE,
            height: ORB_SIZE,
            borderRadius: ORB_SIZE / 2,
            borderTopColor: TOKENS.purple,
            borderRightColor: TOKENS.cyan,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            borderWidth: 2,
          },
        ]}
      />

      {/* Inner spinning ring — orange top, pink left (counter-spin) */}
      <Animated.View
        style={[
          styles.spinRing,
          innerRingStyle,
          {
            position: 'absolute',
            width: ORB_SIZE - RING_INSET * 2,
            height: ORB_SIZE - RING_INSET * 2,
            top: RING_INSET,
            left: RING_INSET,
            borderRadius: (ORB_SIZE - RING_INSET * 2) / 2,
            borderTopColor: TOKENS.orange,
            borderLeftColor: TOKENS.pink,
            borderBottomColor: 'transparent',
            borderRightColor: 'transparent',
            borderWidth: 1.5,
          },
        ]}
      />

      {/* Core sphere */}
      <View
        style={[
          styles.orbCore,
          {
            width: CORE_SIZE,
            height: CORE_SIZE,
            borderRadius: CORE_SIZE / 2,
            // Glow shadow on iOS
            shadowColor: TOKENS.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.45,
            shadowRadius: 42,
            elevation: 16,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(124,58,237,0.42)', 'rgba(5,5,8,0.92)']}
          style={[StyleSheet.absoluteFill, { borderRadius: CORE_SIZE / 2 }]}
        />

        {/* Scan line */}
        <View style={[StyleSheet.absoluteFill, { borderRadius: CORE_SIZE / 2, overflow: 'hidden' }]}>
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        </View>

        {/* Percentage + label */}
        <View style={styles.orbCenter}>
          <Text style={styles.orbPercent}>{Math.round(progress)}%</Text>
          <Text style={styles.orbLabel}>PROCESSING</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Shimmer Bar ──────────────────────────────────────────────────────────────
function ShimmerBar() {
  const pos = useSharedValue(-1);

  useEffect(() => {
    pos.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1, false,
    );
  }, []);

  const shimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(pos.value, [-1, 1], [-80, 80]) },
    ],
  }));

  return (
    <View style={styles.shimmerTrack}>
      <Animated.View style={[StyleSheet.absoluteFill, shimStyle]}>
        <LinearGradient
          colors={[TOKENS.purple, TOKENS.cyan, TOKENS.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// ─── Processing View ──────────────────────────────────────────────────────────
interface ProcessingViewProps {
  progress: number;
  phaseLabel: string;
}

function ProcessingView({ progress, phaseLabel }: ProcessingViewProps) {
  return (
    <View style={styles.processingWrap}>
      {/* Header */}
      <Animated.View style={styles.processingHeader}>
        <Text style={styles.brandLabel}>Netrilens AI</Text>

        <Text style={styles.processingTitle}>
          Building Your Blueprint
        </Text>

        <Text style={styles.processingSubtitle}>
          Analyzing your unique biometrics…
        </Text>
      </Animated.View>

      {/* Orb */}
      <ProcessingOrb progress={progress} />

      {/* Phase label */}
      <Text style={styles.phaseLabel}>{phaseLabel}</Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        >
          <LinearGradient
            colors={[TOKENS.purple, TOKENS.cyan]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {/* Step checklist */}
      <View style={styles.stepList}>
        {PROCESSING_STEPS.map((step, i) => {
          const done = progress > step.threshold;
          const active = !done && progress > step.threshold - 20;
          return (
            <Animated.View
              key={step.label}
              style={[
                styles.stepRow,
                {
                  backgroundColor: done
                    ? 'rgba(124,58,237,0.10)'
                    : 'rgba(255,255,255,0.03)',

                  borderColor: done
                    ? 'rgba(124,58,237,0.28)'
                    : 'rgba(255,255,255,0.12)',
                },
              ]}
            >
              {/* Dot */}
              <Animated.View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: done
                      ? TOKENS.purple
                      : 'rgba(255,255,255,0.05)',

                    borderColor: done
                      ? TOKENS.purpleLight
                      : 'rgba(255,255,255,0.12)',
                  },
                ]}
              >
                {done && <Text style={styles.stepCheck}>✓</Text>}
              </Animated.View>

              <Animated.View
                style={{
                  flex: 1,
                  opacity: done ? 1 : 0.35,
                }}
              >
                <Text style={[styles.stepLabel, done && { color: '#fff' }]}>
                  {step.label}
                </Text>
              </Animated.View>

              {/* Shimmer for in-progress step */}
              {active && !done && <ShimmerBar />}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
interface ResultsViewProps {
  result: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  onNext: () => void;
}

const MACRO_CONFIG = [
  { key: 'protein' as const, label: 'Protein', icon: '💪', color: TOKENS.orange, kcalPer: 4 },
  { key: 'carbs' as const, label: 'Carbs', icon: '⚡', color: TOKENS.cyan, kcalPer: 4 },
  { key: 'fat' as const, label: 'Fats', icon: '🥑', color: TOKENS.pink, kcalPer: 9 },
];

function ResultsView({ result, onNext }: ResultsViewProps) {
  const totalKcal =
    result.protein * 4 + result.carbs * 4 + result.fat * 9;

  return (
    <ScrollView
      contentContainerStyle={styles.resultsScroll}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Header badge + title */}
      <Animated.View style={styles.resultsHeader}>
        <View style={styles.blueprintBadge}>
          <Text style={styles.blueprintBadgeText}>
            ✨ Blueprint Ready
          </Text>
        </View>

        <Text style={styles.resultsTitle}>
          Your AI Nutrition Plan
        </Text>

        <Text style={styles.resultsSubtitle}>
          Calibrated to your unique biology
        </Text>
      </Animated.View>

      {/* Calories hero card */}
      <Animated.View
        style={[
          styles.caloriesCard,
          {
            shadowColor: TOKENS.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.28,
            shadowRadius: 28,
            elevation: 12,
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(124,58,237,0.20)',
            'rgba(6,182,212,0.10)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: R['8xl'] },
          ]}
        />

        <Text style={styles.caloriesOverline}>
          Daily Calories
        </Text>

        <Text style={styles.caloriesNumber}>
          {result.calories}
        </Text>

        <Text style={styles.caloriesUnit}>
          kcal / day
        </Text>
      </Animated.View>

      {/* Macro chips */}
      <View style={styles.macroRow}>
        {MACRO_CONFIG.map(({ key, label, icon, color }, i) => (
          <Animated.View
            key={key}
            style={[
              styles.macroChip,
              {
                backgroundColor: `${color}12`,
                borderColor: `${color}40`,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 4,
              },
            ]}
          >
            <Text style={styles.macroIcon}>
              {icon}
            </Text>

            <Text style={[styles.macroValue, { color }]}>
              {result[key]}
            </Text>

            <Text style={styles.macroUnit}>
              g
            </Text>

            <Text style={styles.macroLabel}>
              {label}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* Macro split bar */}
      <Animated.View style={styles.macroBarBlock}>
        <View style={styles.macroBarHeader}>
          <Text style={styles.macroBarLeft}>
            Macro Split
          </Text>

          <Text style={styles.macroBarRight}>
            P · C · F
          </Text>
        </View>

        <View style={styles.macroBar}>
          {MACRO_CONFIG.map(({ key, color, kcalPer }) => {
            const kcal = result[key] * kcalPer;

            return (
              <View
                key={key}
                style={[
                  styles.macroSegment,
                  {
                    flex: kcal,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 4,
                  },
                ]}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* CTA */}
      <Animated.View>
        <GradientButton
          label="View Full Plan →"
          onPress={onNext}
          variant="primary"
        />
      </Animated.View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AIProcessingScreen() {

  const {
    age,
    gender,
    height,
    weight,
    goal,
    activityLevel,

    calories,
    protein,
    carbs,
    fats,

    setNutrition,
    setInsights,
  } = useOnboardingStore();
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  const router = useRouter();


  const [progress, setProgress] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Derived nutrition data (memoised via ref to avoid re-calc on re-renders)

  const processOnboarding =
    async () => {

      try {

        // Create profile

        await api.post(
          '/users/create_profile/',
          {
            age,
            gender,
            height,
            weight,

            activity_level:
              activityLevel,

            goal,
          }
        );

        // Fetch goals

        const response =
          await api.get(
            '/users/get_goals/'
          );

        const data =
          response.data;

        // Save into Zustand

        setNutrition(
          data.calories,
          data.protein,
          data.carbs,
          data.fats
        );

        setInsights(
          data.insights || []
        );

      } catch (error) {

        console.log(
          'ONBOARDING ERROR:',
          error
        );
      }
    };
  // Drive the progress bar animation
  useEffect(() => {
    let p = 0;
    const id = setInterval(async () => {
      p += 1.4;
      setProgress(p);
      if (p > 26 && p < 28) setPhaseIdx(1);
      if (p > 58 && p < 60) setPhaseIdx(2);
      if (p > 92) setPhaseIdx(3);
      if (p >= 100) {

        clearInterval(id);

        setProgress(100);

        // REAL backend onboarding
        await processOnboarding();

        // Small cinematic delay
        setTimeout(() => {

          setShowResults(true);

        }, 1200);
      }
    }, 38);
    return () => clearInterval(id);
  }, []);

  const handleNext =
    useCallback(() => {

      router.replace(
        '/onboarding/completion'
      );

    }, [router]);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#0A0514', TOKENS.bg]}
        style={StyleSheet.absoluteFill}
      />
      <GlowOrbs />

      {!showResults ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.phase,
          ]}
        >
          <ProcessingView
            progress={progress}
            phaseLabel={PHASE_LABELS[phaseIdx]}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.phase,
          ]}
        >
          <ResultsView
            result={{
              calories,
              protein,
              carbs,
              fat: fats,
            }}
            onNext={handleNext}
          />
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },
  phase: {
    flex: 1,
  },

  // ── Processing ───────────────────────────
  processingWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: componentSpacing.screenPaddingTopHero,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
    paddingBottom: 36,
  },
  processingHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLabel: {
    ...typography.brandLabel,
    color: TOKENS.purpleLight,
    marginBottom: 9,
  },
  processingTitle: {
    ...typography.sectionHeadingLg,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  processingSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
  },

  // Orb
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  spinRing: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  orbCore: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TOKENS.glassBorder,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    shadowColor: TOKENS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    // Gradient-like via background color + shadow glow
    backgroundColor: TOKENS.cyan,
    opacity: 0.7,
  },
  orbCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  orbPercent: {
    ...typography.processingPercent,
    color: '#fff',
  },
  orbLabel: {
    ...typography.micro,
    color: 'rgba(255,255,255,0.36)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Phase label
  phaseLabel: {
    ...typography.badge,
    color: TOKENS.purpleLight,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 20,
  },

  // Progress bar
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: TOKENS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },

  // Step rows
  stepList: {
    width: '100%',
    gap: 7,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: componentSpacing.stepRowPaddingV,
    paddingHorizontal: componentSpacing.stepRowPaddingH,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepDot: {
    width: componentSpacing.stepDotSize,
    height: componentSpacing.stepDotSize,
    borderRadius: componentSpacing.stepDotSize / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepCheck: {
    color: '#fff',
    fontSize: 9,
  },
  stepLabel: {
    ...typography.bodyXs,
    color: 'rgba(255,255,255,0.36)',
  },
  shimmerTrack: {
    marginLeft: 'auto',
    width: 38,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // ── Results ──────────────────────────────
  resultsScroll: {
    paddingTop: componentSpacing.screenPaddingTopHero,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
    paddingBottom: componentSpacing.screenPaddingBottom + 20,
    alignItems: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  blueprintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.28)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 13,
  },
  blueprintBadgeText: {
    ...typography.badge,
    color: TOKENS.purpleLight,
  },
  resultsTitle: {
    ...typography.sectionHeadingLg,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  resultsSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.40)',
    textAlign: 'center',
  },

  // Calories card
  caloriesCard: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: R['8xl'],
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.40)',
    alignItems: 'center',
    marginBottom: 13,
    overflow: 'hidden',
    position: 'relative',
  },
  caloriesOverline: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 7,
  },
  caloriesNumber: {
    ...typography.caloriesHero,
    color: '#fff',
    // Gradient text approximation — solid white with purple tint
    lineHeight: 60,
  },
  caloriesUnit: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.36)',
    marginTop: 4,
  },

  // Macro chips
  macroRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 9,
    marginBottom: 18,
  },
  macroChip: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 9,
    borderRadius: R['5xl'],
    borderWidth: 1.5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  macroIcon: { fontSize: 18, marginBottom: 5 },
  macroValue: {
    ...typography.macroValue,
    lineHeight: 26,
  },
  macroUnit: {
    ...typography.nano,
    color: 'rgba(255,255,255,0.36)',
    marginBottom: 2,
  },
  macroLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.48)',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '500',
  },

  // Macro split bar
  macroBarBlock: {
    width: '100%',
    marginBottom: 20,
  },
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  macroBarLeft: {
    ...typography.nano,
    color: 'rgba(255,255,255,0.38)',
  },
  macroBarRight: {
    ...typography.nano,
    color: 'rgba(255,255,255,0.38)',
  },
  macroBar: {
    flexDirection: 'row',
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  macroSegment: {
    borderRadius: 4,
  },

  // Glow orbs
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  glowOrb1: { width: 260, height: 260, top: -80, left: -80 },
  glowOrb2: { width: 200, height: 200, bottom: 60, right: -60 },
});
