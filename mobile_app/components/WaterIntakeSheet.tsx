import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WaterIntakePopupProps {
  visible: boolean;
  currentIntake?: number;   // ml already logged today
  dailyGoal?: number;       // ml goal, default 3000
  onAdd: (ml: number) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [250, 500, 750, 1000] as const;
const STEPPER_STEP = 50;
const STEPPER_MIN = 50;
const STEPPER_MAX = 2000;

const SPRING_OPEN = {
  damping: 22,
  stiffness: 260,
  mass: 0.9,
} as const;

const SPRING_PRESS = {
  damping: 18,
  stiffness: 300,
  mass: 0.7,
} as const;

// ─── Design tokens ────────────────────────────────────────────────────────────

const GLASS = {
  surface: 'rgba(8,6,18,0.88)',
  surfaceLight: 'rgba(255,255,255,0.025)',
  borderSubtle: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.1)',
  purplePrimary: 'rgba(168,85,247,1)',
  purpleGlow: 'rgba(168,85,247,0.22)',
  purpleFaint: 'rgba(168,85,247,0.09)',
  violet: 'rgba(139,92,246,1)',
  violetGlow: 'rgba(139,92,246,0.35)',
  blue: 'rgba(59,130,246,1)',
  blueGlow: 'rgba(59,130,246,0.18)',
  accent: 'rgba(149,120,255,0.75)',
  textPrimary: 'rgba(255,255,255,0.97)',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.28)',
  textGhost: 'rgba(255,255,255,0.22)',
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Gradient border wrapper (simulates per-pixel border with gradient) ───────
function GradientBorder({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.gradientBorderOuter}>
      {/* The gradient "border" is the outer layer */}
      <LinearGradient
        colors={[
          'rgba(168,85,247,0.28)',
          'rgba(139,92,246,0.12)',
          'rgba(59,130,246,0.20)',
          'rgba(139,92,246,0.09)',
          'rgba(168,85,247,0.22)',
        ]}
        locations={[0, 0.25, 0.55, 0.8, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* The glass fill sits 1px inset from the gradient border */}
      <View style={styles.gradientBorderInner}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        {children}
      </View>
    </View>
  );
}

// ── Pill button ───────────────────────────────────────────────────────────────
interface PillButtonProps {
  amount: number;
  selected: boolean;
  onPress: () => void;
}

function PillButton({ amount, selected, onPress }: PillButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.pill, selected && styles.pillSelected, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.93, SPRING_PRESS); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING_PRESS); }}
      onPress={onPress}
    >
      {selected && (
        <LinearGradient
          colors={['rgba(99,102,241,0.22)', 'rgba(139,92,246,0.16)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        +{amount}ml
      </Text>
    </AnimatedPressable>
  );
}

// ── Stepper button ────────────────────────────────────────────────────────────
interface StepperButtonProps {
  symbol: '−' | '+';
  onPress: () => void;
}

function StepperButton({ symbol, onPress }: StepperButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.stepperBtn, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.86, SPRING_PRESS); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING_PRESS); }}
      onPress={onPress}
    >
      <Text style={styles.stepperSymbol}>{symbol}</Text>
    </AnimatedPressable>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
  onPress: () => void;
  customMl: number;
}

function PrimaryButton({ onPress, customMl }: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.97, SPRING_PRESS, () => {
      scale.value = withSpring(1, SPRING_PRESS);
    });
    opacity.value = withTiming(0.80, { duration: 90 }, () => {
      opacity.value = withTiming(1, { duration: 180 });
    });
    runOnJS(onPress)();
  };

  return (
    <Animated.View style={[styles.primaryBtnWrapper, animStyle]}>
      <Pressable onPress={handlePress} style={{ flex: 1 }}>
        {/* Main gradient body */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.8)',
            'rgba(255, 255, 255, 0.65)',
            'rgba(255, 255, 255, 0.75)',

          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryBtnGradient}
        >
          {/* Top specular sheen */}
          <LinearGradient
            colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.primaryBtnSheen}
          />
          <Text style={styles.primaryBtnText}>Add Water</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WaterIntakePopup({
  visible,
  currentIntake = 1500,
  dailyGoal = 3000,
  onAdd,
  onClose,
}: WaterIntakePopupProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customMl, setCustomMl] = useState<number>(500);

  // Animated values
  const popupScale = useSharedValue(0.95);
  const popupOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // ── Animation lifecycle ──────────────────────────────────────────────────
  const animateIn = useCallback(() => {
    backdropOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
    popupOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    popupScale.value = withSpring(1, SPRING_OPEN);
  }, []);

  const animateOut = useCallback((onDone: () => void) => {
    backdropOpacity.value = withTiming(0, { duration: 220 });
    popupOpacity.value = withTiming(0, { duration: 200 });
    popupScale.value = withTiming(0.95, { duration: 200, easing: Easing.in(Easing.quad) }, () => {
      runOnJS(onDone)();
    });
  }, []);

  const handleClose = () => animateOut(onClose);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const popupStyle = useAnimatedStyle(() => ({
    opacity: popupOpacity.value,
    transform: [{ scale: popupScale.value }],
  }));

  // ── Computed values ──────────────────────────────────────────────────────
  const pct = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100);
  const progressWidth = `${pct}%` as const;

  // ── Pill / stepper handlers ──────────────────────────────────────────────
  const handlePillPress = (amount: number) => {
    setSelectedAmount(amount);
    setCustomMl(amount);
  };

  const stepUp = () => {
    const next = Math.min(customMl + STEPPER_STEP, STEPPER_MAX);
    setCustomMl(next);
    setSelectedAmount(-1);
  };

  const stepDown = () => {
    const next = Math.max(customMl - STEPPER_STEP, STEPPER_MIN);
    setCustomMl(next);
    setSelectedAmount(-1);
  };

  const handleAdd = () => {
    onAdd(customMl);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onShow={animateIn}
      onRequestClose={handleClose}
      animationType="none"
    >
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <BlurView intensity={22} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* ── Popup ────────────────────────────────────────────────────── */}
      <View style={styles.centeredWrapper} pointerEvents="box-none">
        <Animated.View style={[styles.popupFloatShadow, popupStyle]}>

          {/* Corner ambient glow — top-right purple */}
          <View style={styles.ambientTopRight} pointerEvents="none" />
          {/* Corner ambient glow — bottom-left blue */}
          <View style={styles.ambientBottomLeft} pointerEvents="none" />

          {/* Gradient border + frosted glass body */}
          <GradientBorder>

            {/* ── Purple top-edge specular line ── */}
            <LinearGradient
              colors={[
                'transparent',
                'rgba(168,85,247,0.55)',
                'rgba(200,180,255,0.7)',
                'rgba(139,92,246,0.55)',
                'transparent',
              ]}
              locations={[0, 0.25, 0.5, 0.75, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topSpecularLine}
            />

            {/* ── Inner top reflection wash ── */}
            <LinearGradient
              colors={['rgba(168,85,247,0.05)', 'rgba(255,255,255,0.01)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.topReflectionWash}
              pointerEvents="none"
            />

            {/* ── Drag indicator ── */}
            <View style={styles.dragIndicatorWrapper}>
              <View style={styles.dragIndicator} />
            </View>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={['rgba(168,85,247,0.20)', 'rgba(59,130,246,0.16)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.iconEmoji}>💧</Text>
              </View>
              <Text style={styles.title}>Water Intake</Text>
              <Text style={styles.subtitle}>Track your daily hydration</Text>
            </View>

            {/* ── Hydration display ── */}
            <View style={styles.displaySection}>
              <Text style={styles.amountText}>
                {currentIntake.toLocaleString()}
                <Text style={styles.amountUnit}> ml</Text>
              </Text>
              <Text style={styles.goalText}>{pct}% of Daily Goal</Text>

              {/* Premium liquid progress bar */}
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[
                    'rgba(99,102,241,0.90)',
                    'rgba(139,92,246,0.85)',
                    'rgba(99,179,237,0.88)',
                  ]}
                  locations={[0, 0.5, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: progressWidth }]}
                >
                  {/* Liquid surface sheen */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Leading-edge glow */}
                  <View style={styles.progressLeadGlow} />
                </LinearGradient>
              </View>
            </View>

            {/* ── Quick amount pills ── */}
            <View style={styles.pillRow}>
              {QUICK_AMOUNTS.map((amt) => (
                <PillButton
                  key={amt}
                  amount={amt}
                  selected={selectedAmount === amt}
                  onPress={() => handlePillPress(amt)}
                />
              ))}
            </View>

            {/* ── Custom stepper ── */}
            <View style={styles.stepperContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.015)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.stepperRow}>
                <StepperButton symbol="−" onPress={stepDown} />
                <View style={styles.stepperCenter}>
                  <Text style={styles.stepperValue}>{customMl}ml</Text>
                  <Text style={styles.stepperLabel}>CUSTOM AMOUNT</Text>
                </View>
                <StepperButton symbol="+" onPress={stepUp} />
              </View>
            </View>

            {/* ── Buttons ── */}
            <View style={styles.btnSection}>

              <PrimaryButton onPress={handleAdd} customMl={customMl} />

              <Pressable
                onPress={handleClose}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>
            </View>

          </GradientBorder>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const RADIUS = 36;

const styles = StyleSheet.create({

  // ── Backdrop ─────────────────────────────────────────────────────────────
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // ── Layout ───────────────────────────────────────────────────────────────
  centeredWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // ── Floating shadow wrapper (sits outside the border radius clip) ─────────
  popupFloatShadow: {
    width: '100%',
    maxWidth: 390,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 28 },
        shadowOpacity: 0.65,
        shadowRadius: 72,
      },
      android: {
        elevation: 32,
      },
    }),
  },

  // ── Gradient border system ────────────────────────────────────────────────
  gradientBorderOuter: {
    borderRadius: RADIUS,
    padding: 1,               // 1px padding = the gradient border thickness
    overflow: 'hidden',
  },
  gradientBorderInner: {
    borderRadius: RADIUS - 1,
    overflow: 'hidden',
    backgroundColor: GLASS.surface,
    paddingBottom: 8,
  },

  // ── Ambient corner glows (absolute to popupFloatShadow, outside clip) ────
  ambientTopRight: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168,85,247,0.08)',
    // Simulated radial glow — RN doesn't support radial gradient on View,
    // so we use a very large shadow spread (iOS only) to approximate.
    ...Platform.select({
      ios: {
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 60,
      },
    }),
  },
  ambientBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59,130,246,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 50,
      },
    }),
  },

  // ── Top specular/reflection elements ─────────────────────────────────────
  topSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 10,
  },
  topReflectionWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },

  // ── Drag indicator ────────────────────────────────────────────────────────
  dragIndicatorWrapper: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 2,
    zIndex: 2,
  },
  dragIndicator: {
    width: 32,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 0,
    zIndex: 2,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GLASS.purpleGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
    }),
  },
  iconEmoji: {
    fontSize: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: GLASS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '400',
    color: GLASS.textGhost,
    letterSpacing: 0.15,
  },

  // ── Hydration display ─────────────────────────────────────────────────────
  displaySection: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    zIndex: 2,
  },
  amountText: {
    fontSize: 62,
    fontWeight: '700',
    color: GLASS.textPrimary,
    letterSpacing: -2.5,
    lineHeight: 68,
    fontVariant: ['tabular-nums'],
  },
  amountUnit: {
    fontSize: 26,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: -0.5,
  },
  goalText: {
    fontSize: 12,
    fontWeight: '400',
    color: GLASS.accent,
    marginTop: 7,
    letterSpacing: 0.3,
  },

  // ── Progress bar ──────────────────────────────────────────────────────────
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    position: 'relative',
  },
  progressLeadGlow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: 'rgba(200,200,255,0.55)',
    borderRadius: 999,
  },

  // ── Quick-amount pills ────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 24,
    paddingTop: 24,
    zIndex: 2,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GLASS.borderSubtle,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  pillSelected: {
    borderColor: 'rgba(139,92,246,0.38)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: GLASS.textTertiary,
    letterSpacing: 0.2,
  },
  pillTextSelected: {
    color: 'rgba(180,160,255,0.95)',
  },

  // ── Stepper ───────────────────────────────────────────────────────────────
  stepperContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GLASS.borderSubtle,
    overflow: 'hidden',
    zIndex: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GLASS.borderMid,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
  stepperSymbol: {
    fontSize: 20,
    fontWeight: '300',
    color: GLASS.textSecondary,
    lineHeight: 24,
    includeFontPadding: false,
  },
  stepperCenter: {
    alignItems: 'center',
    flex: 1,
  },
  stepperValue: {
    fontSize: 26,
    fontWeight: '700',
    color: GLASS.textPrimary,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    lineHeight: 30,
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: GLASS.textGhost,
    marginTop: 3,
    letterSpacing: 1.0,
  },

  // ── Button section ────────────────────────────────────────────────────────
  btnSection: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 6,
    gap: 10,
    zIndex: 2,
  },

  // ── Primary button ────────────────────────────────────────────────────────
  primaryBtnWrapper: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgb(0, 0, 0)',
    ...Platform.select({
      ios: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  primaryBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  primaryBtnSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderRadius: 18,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.97)',
    letterSpacing: 0.05,
    zIndex: 1,
  },

  // ── Cancel button ─────────────────────────────────────────────────────────
 cancelBtn: {
  height: 52,
  borderRadius: 16,
  backgroundColor: 'rgba(239,68,68,0.12)',
  borderWidth: 1,
  borderColor: 'rgba(239,68,68,0.25)',
  alignItems: 'center',
  justifyContent: 'center',
},

cancelText: {
  color: '#EF4444',
  fontSize: 15,
  fontWeight: '600',
  letterSpacing: 0.2,
},
});