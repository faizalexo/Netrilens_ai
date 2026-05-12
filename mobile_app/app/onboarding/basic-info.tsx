/**
 * app/onboarding/basic-info.tsx
 *
 * Netrilens AI — Step 1: Basic Info
 * Matches the HTML reference:
 *   • ProgressStepper (step 1 of 5)
 *   • Section heading + subtitle
 *   • PremiumInput for name & age (animated, staggered)
 *   • Gender segment toggle with spring selection animation
 *   • Feature info chips (🔒 Encrypted / 🧠 AI adapts)
 *   • GradientButton "Continue →"
 *   • Ambient GlowOrbs background
 *
 * deps: expo-router, expo-linear-gradient, react-native-reanimated, moti
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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

// ─── Component imports ────────────────────────────────────────────────────────
import { GlassCard, TOKENS } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { useOnboardingStore } from '@/src/store/onboardingStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type Gender = 'Male' | 'Female' | 'Other';

interface FormState {
  name: string;
  age: string;
  gender: Gender | '';
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

const INFO_CHIPS = [
  { icon: '🔒', text: 'Encrypted & private' },
  { icon: '🧠', text: 'AI adapts to your biology' },
];

// ─── Gender segment button (animated selection) ───────────────────────────────
interface GenderButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const GenderButton: React.FC<GenderButtonProps> = ({ label, selected, onPress }) => {
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, {
      damping: 18,
      stiffness: 200,
    });
  }, [selected]);

  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', TOKENS.purple],
    ),
    shadowOpacity: interpolate(progress.value, [0, 1], [0, 0.4]),
    shadowRadius: interpolate(progress.value, [0, 1], [0, 12]),
  }));

  const animatedText = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255,255,255,0.45)', '#fff'],
    ),
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.genderButtonOuter}
    >
      <Animated.View
        style={[
          styles.genderButton,
          animatedBg,
          {
            shadowColor: TOKENS.purple,
            shadowOffset: { width: 0, height: 2 },
            elevation: selected ? 5 : 0,
          },
        ]}
      >
        <Animated.Text style={[styles.genderLabel, animatedText]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Feature info chip ────────────────────────────────────────────────────────
const InfoChip: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.infoChip}>
    <Text style={styles.infoChipIcon}>{icon}</Text>
    <Text style={styles.infoChipText}>{text}</Text>
  </View>
);

// ─── Ambient glow orbs (shared visual) ───────────────────────────────────────
const GlowOrbs: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={[styles.glowOrb, { top: -70, left: -70, width: 260, height: 260 }]}>
      <LinearGradient
        colors={['rgba(124,58,237,0.18)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </View>
    <View style={[styles.glowOrb, { bottom: 80, right: -60, width: 200, height: 200 }]}>
      <LinearGradient
        colors={['rgba(249,115,22,0.12)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BasicInfoScreen() {
  const router = useRouter();
  const {
    name,
    age,
    gender,
    setName,
    setAge,
    setGender,
  } = useOnboardingStore();



  const handleContinue = () => {
    router.push(
      '/onboarding/body-metrics'
    );
  };



  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#0A0514', TOKENS.bg]}
        style={StyleSheet.absoluteFill}
      />

      <GlowOrbs />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress stepper */}
          <ProgressStepper
            currentStep={1}
            totalSteps={5}
            onBack={() => router.back()}
            style={styles.stepper}
          />

          {/* Section heading */}
          <Animated.View>
            <Text style={styles.sectionHeading}>
              Tell us about yourself
            </Text>
          </Animated.View>

          <Animated.View>
            <Text style={styles.subtitle}>
              We'll use this to craft your personalized AI nutrition profile.
            </Text>
          </Animated.View>

          {/* Inputs */}
          <PremiumInput
            label="Your Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Alex Johnson"
            type="text"
            enterDelay={0}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <PremiumInput
            label="Age"
            value={String(age)}
            onChangeText={(v) => setAge(Number(v) || 0)}
            placeholder="e.g. 27"
            type="number"
            enterDelay={80}
            returnKeyType="done"
          />

          {/* Gender toggle */}
          <Animated.View style={styles.genderWrapper}>
            <Text style={styles.genderLabel_outer}>
              Gender
            </Text>

            <View style={styles.genderTrack}>
              {GENDERS.map((g) => (
                <GenderButton
                  key={g}
                  label={g.charAt(0).toUpperCase() + g.slice(1)}
                  selected={gender === g}
                  onPress={() => setGender(g)}
                />
              ))}
            </View>
          </Animated.View>

          {/* Feature info chips */}
          <Animated.View style={styles.infoChipsRow}>
            {INFO_CHIPS.map((chip) => (
              <InfoChip
                key={chip.text}
                icon={chip.icon}
                text={chip.text}
              />
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View>
            <GradientButton
              label="Continue →"
              onPress={handleContinue}
              variant="primary"
              radius={15}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  // ── Glow orb shells ─────────────────────
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

  // ── Gender segment ─────────────────────
  genderWrapper: {
    marginBottom: spacing['6.5'],
  },
  genderLabel_outer: {
    ...typography.inputLabel,
    color: colors.text.label,
    marginBottom: componentSpacing.inputLabelMarginBottom,
  },
  genderTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: TOKENS.glassBorder,
    borderRadius: radius['4xl'],   // 13
    padding: componentSpacing.segmentPadding,
    gap: componentSpacing.segmentGap,
  },
  genderButtonOuter: {
    flex: 1,
  },
  genderButton: {
    paddingVertical: 11,
    borderRadius: radius.xl,     // 10
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderLabel: {
    ...typography.segment,
  },

  // ── Info chips ─────────────────────────
  infoChipsRow: {
    flexDirection: 'row',
    gap: componentSpacing.infoChipGap,
    marginBottom: spacing['6'],
  },
  infoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: componentSpacing.infoChipPadding,
    borderRadius: radius['3xl'],   // 12
    backgroundColor: TOKENS.glass,
    borderWidth: 1,
    borderColor: TOKENS.glassBorder,
  },
  infoChipIcon: {
    fontSize: 14,
  },
  infoChipText: {
    ...typography.activityDesc,
    color: colors.text.tertiary,
    flex: 1,
  },
});
