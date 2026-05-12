/**
 * app/onboarding/body-metrics.tsx
 *
 * Netrilens AI — Step 2: Body Metrics
 * Matches the HTML reference:
 *   • ProgressStepper (step 2 of 5)
 *   • Height MetricCard — purple accent, cm/ft toggle, range slider
 *   • Weight MetricCard — orange accent, kg/lbs toggle, range slider
 *   • BMI estimate card — cyan value, colour-coded bar segments
 *   • GradientButton "Continue →"
 *   • Ambient GlowOrbs
 *
 * Install: npx expo install @react-native-community/slider
 * deps:    expo-router, expo-linear-gradient, react-native-reanimated, moti
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useRouter, useLocalSearchParams } from 'expo-router';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';

// ─── Theme imports ────────────────────────────────────────────────────────────
import { palette, colors } from '@/src/theme/colors';
import { typography, fontFamily, fontSize } from '@/src/theme/typography';
import { spacing, componentSpacing, radius } from '@/src/theme/spacing';
import { shadows } from '@/src/theme/shadows';

// ─── Component imports ────────────────────────────────────────────────────────
import { GlassCard, TOKENS } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { useOnboardingStore } from "@/src/store/onboardingStore";

// ─── Types ────────────────────────────────────────────────────────────────────
type HeightUnit = 'cm' | 'ft';
type WeightUnit = 'kg' | 'lbs';

interface MetricsState {
  height: number;   // stored as cm
  weight: number;   // stored as kg
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
}

// ─── BMI config ───────────────────────────────────────────────────────────────
const BMI_SEGMENTS = [
  { label: 'Under', color: 'rgba(6,182,212,0.65)', threshold: 0 },
  { label: 'Normal', color: 'rgba(34,197,94,0.65)', threshold: 18.5 },
  { label: 'Over', color: 'rgba(249,115,22,0.65)', threshold: 25 },
  { label: 'Obese', color: 'rgba(239,68,68,0.65)', threshold: 30 },
];

function getBMI(weightKg: number, heightCm: number): number {
  return weightKg / Math.pow(heightCm / 100, 2);
}

function getBMILabel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// ─── Unit toggle button (animated) ───────────────────────────────────────────
interface UnitToggleProps<T extends string> {
  options: T[];
  selected: T;
  accent: string;
  onSelect: (unit: T) => void;
}

function UnitToggle<T extends string>({
  options, selected, accent, onSelect,
}: UnitToggleProps<T>) {
  return (
    <View style={styles.unitToggle}>
      {options.map((opt) => {
        const isActive = selected === opt;
        return (
          <UnitButton
            key={opt}
            label={opt}
            active={isActive}
            accent={accent}
            onPress={() => onSelect(opt)}
          />
        );
      })}
    </View>
  );
}

interface UnitButtonProps {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}

const UnitButton: React.FC<UnitButtonProps> = ({ label, active, accent, onPress }) => {
  const progress = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, { damping: 18, stiffness: 200 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', accent],
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255,255,255,0.45)', '#fff'],
    ),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.unitButton, animStyle]}>
        <Animated.Text style={[styles.unitButtonText, textStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Metric card (height / weight) ───────────────────────────────────────────
interface MetricCardProps<U extends string> {
  label: string;
  displayValue: string;
  min: number;
  max: number;
  value: number;
  accent: string;
  units: U[];
  unitValue: U;
  onValueChange: (v: number) => void;
  onUnitChange: (u: U) => void;
  enterDelay?: number;
}

function MetricCard<U extends string>({
  label,
  displayValue,
  min,
  max,
  value,
  accent,
  units,
  unitValue,
  onValueChange,
  onUnitChange,
  enterDelay = 0,
}: MetricCardProps<U>) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <Animated.View style={styles.metricCardWrapper}>
      <GlassCard
        glowColor={accent}
        padding={18}
        radius={20}
      >
        {/* Header row */}
        <View style={styles.metricHeader}>
          <View>
            <Text style={styles.metricLabel}>
              {label}
            </Text>

            {/* Display number */}
            <Text
              style={[
                styles.metricDisplay,
                { color: "#fff" },
              ]}
            >
              {displayValue}
            </Text>
          </View>

          <UnitToggle
            options={units}
            selected={unitValue}
            accent={accent}
            onSelect={onUnitChange}
          />
        </View>

        {/* Slider track */}
        <View style={styles.sliderWrapper}>
          {/* Filled track visual */}
          <View style={styles.sliderTrackBg}>
            <View
              style={[
                styles.sliderTrackFill,
                {
                  width: `${pct}%` as any,
                  backgroundColor: accent,
                },
              ]}
            />
          </View>

          <Slider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            value={value}
            step={1}
            onValueChange={onValueChange}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor="#fff"
          />
        </View>

        {/* Range labels */}
        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>
            {min} {units[0]}
          </Text>

          <Text style={styles.rangeLabel}>
            {max} {units[0]}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// ─── BMI card ─────────────────────────────────────────────────────────────────
interface BMICardProps {
  bmi: number;
}

const BMICard: React.FC<BMICardProps> = ({ bmi }) => {
  const label = getBMILabel(bmi);
  return (
    <Animated.View style={styles.bmiCardWrapper}>
      <GlassCard padding={18} radius={20}>
        <View style={styles.bmiHeader}>
          <View>
            <Text style={styles.metricLabel}>
              BMI Estimate
            </Text>

            <Text
              style={[
                styles.bmiValue,
                { color: palette.cyan500 },
              ]}
            >
              {bmi.toFixed(1)}
            </Text>
          </View>

          <View style={styles.bmiLabelPill}>
            <Text style={styles.bmiLabelText}>
              {label}
            </Text>
          </View>
        </View>

        {/* Colour-coded bar segments */}
        <View style={styles.bmiBar}>
          {BMI_SEGMENTS.map((seg) => (
            <View
              key={seg.label}
              style={[
                styles.bmiSegment,
                {
                  backgroundColor: seg.color,
                  opacity:
                    bmi >= seg.threshold
                      ? 0.8
                      : 0.22,
                },
              ]}
            />
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ─── Ambient glow orbs ────────────────────────────────────────────────────────
const GlowOrbs: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={[styles.glowOrb, { top: -70, left: -70, width: 260, height: 260 }]}>
      <LinearGradient
        colors={['rgba(124,58,237,0.18)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </View>
    <View style={[styles.glowOrb, { bottom: 60, right: -50, width: 200, height: 200 }]}>
      <LinearGradient
        colors={['rgba(249,115,22,0.14)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  </View>
);

// ─── Helpers: display strings ─────────────────────────────────────────────────
function formatHeight(cm: number, unit: HeightUnit): string {
  if (unit === 'cm') return `${cm} cm`;
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return `${ft}'${inch}"`;
}

function formatWeight(kg: number, unit: WeightUnit): string {
  if (unit === 'kg') return `${kg} kg`;
  return `${Math.round(kg * 2.205)} lbs`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BodyMetricsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; age?: string; gender?: string }>();

  const {
  height,
  weight,
  setHeight,
  setWeight,
} = useOnboardingStore();

  
  const [heightUnit, setHeightUnit] =
  useState<HeightUnit>("cm");

const [weightUnit, setWeightUnit] =
  useState<WeightUnit>("kg");
  const bmi = getBMI(weight, height);

  const handleContinue = () => {
    router.push({
      pathname: '/onboarding/goal-selection',
      
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#0A0514', TOKENS.bg]}
        style={StyleSheet.absoluteFill}
      />

      <GlowOrbs />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stepper */}
        <ProgressStepper
          currentStep={2}
          totalSteps={5}
          onBack={() => router.back()}
          style={styles.stepper}
        />

        {/* Heading */}
        <Animated.View>
          <Text style={styles.sectionHeading}>
            Body Metrics
          </Text>
        </Animated.View>

        <Animated.View>
          <Text style={styles.subtitle}>
            Accurate metrics help our AI calculate your precise nutritional needs.
          </Text>
        </Animated.View>

        {/* Height card */}
        <MetricCard
          label="Height"
          displayValue={formatHeight(height, heightUnit)}
          min={100}
          max={220}
          value={height}
          accent={palette.purple500}
          units={['cm', 'ft'] as HeightUnit[]}
          unitValue={heightUnit}
          onValueChange={setHeight}
          onUnitChange={setHeightUnit}
          enterDelay={0}
        />

        {/* Weight card */}
        <MetricCard
          label="Weight"
          displayValue={formatWeight(weight, weightUnit)}
          min={30}
          max={180}
          value={weight}
          accent={palette.orange500}
          units={['kg', 'lbs'] as WeightUnit[]}
          unitValue={weightUnit}
          onValueChange={setWeight}
          onUnitChange={setWeightUnit}
          enterDelay={100}
        />

        {/* BMI card */}
        <BMICard bmi={bmi} />

        {/* CTA */}
        <Animated.View
          style={{ marginTop: spacing["4"] }}
        >
          <GradientButton
            label="Continue →"
            onPress={handleContinue}
            variant="primary"
            radius={15}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },

  scrollContent: {
    paddingTop: componentSpacing.screenPaddingTop,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
    paddingBottom: componentSpacing.screenPaddingBottom,
  },

  // ── Glow orbs ──────────────────────────
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },

  // ── Stepper ────────────────────────────
  stepper: {
    marginBottom: spacing['6'],
  },

  // ── Typography ─────────────────────────
  sectionHeading: {
    ...typography.sectionHeading,
    color: colors.text.primary,
    marginBottom: spacing['1'],
  },
  subtitle: {
    ...typography.body,
    color: colors.text.tertiary,
    marginBottom: spacing['5.5'],
  },

  // ── Unit toggle ─────────────────────────
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,     // 9
    padding: componentSpacing.unitTogglePadding,
    gap: 3,
  },
  unitButton: {
    paddingVertical: componentSpacing.unitToggleButtonPaddingV,
    paddingHorizontal: componentSpacing.unitToggleButtonPaddingH,
    borderRadius: radius.md,   // 7
  },
  unitButtonText: {
    ...typography.unitToggle,
  },

  // ── Metric card ─────────────────────────
  metricCardWrapper: {
    marginBottom: componentSpacing.cardGap,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4.5'],
  },
  metricLabel: {
    ...typography.overline,
    color: colors.text.caption,
    marginBottom: 3,
  },
  metricDisplay: {
    ...typography.metricDisplay,
  },

  // ── Slider ─────────────────────────────
  sliderWrapper: {
    position: 'relative',
    height: componentSpacing.sliderHeight + 14,
    justifyContent: 'center',
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: componentSpacing.sliderHeight,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 2,
    overflow: 'hidden',
    top: '50%',
    marginTop: -(componentSpacing.sliderHeight / 2),
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 2,
  },
  slider: {
    width: '100%',
    height: componentSpacing.sliderHeight + 14,
  },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing['2'],
  },
  rangeLabel: {
    ...typography.nano,
    color: colors.text.superMuted,
  },

  // ── BMI card ────────────────────────────
  bmiCardWrapper: {
    marginBottom: spacing['6.5'],
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2.5'],
  },
  bmiValue: {
    ...typography.bmiValue,
  },
  bmiLabelPill: {
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 9999,
    backgroundColor: 'rgba(6,182,212,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.30)',
  },
  bmiLabelText: {
    ...typography.badge,
    color: palette.cyan500,
  },
  bmiBar: {
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing['2.5'],
  },
  bmiSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
