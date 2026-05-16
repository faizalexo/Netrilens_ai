/**
 * app/onboarding/body-metrics.tsx
 *
 * Netrilens AI — Step 2: Body Metrics
 * 100% pixel-perfect match to reference design:
 *   • Dark deep-purple/black gradient bg with ambient glow orbs
 *   • ProgressStepper — step 2 of 5 (purple active, faded inactive)
 *   • Height MetricCard — violet accent, cm/ft animated toggle, filled track slider
 *   • Weight MetricCard — orange accent, kg/lbs animated toggle, filled track slider
 *   • BMI estimate card — cyan value, 4-segment colour-coded bar
 *   • Full-width GradientButton "Continue →"
 *
 * Install deps:
 *   npx expo install @react-native-community/slider expo-linear-gradient
 *   npx expo install react-native-reanimated moti
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  // Backgrounds
  bg:          '#0A0514',
  cardBg:      'rgba(255,255,255,0.055)',
  cardBorder:  'rgba(255,255,255,0.09)',

  // Accents
  purple:      '#8B5CF6',   // violet-500
  purpleDark:  '#7C3AED',   // violet-600
  purpleGlow:  'rgba(124,58,237,0.35)',
  orange:      '#F97316',   // orange-500
  orangeGlow:  'rgba(249,115,22,0.25)',
  cyan:        '#06B6D4',   // cyan-500
  cyanGlow:    'rgba(6,182,212,0.20)',

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textCaption:   'rgba(255,255,255,0.38)',
  textMuted:     'rgba(255,255,255,0.22)',

  // Misc
  backBtnBg:     'rgba(255,255,255,0.08)',
  trackBg:       'rgba(255,255,255,0.10)',
  stepActive:    '#8B5CF6',
  stepDone:      'rgba(139,92,246,0.55)',
  stepInactive:  'rgba(255,255,255,0.15)',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type HeightUnit = 'cm' | 'ft';
type WeightUnit = 'kg' | 'lbs';

// ─── BMI helpers ──────────────────────────────────────────────────────────────
const BMI_SEGMENTS = [
  { label: 'Under',  color: 'rgba(6,182,212,0.75)',  threshold: 0    },
  { label: 'Normal', color: 'rgba(34,197,94,0.75)',  threshold: 18.5 },
  { label: 'Over',   color: 'rgba(249,115,22,0.75)', threshold: 25   },
  { label: 'Obese',  color: 'rgba(239,68,68,0.75)',  threshold: 30   },
];

function getBMI(kg: number, cm: number) {
  return kg / Math.pow(cm / 100, 2);
}

function getBMILabel(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

function formatHeight(cm: number, unit: HeightUnit) {
  if (unit === 'cm') return `${cm} cm`;
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn % 12);
  return `${ft}'${inch}"`;
}

function formatWeight(kg: number, unit: WeightUnit) {
  if (unit === 'kg') return `${kg} kg`;
  return `${Math.round(kg * 2.205)} lbs`;
}

// ─── Animated unit toggle button ──────────────────────────────────────────────
const UnitBtn: React.FC<{
  label: string; active: boolean; accent: string; onPress: () => void;
}> = ({ label, active, accent, onPress }) => {
  const progress = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(active ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [active]);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value, [0, 1], ['transparent', accent],
    ),
  }));

  const txtStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value, [0, 1], ['rgba(255,255,255,0.40)', '#ffffff'],
    ),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[styles.unitBtn, bgStyle]}>
        <Animated.Text style={[styles.unitBtnTxt, txtStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Progress stepper ─────────────────────────────────────────────────────────
const ProgressStepper: React.FC<{
  current: number; total: number; onBack: () => void;
}> = ({ current, total, onBack }) => (
  <View style={styles.stepperRow}>
    {/* Back button */}
    <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>

    {/* Step bars */}
    <View style={styles.stepBars}>
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const color =
          stepNum === current   ? T.stepActive   :
          stepNum < current     ? T.stepDone     :
                                  T.stepInactive;
        return (
          <View
            key={i}
            style={[
              styles.stepBar,
              { backgroundColor: color },
              stepNum === current && styles.stepBarActive,
            ]}
          />
        );
      })}
    </View>
  </View>
);

// ─── Glass card ───────────────────────────────────────────────────────────────
const GlassCard: React.FC<{
  children: React.ReactNode;
  glowColor?: string;
  style?: object;
}> = ({ children, glowColor, style }) => (
  <View style={[styles.glassCard, style]}>
    {glowColor && (
      <View style={[styles.cardGlow, { shadowColor: glowColor }]} />
    )}
    {children}
  </View>
);

// ─── Metric card (height / weight) ───────────────────────────────────────────
function MetricCard<U extends string>({
  label, displayValue, min, max, value, accent,
  units, unitValue, onValueChange, onUnitChange, enterDelay = 0,
}: {
  label: string; displayValue: string; min: number; max: number;
  value: number; accent: string; units: U[]; unitValue: U;
  onValueChange: (v: number) => void; onUnitChange: (u: U) => void;
  enterDelay?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 18, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 130, delay: enterDelay }}
      style={styles.cardWrapper}
    >
      <GlassCard glowColor={accent}>
        {/* Header */}
        <View style={styles.metricHeader}>
          <View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricDisplay}>{displayValue}</Text>
          </View>

          {/* Unit toggle */}
          <View style={styles.unitToggle}>
            {units.map((u) => (
              <UnitBtn
                key={u}
                label={u}
                active={unitValue === u}
                accent={accent}
                onPress={() => onUnitChange(u)}
              />
            ))}
          </View>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          {/* Custom filled track */}
          <View style={styles.trackBg}>
            <View
              style={[
                styles.trackFill,
                { width: `${pct}%` as any, backgroundColor: accent },
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
            thumbTintColor="#ffffff"
          />
        </View>

        {/* Range labels */}
        <View style={styles.rangeRow}>
          <Text style={styles.rangeLabel}>{min} {units[0]}</Text>
          <Text style={styles.rangeLabel}>{max} {units[0]}</Text>
        </View>
      </GlassCard>
    </MotiView>
  );
}

// ─── BMI card ─────────────────────────────────────────────────────────────────
const BMICard: React.FC<{ bmi: number }> = ({ bmi }) => {
  const label = getBMILabel(bmi);
  return (
    <MotiView
      from={{ opacity: 0, translateY: 18, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 130, delay: 200 }}
      style={styles.cardWrapper}
    >
      <GlassCard glowColor={T.cyanGlow}>
        <View style={styles.bmiHeader}>
          <View>
            <Text style={styles.metricLabel}>BMI ESTIMATE</Text>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
          </View>
          <View style={styles.bmiPill}>
            <Text style={styles.bmiPillTxt}>{label}</Text>
          </View>
        </View>

        {/* Segmented bar */}
        <View style={styles.bmiBar}>
          {BMI_SEGMENTS.map((seg) => (
            <View
              key={seg.label}
              style={[
                styles.bmiSeg,
                {
                  backgroundColor: seg.color,
                  opacity:         bmi >= seg.threshold ? 1 : 0.20,
                },
              ]}
            />
          ))}
        </View>
      </GlassCard>
    </MotiView>
  );
};

// ─── Gradient Continue button ─────────────────────────────────────────────────
const ContinueBtn: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <MotiView
    from={{ opacity: 0, translateY: 22 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 480, delay: 320 }}
    style={styles.ctaWrapper}
  >
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.ctaTouchable}>
      <LinearGradient
        colors={['#9333EA', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.ctaGradient}
      >
        {/* Glow shimmer overlay */}
        <View style={styles.ctaGlow} />
        <Text style={styles.ctaLabel}>Continue →</Text>
      </LinearGradient>
    </TouchableOpacity>
  </MotiView>
);

// ─── Ambient glow orbs ────────────────────────────────────────────────────────
const GlowOrbs: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {/* Top-left purple orb */}
    <LinearGradient
      colors={['rgba(124,58,237,0.22)', 'rgba(124,58,237,0.08)', 'transparent']}
      style={[styles.orb, { width: 280, height: 280, top: -80, left: -80 }]}
    />
    {/* Bottom-right orange orb */}
    <LinearGradient
      colors={['rgba(249,115,22,0.16)', 'rgba(249,115,22,0.05)', 'transparent']}
      style={[styles.orb, { width: 220, height: 220, bottom: 80, right: -60 }]}
    />
    {/* Center-left subtle violet */}
    <LinearGradient
      colors={['rgba(139,92,246,0.08)', 'transparent']}
      style={[styles.orb, { width: 160, height: 160, top: '40%', left: -30 }]}
    />
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BodyMetricsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; age?: string; gender?: string }>();

  const [height,     setHeight]     = useState(170);
  const [weight,     setWeight]     = useState(70);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');

  const bmi = getBMI(weight, height);

  const handleContinue = () => {
    router.push({
      pathname: '/onboarding/goal-selection',
      params: {
        ...params,
        height:     String(height),
        weight:     String(weight),
        heightUnit,
        weightUnit,
      },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#0A0514', '#0D0720', '#080410']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient orbs */}
      <GlowOrbs />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Progress stepper */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 380 }}
        >
          <ProgressStepper
            current={2}
            total={5}
            onBack={() => router.back()}
          />
        </MotiView>

        {/* Step label */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 400, delay: 60 }}
        >
          <Text style={styles.stepLabel}>STEP 2 OF 5</Text>
        </MotiView>

        {/* Heading */}
        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 130, delay: 80 }}
        >
          <Text style={styles.heading}>Body Metrics.</Text>
        </MotiView>

        {/* Subtitle */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420, delay: 130 }}
        >
          <Text style={styles.subtitle}>
            Accurate metrics enable our AI to calculate your precise nutritional needs.
          </Text>
        </MotiView>

        {/* Height card */}
        <MetricCard<HeightUnit>
          label="HEIGHT"
          displayValue={formatHeight(height, heightUnit)}
          min={100}
          max={220}
          value={height}
          accent={T.purple}
          units={['cm', 'ft']}
          unitValue={heightUnit}
          onValueChange={(v) => setHeight(v)}
          onUnitChange={setHeightUnit}
          enterDelay={0}
        />

        {/* Weight card */}
        <MetricCard<WeightUnit>
          label="WEIGHT"
          displayValue={formatWeight(weight, weightUnit)}
          min={30}
          max={180}
          value={weight}
          accent={T.orange}
          units={['kg', 'lbs']}
          unitValue={weightUnit}
          onValueChange={(v) => setWeight(v)}
          onUnitChange={setWeightUnit}
          enterDelay={110}
        />

        {/* BMI card */}
        <BMICard bmi={bmi} />

        {/* Continue button */}
        <ContinueBtn onPress={handleContinue} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: T.bg,
  },

  scroll: {
    paddingTop:        Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 20,
    paddingBottom:     48,
  },

  // ── Orbs ──────────────────────────────
  orb: {
    position:     'absolute',
    borderRadius: 9999,
  },

  // ── Stepper ───────────────────────────
  stepperRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  22,
    gap:           14,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: T.backBtnBg,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.08)',
  },
  backArrow: {
    color:    T.textPrimary,
    fontSize: 18,
    lineHeight: 22,
  },
  stepBars: {
    flex:          1,
    flexDirection: 'row',
    gap:           5,
    alignItems:    'center',
  },
  stepBar: {
    flex:         1,
    height:       4,
    borderRadius: 2,
  },
  stepBarActive: {
    height: 4,
  },

  // ── Typography ────────────────────────
  stepLabel: {
    fontSize:      11,
    fontWeight:    '600',
    letterSpacing: 1.6,
    color:         T.textCaption,
    marginBottom:  6,
  },
  heading: {
    fontSize:     34,
    fontWeight:   '800',
    color:        T.textPrimary,
    letterSpacing:-0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize:     14.5,
    fontWeight:   '400',
    lineHeight:   21,
    color:        T.textSecondary,
    marginBottom: 26,
  },

  // ── Glass card ────────────────────────
  glassCard: {
    backgroundColor: T.cardBg,
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     T.cardBorder,
    padding:         18,
    overflow:        'hidden',
    // Subtle backdrop blur effect via shadow
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.30,
    shadowRadius:    16,
    elevation:       8,
  },
  cardGlow: {
    position:      'absolute',
    top:           -1,
    left:          -1,
    right:         -1,
    height:        2,
    borderRadius:  20,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius:  12,
  },

  cardWrapper: {
    marginBottom: 14,
  },

  // ── Metric card ───────────────────────
  metricHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   16,
  },
  metricLabel: {
    fontSize:      10.5,
    fontWeight:    '700',
    letterSpacing: 1.8,
    color:         T.textCaption,
    marginBottom:  5,
  },
  metricDisplay: {
    fontSize:      32,
    fontWeight:    '700',
    color:         T.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Unit toggle ───────────────────────
  unitToggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius:    10,
    padding:         3,
    gap:             2,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.06)',
  },
  unitBtn: {
    paddingVertical:   7,
    paddingHorizontal: 13,
    borderRadius:      8,
  },
  unitBtnTxt: {
    fontSize:   13,
    fontWeight: '700',
  },

  // ── Slider ────────────────────────────
  sliderContainer: {
    height:         44,
    justifyContent: 'center',
    position:       'relative',
  },
  trackBg: {
    position:        'absolute',
    left:            0,
    right:           0,
    height:          4,
    backgroundColor: T.trackBg,
    borderRadius:    2,
    overflow:        'hidden',
  },
  trackFill: {
    height:       '100%',
    borderRadius: 2,
  },
  slider: {
    width:  '100%',
    height: 44,
  },
  rangeRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      4,
  },
  rangeLabel: {
    fontSize:   11,
    color:      T.textMuted,
    fontWeight: '500',
  },

  // ── BMI card ──────────────────────────
  bmiHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   14,
  },
  bmiValue: {
    fontSize:      32,
    fontWeight:    '700',
    color:         T.cyan,
    letterSpacing: -0.5,
  },
  bmiPill: {
    paddingVertical:   6,
    paddingHorizontal: 15,
    borderRadius:      9999,
    backgroundColor:   'rgba(6,182,212,0.10)',
    borderWidth:       1,
    borderColor:       'rgba(6,182,212,0.28)',
  },
  bmiPillTxt: {
    fontSize:      12.5,
    fontWeight:    '700',
    color:         T.cyan,
    letterSpacing: 0.3,
  },
  bmiBar: {
    flexDirection: 'row',
    gap:           4,
  },
  bmiSeg: {
    flex:         1,
    height:       4,
    borderRadius: 2,
  },

  // ── CTA button ───────────────────────
  ctaWrapper: {
    marginTop: 10,
  },
  ctaTouchable: {
    borderRadius: 16,
    overflow:     'hidden',
    // Button outer glow
    shadowColor:    '#8B5CF6',
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.55,
    shadowRadius:   18,
    elevation:      12,
  },
  ctaGradient: {
    height:         58,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
    overflow:       'hidden',
  },
  ctaGlow: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius:    16,
  },
  ctaLabel: {
    fontSize:      17,
    fontWeight:    '700',
    color:         '#ffffff',
    letterSpacing: 0.3,
  },
});