/**
 * GradientButton.tsx
 * Premium CTA button matching the Netrilens AI onboarding aesthetic.
 *
 * Two variants:
 *   primary  — purple→violet gradient with glowing drop-shadow (default)
 *   secondary — ghost button: semi-transparent fill + glass border
 *
 * Press interaction: scale(0.97) spring, matching the HTML onMouseDown handler.
 * Entry animation: fadeUp with configurable delay.
 *
 * Dependencies: expo-linear-gradient, react-native-reanimated
 */

import React, { useEffect } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { TOKENS } from './GlassCard';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary';

export interface GradientButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  /** Extra styles for the wrapper (sets width, margin, etc.) */
  style?: StyleProp<ViewStyle>;
  /** Extra styles for the label text */
  labelStyle?: StyleProp<TextStyle>;
  /** Entry animation delay in ms */
  enterDelay?: number;
  /** Custom gradient colors (primary variant only) */
  gradientColors?: [string, string, ...string[]];
  /** Border radius; defaults to 15 */
  radius?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
  enterDelay = 0,
  gradientColors = [TOKENS.purple, '#9333EA', TOKENS.purpleLight],
  radius = 15,
}) => {
  const isPrimary = variant === 'primary';

  // ── Entry animation (fadeUp) ─────────────────────────────────────────────
  const entry = useSharedValue(0);
  useEffect(() => {
    const t = setTimeout(() => {
      entry.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }, enterDelay);
    return () => clearTimeout(t);
  }, []);

  const entryStyle = useAnimatedStyle(() => ({
    opacity: entry.value,
    transform: [
      { translateY: interpolate(entry.value, [0, 1], [24, 0]) },
    ],
  }));

  // ── Press scale animation ────────────────────────────────────────────────
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pressed.value, [0, 1], [1, 0.97]),
      },
    ],
  }));

  const handlePressIn = () => {
    pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  // ── Glow shadow (primary only) ───────────────────────────────────────────
  const glowShadow: ViewStyle = isPrimary
    ? {
        shadowColor: TOKENS.purple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 18,
        elevation: 14,
      }
    : {};

  return (
    <Animated.View style={[entryStyle, style]}>
      <Animated.View style={[pressStyle, glowShadow, { borderRadius: radius }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={({ pressed: nativePressed }) => [
            styles.base,
            { borderRadius: radius },
            !isPrimary && styles.secondaryBase,
            (disabled || loading) && styles.disabledBase,
          ]}
        >
          {isPrimary ? (
            <LinearGradient
              colors={
                disabled
                  ? (['rgba(124,58,237,0.4)', 'rgba(147,51,234,0.4)', 'rgba(168,85,247,0.4)'] as [string, string, string])
                  : gradientColors
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradient, { borderRadius: radius }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.label, styles.primaryLabel, labelStyle]}>
                  {label}
                </Text>
              )}
            </LinearGradient>
          ) : (
            // Secondary: ghost fill only, no LinearGradient
            <>
              {loading ? (
                <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
              ) : (
                <Text style={[styles.label, styles.secondaryLabel, labelStyle]}>
                  {label}
                </Text>
              )}
            </>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    width: '100%',
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBase: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  disabledBase: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#fff',
  },
  primaryLabel: {
    color: '#fff',
  },
  secondaryLabel: {
    color: '#fff',
  },
});

export default GradientButton;
