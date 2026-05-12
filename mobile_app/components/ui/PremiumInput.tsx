/**
 * PremiumInput.tsx
 * Animated text input matching the Netrilens AI onboarding aesthetic.
 *
 * Features:
 *   • Floating uppercase label that changes color on focus (purple tint)
 *   • Background shifts from subtle glass → purple-tinted glass on focus
 *   • Glowing border + drop-shadow on focus (0 0 16px rgba(124,58,237,.26))
 *   • Entry animation: fadeUp with configurable delay
 *   • Supports text, number, email, password types
 *
 * Dependencies: react-native-reanimated, expo-linear-gradient
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  StyleProp,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

import { TOKENS } from './GlassCard';

// ─── Types ────────────────────────────────────────────────────────────────────
export type InputType = 'text' | 'number' | 'email' | 'password';

export interface PremiumInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: InputType;
  /** Entry animation delay in ms — use to stagger multiple inputs */
  enterDelay?: number;
  /** Extra wrapper style */
  style?: StyleProp<ViewStyle>;
  /** Accent color for focused state; defaults to TOKENS.purple */
  accentColor?: string;
  /** Max character length */
  maxLength?: number;
  /** Forwarded ref to the underlying TextInput */
  inputRef?: React.RefObject<TextInput>;
  /** Called when the return/done key is pressed */
  onSubmitEditing?: () => void;
  /** Whether to show the next / done return key */
  returnKeyType?: TextInputProps['returnKeyType'];
  editable?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
}

// ─── Keyboard type map ────────────────────────────────────────────────────────
const keyboardMap: Record<InputType, KeyboardTypeOptions> = {
  text:     'default',
  number:   'numeric',
  email:    'email-address',
  password: 'default',
};

// ─── Component ────────────────────────────────────────────────────────────────
export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  enterDelay = 0,
  style,
  accentColor = TOKENS.purple,
  maxLength,
  inputRef,
  onSubmitEditing,
  returnKeyType = 'next',
  editable = true,
  autoCapitalize = 'none',
}) => {
  const [focused, setFocused] = useState(false);
  const internalRef = useRef<TextInput>(null);
  const ref = inputRef ?? internalRef;

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

  // ── Focus animation ──────────────────────────────────────────────────────
  const focusAnim = useSharedValue(0);
  useEffect(() => {
    focusAnim.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

  // Animated border + shadow wrapper
  const wrapperAnimStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      ['rgba(255,255,255,0.12)', accentColor],
    );
    return {
      borderColor,
      // Box glow via shadow (iOS) — Android elevation doesn't do color glow
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: interpolate(focusAnim.value, [0, 1], [0, 0.45]),
      shadowRadius: interpolate(focusAnim.value, [0, 1], [0, 14]),
      elevation: interpolate(focusAnim.value, [0, 1], [0, 8]),
    };
  });

  // Animated background fill
  const bgAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      ['rgba(255,255,255,0.04)', 'rgba(124,58,237,0.10)'],
    ),
  }));

  // Animated label color
  const labelAnimStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      focusAnim.value,
      [0, 1],
      ['rgba(255,255,255,0.42)', TOKENS.purpleLight],
    ),
  }));

  return (
    <Animated.View style={[styles.outerWrapper, entryStyle, style]}>
      {/* Label */}
      <Animated.Text style={[styles.label, labelAnimStyle]}>
        {label}
      </Animated.Text>

      {/* Input wrapper */}
      <Animated.View style={[styles.inputWrapper, wrapperAnimStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.bg, bgAnimStyle]} />
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.28)"
          keyboardType={keyboardMap[type]}
          secureTextEntry={type === 'password'}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          editable={editable}
          style={[
            styles.input,
            Platform.OS === 'android' && { includeFontPadding: false },
          ]}
          // Remove native focus ring on web / android
          underlineColorAndroid="transparent"
          selectionColor={TOKENS.purpleLight}
          cursorColor={TOKENS.purpleLight}
        />
      </Animated.View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
  },
  bg: {
    borderRadius: 13,
  },
  input: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#fff',
    fontWeight: '400',
    // Font family can be swapped for Outfit if loaded via expo-font:
    // fontFamily: 'Outfit_400Regular',
  },
});

export default PremiumInput;
