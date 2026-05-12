/**
 * ProgressStepper.tsx
 * Step-progress bar matching the Netrilens AI onboarding aesthetic.
 *
 * Matches HTML behaviour exactly:
 *   • Completed steps: purple → purpleLight gradient fill
 *   • Active step: 2.5× wider than inactive, gradient, glowing pulse shadow
 *   • Inactive/future steps: rgba(255,255,255,0.10) fill
 *   • Smooth flex-weight transition via Reanimated spring
 *   • Also renders a back-button slot + step counter text label
 *
 * Usage:
 *   <ProgressStepper
 *     currentStep={2}          // 1-based
 *     totalSteps={5}
 *     onBack={() => goBack()}  // optional; hides button if undefined
 *   />
 *
 * Dependencies: expo-linear-gradient, react-native-reanimated
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { TOKENS } from './GlassCard';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProgressStepperProps {
  /** 1-based current step index */
  currentStep: number;
  totalSteps: number;
  /** Provide to show the back arrow button */
  onBack?: () => void;
  /** Extra wrapper style */
  style?: StyleProp<ViewStyle>;
  /** Height of each step bar; defaults to 4 */
  barHeight?: number;
  /** Gap between step bars; defaults to 5 */
  barGap?: number;
}

// ─── Single bar segment ───────────────────────────────────────────────────────
interface SegmentProps {
  state: 'past' | 'active' | 'future';
  barHeight: number;
}

const INACTIVE_FLEX = 1;
const ACTIVE_FLEX   = 2.5;

const Segment: React.FC<SegmentProps> = ({ state, barHeight }) => {
  // Animate flex weight
  const flex = useSharedValue(
    state === 'active' ? ACTIVE_FLEX : INACTIVE_FLEX,
  );

  useEffect(() => {
    flex.value = withSpring(
      state === 'active' ? ACTIVE_FLEX : INACTIVE_FLEX,
      { damping: 20, stiffness: 140 },
    );
  }, [state]);

  const wrapperStyle = useAnimatedStyle(() => ({
    flex: flex.value,
    height: barHeight,
    borderRadius: barHeight / 2,
    overflow: 'hidden',
  }));

  // Active segment: continuous glow pulse via shadow opacity
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    if (state === 'active') {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [state]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: TOKENS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value * 0.9,
    shadowRadius: 10,
    elevation: state === 'active' ? 8 : 0,
  }));

  return (
    <Animated.View style={[wrapperStyle, glowStyle]}>
      {state === 'future' ? (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderRadius: barHeight / 2,
          }}
        />
      ) : (
        <LinearGradient
          colors={[TOKENS.purple, TOKENS.purpleLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      )}
    </Animated.View>
  );
};

// ─── Header row (back button + step bar row) ──────────────────────────────────
export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps,
  onBack,
  style,
  barHeight = 4,
  barGap = 5,
}) => {
  // Entry fade for the whole header block
  const entryOpacity = useSharedValue(0);
  useEffect(() => {
    entryOpacity.value = withTiming(1, { duration: 400 });
  }, []);
  const entryStyle = useAnimatedStyle(() => ({ opacity: entryOpacity.value }));

  return (
    <Animated.View style={[styles.wrapper, entryStyle, style]}>
      {/* Row: back button + step bars */}
      <View style={styles.row}>
        {/* Back button */}
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.75}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          // Placeholder to keep bars aligned even without back button
          <View style={styles.backBtnPlaceholder} />
        )}

        {/* Step bars */}
        <View style={[styles.barsRow, { gap: barGap }]}>
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNumber = i + 1;
            const state: SegmentProps['state'] =
              stepNumber < currentStep
                ? 'past'
                : stepNumber === currentStep
                ? 'active'
                : 'future';
            return (
              <Segment
                key={i}
                state={state}
                barHeight={barHeight}
              />
            );
          })}
        </View>
      </View>

      {/* Step counter label */}
      <Text style={styles.stepLabel}>
        Step {currentStep} of {totalSteps}
      </Text>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backBtnPlaceholder: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  backArrow: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 18,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.36)',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
});

export default ProgressStepper;
