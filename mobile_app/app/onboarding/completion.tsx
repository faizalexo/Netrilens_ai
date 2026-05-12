/**
 * app/onboarding/completion.tsx
 * Onboarding Completion — Welcome & Dashboard Entry
 * Netrilens AI · Expo Router · React Native · Reanimated · Moti
 *
 * Features:
 *   • "Pop" entrance animation for the ✨ success icon
 *   • Floating particle system
 *   • Radial burst glow behind the icon
 *   • AI message card with gradient border
 *   • 2×2 stat grid (goal, activity, plan type, updated)
 *   • Primary CTA → navigation to dashboard
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';


// ─── Design System ────────────────────────────────────────────────────────────
import { GradientButton } from '@/components/ui/GradientButton';
import { TOKENS } from '@/components/ui/GlassCard';
import { colors } from '@/src/theme/colors';
import { radius as R, componentSpacing, dimensions } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Label helpers ────────────────────────────────────────────────────────────
function goalLabel(goal: string): string {
  switch (goal) {
    case 'lose': return '🔥 Lose Fat';
    case 'muscle': return '💪 Build Muscle';
    case 'maintain': return '⚖️ Maintain';
    default: return '⚖️ Maintain';
  }
}

function activityLabel(activity: string): string {
  const labels: Record<string, string> = {
    sedentary: 'Sedentary',
    lightly: 'Lightly Active',
    moderate: 'Moderate',
    very: 'Very Active',
    athlete: 'Athlete',
  };
  return labels[activity] ?? 'Moderate';
}

// ─── Floating Particles ───────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const PARTICLE_COLORS = [TOKENS.purple, TOKENS.cyan, TOKENS.pink, TOKENS.orange, TOKENS.purpleLight];

function generateParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 15 + Math.random() * 70,
    size: Math.random() * 3.5 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 7 + 6,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  }));
}

function FloatingParticle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.7);
  const scale = useSharedValue(1);

  useEffect(() => {
    const delay = particle.delay * 1000;
    const dur = particle.duration * 1000;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-350, { duration: dur, easing: Easing.linear }),
        -1, false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: dur * 0.1 }),
          withTiming(0, { duration: dur * 0.9 }),
        ),
        -1, false,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: dur, easing: Easing.linear }),
        -1, false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          shadowColor: particle.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: particle.size * 2,
          elevation: 2,
        },
      ]}
    />
  );
}

function Particles({ count = 20 }: { count?: number }) {
  const particles = useRef(generateParticles(count)).current;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <FloatingParticle key={p.id} particle={p} />
      ))}
    </View>
  );
}

// ─── Success Icon ─────────────────────────────────────────────────────────────
function SuccessIcon() {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-20);
  const opacity = useSharedValue(0);

  useEffect(() => {




    // Delay 200ms then pop in
    const t = setTimeout(() => {
      // Phase 1: scale overshoot
      scale.value = withSpring(1.15, { damping: 10, stiffness: 180 });
      rotate.value = withSpring(4, { damping: 10, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 120 });

      // Phase 2: settle
      setTimeout(() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 200 });
        rotate.value = withSpring(0, { damping: 14, stiffness: 200 });
      }, 300);

      // Phase 3: final rest
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 200 });
      }, 480);
    }, 200);
    return () => clearTimeout(t);
  }, []);



  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1
    };
  });

  // Pulsing glow
  const glow = useSharedValue(0.55);
  useEffect(() => {
    const t = setTimeout(() => {
      glow.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.55, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }, 900);
    return () => clearTimeout(t);
  }, []);


  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  const iconSize = dimensions.completionIconSize;

  return (
    <Animated.View
      style={[

        glowStyle,
        styles.successIcon,
        {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          shadowColor: TOKENS.purple,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 42,
          elevation: 18,
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(124,58,237,0.40)', 'rgba(168,85,247,0.10)']}
        style={[StyleSheet.absoluteFill, { borderRadius: iconSize / 2 }]}
      />
      <Text style={{ fontSize: 40 }}>✨</Text>
    </Animated.View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <Animated.View style={styles.statCard}>
      <Text style={styles.statCardLabel}>
        {label}
      </Text>

      <Text style={styles.statCardValue}>
        {value}
      </Text>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CompletionScreen() {
  const scaleAnim = useSharedValue(0.9);

  const opacityAnim = useSharedValue(0);
  useEffect(() => {

    opacityAnim.value = withTiming(1, {
      duration: 700,
    });

    scaleAnim.value = withSpring(1, {
      damping: 14,
      stiffness: 120,
    });

  }, []);
  const animStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,

      transform: [
        {
          scale: scaleAnim.value,
        },
      ],
    };
  });
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    goal: string;
    activity: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }>();

  const { name = '', goal = 'maintain', activity = 'moderate' } = params;

  const handleDashboard = useCallback(() => {
    // In a real app: router.replace('/(tabs)/dashboard')
    router.replace('/');
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background */}
      <LinearGradient
        colors={['#080513', TOKENS.bg]}
        style={StyleSheet.absoluteFill}
      />

      {/* Radial burst behind icon */}
      <Animated.View
        style={styles.burstOrb}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            'rgba(124,58,237,0.22)',
            'transparent',
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating particles */}
      <Particles count={22} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Success icon */}
        <SuccessIcon />

        {/* Welcome headline */}
        <Animated.View style={styles.headlineBlock}>
          <Text style={styles.brandLabel}>
            Welcome to Netrilens AI
          </Text>

          <Text style={styles.headline}>
            {name ? `Hey ${name}! 👋` : "You're All Set! 🎉"}
          </Text>

          <Text style={styles.subtext}>
            Your personalized AI nutrition blueprint is ready.
            {"\n"}
            Your transformation starts now.
          </Text>
        </Animated.View>

        {/* AI message card */}
        <Animated.View style={styles.aiCard}>
          <LinearGradient
            colors={[
              'rgba(124,58,237,0.11)',
              'rgba(6,182,212,0.07)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: R['6xl'] },
            ]}
          />

          <View style={styles.aiCardRow}>
            {/* AI avatar */}
            <View style={styles.aiAvatar}>
              <LinearGradient
                colors={[
                  TOKENS.purple,
                  TOKENS.purpleLight,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <Text style={{ fontSize: 14 }}>
                🤖
              </Text>
            </View>

            {/* Message */}
            <View style={styles.aiMessageWrap}>
              <Text style={styles.aiLabel}>
                NETRILENS AI
              </Text>

              <Text style={styles.aiQuote}>
                {
                  `"I've analyzed your biometrics and crafted a precision nutrition plan. `
                }
                {
                  `Follow your macros consistently and you'll see measurable results within 3–4 weeks."`
                }
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Goal" value={goalLabel(goal)} delay={600} />
          <StatCard label="Activity" value={activityLabel(activity)} delay={660} />
          <StatCard label="Plan Type" value="AI Blueprint" delay={720} />
          <StatCard label="Updated" value="Just now" delay={780} />
        </View>

        {/* CTA */}
        <Animated.View style={{ width: "100%" }}>
          <GradientButton
            label="Enter Dashboard →"
            onPress={handleDashboard}
            variant="primary"
          />
        </Animated.View>
        {/* Footer note */}
        <Animated.View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Your plan updates intelligently as you progress
          </Text>
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
    paddingTop: componentSpacing.screenPaddingTopHero,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
    paddingBottom: componentSpacing.completionAiAvatarSize + 24,
    alignItems: 'center',
  },

  // Burst glow
  burstOrb: {
    position: 'absolute',
    top: -90,
    alignSelf: 'center',
    left: (SCREEN_W - 360) / 2,
    width: 360,
    height: 360,
    borderRadius: 180,
    overflow: 'hidden',
  },

  // Particles
  particle: {
    position: 'absolute',
  },

  // Success icon
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dimensions.completionIconMarginBottom,
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.62)',
    overflow: 'hidden',
  },

  // Headline
  headlineBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  brandLabel: {
    ...typography.brandLabel,
    color: TOKENS.purpleLight,
    marginBottom: 9,
  },
  headline: {
    ...typography.heroTitleSm,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 9,
  },
  subtext: {
    ...typography.body,
    color: 'rgba(255,255,255,0.50)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // AI card
  aiCard: {
    width: '100%',
    padding: componentSpacing.aiPanelPadding,
    borderRadius: R['6xl'],
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.24)',
    marginBottom: componentSpacing.aiPanelMarginBottom,
    overflow: 'hidden',
    position: 'relative',
  },
  aiCardRow: {
    flexDirection: 'row',
    gap: componentSpacing.aiPanelGap,
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: dimensions.completionAiAvatarSize,
    height: dimensions.completionAiAvatarSize,
    borderRadius: dimensions.completionAiAvatarRadius,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: TOKENS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    elevation: 8,
  },
  aiMessageWrap: { flex: 1 },
  aiLabel: {
    ...typography.brandLabel,
    color: TOKENS.purpleLight,
    fontSize: 9,
    marginBottom: 4,
  },
  aiQuote: {
    ...typography.aiQuote,
    color: 'rgba(255,255,255,0.65)',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dimensions.completionGridGap,
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    width: `${(100 - dimensions.completionGridGap / 2) / 2}%`,
    padding: componentSpacing.cardPaddingSmall,
    borderRadius: R['4xl'],
    backgroundColor: TOKENS.glass,
    borderWidth: 1,
    borderColor: TOKENS.glassBorder,
    minWidth: 0,
  },
  statCardLabel: {
    ...typography.statCardLabel,
    color: 'rgba(255,255,255,0.36)',
    marginBottom: 4,
  },
  statCardValue: {
    ...typography.statCardValue,
    color: '#fff',
  },

  // Footer
  footerNote: {
    marginTop: 13,
  },
  footerText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.26)',
    textAlign: 'center',
  },
});
