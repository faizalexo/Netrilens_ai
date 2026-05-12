/**
 * GlassCard.tsx
 * Glassmorphism card matching the Netrilens AI onboarding aesthetic.
 * Supports an optional glow accent color, animated mount reveal, and
 * an optional top-edge highlight line (used on selected goal cards).
 *
 * Dependencies: expo-blur, expo-linear-gradient, react-native-reanimated
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

// ─── Design tokens ────────────────────────────────────────────────────────────
export const TOKENS = {
  purple:      '#7C3AED',
  purpleLight: '#A855F7',
  orange:      '#F97316',
  cyan:        '#06B6D4',
  pink:        '#EC4899',
  bg:          '#050508',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.12)',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GlassCardProps {
  children: React.ReactNode;
  /** Optional hex/rgba accent used for the glow shadow & border tint */
  glowColor?: string;
  /** Show the 1px top-edge gradient shimmer (active selection state) */
  topHighlight?: boolean;
  /** Extra style for the outer container */
  style?: StyleProp<ViewStyle>;
  /** Delay (ms) before the entry animation plays — use for staggered lists */
  enterDelay?: number;
  /** Padding inside the card; defaults to 18 */
  padding?: number;
  /** Border radius; defaults to 20 */
  radius?: number;
  /** Blur intensity passed to BlurView (iOS only); defaults to 18 */
  blurIntensity?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glowColor,
  topHighlight = false,
  style,
  enterDelay = 0,
  padding = 18,
  radius = 20,
  blurIntensity = 18,
}) => {
  // Entry animation — fade + translateY (mirrors CSS `reveal` keyframe)
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withSpring(1, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
    }, enterDelay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.86, 1]) },
      { translateY: interpolate(progress.value, [0, 1], [14, 0]) },
    ],
  }));

  // Build dynamic border color: tinted when glow accent is provided
  const borderColor = glowColor
    ? hexToRgba(glowColor, 0.35)
    : TOKENS.glassBorder;

  // Box shadow on iOS via shadowColor; on Android elevation only gives limited glow
  const glowShadow: ViewStyle = glowColor
    ? {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
        elevation: 10,
      }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        glowShadow,
        { borderRadius: radius, borderColor },
        animatedStyle,
        style,
      ]}
    >
      {/* Blur layer — gracefully degrades on Android */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : null}

      {/* Glass fill — visible on both platforms */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, backgroundColor: TOKENS.glass },
        ]}
      />

      {/* Top-edge highlight shimmer (selected state) */}
      {topHighlight && glowColor && (
        <View
          style={[
            styles.topEdge,
            {
              borderRadius: radius,
              // Simulate linear-gradient via a thin View with opacity
              backgroundColor: hexToRgba(glowColor, 0.7),
              height: 1,
            },
          ]}
        />
      )}

      {/* Inner inset highlight (top 1px white sheen) */}
      <View
        style={[
          styles.insetHighlight,
          { borderRadius: radius },
        ]}
      />

      {/* Content */}
      <View style={{ padding, borderRadius: radius, overflow: 'hidden' }}>
        {children}
      </View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    zIndex: 10,
  },
  insetHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 5,
  },
});

// ─── Utility ──────────────────────────────────────────────────────────────────
/** Convert a 6-digit hex color to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default GlassCard;
