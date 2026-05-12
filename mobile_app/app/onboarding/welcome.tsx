/**
 * app/onboarding/welcome.tsx
 *
 * Netrilens AI — Welcome Screen
 * Matches the HTML reference exactly:
 *   • Floating AI orb (conic-gradient ring via SVG arcs, satellite dots, SVG core icon)
 *   • Ambient glow orbs + rising particle dots
 *   • Bottom panel: badge → hero headline → subtitle → CTAs → stats row
 *   • All entry animations via Moti / Reanimated
 *
 * deps: expo-router, expo-linear-gradient, expo-blur,
 *       react-native-reanimated, moti, react-native-svg
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import Svg, { Path, Circle, Line } from 'react-native-svg';

// ─── Theme imports ────────────────────────────────────────────────────────────
import { palette, colors } from '@/src/theme/colors';
import { fontFamily, typography, fontSize, letterSpacing } from '@/src/theme/typography';
import { componentSpacing, spacing, radius } from '@/src/theme/spacing';
import { backgroundGradients, radialGradients } from '@/src/theme/gradients';

// ─── Component imports ────────────────────────────────────────────────────────
import { GradientButton } from '@/components/ui/GradientButton';
import { TOKENS } from '@/components/ui/GlassCard';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Ambient glow orbs ────────────────────────────────────────────────────────
const GlowOrbs: React.FC = () => {
  const pulseA = useSharedValue(0.5);
  const pulseB = useSharedValue(0.5);
  const pulseC = useSharedValue(0.5);

  useEffect(() => {
    pulseA.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    pulseB.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    pulseC.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const styleA = useAnimatedStyle(() => ({
    opacity: pulseA.value,
    transform: [{ scale: interpolate(pulseA.value, [0.5, 1], [1, 1.07]) }],
  }));
  const styleB = useAnimatedStyle(() => ({
    opacity: pulseB.value,
    transform: [{ scale: interpolate(pulseB.value, [0.5, 1], [1, 1.07]) }],
  }));
  const styleC = useAnimatedStyle(() => ({
    opacity: pulseC.value,
    transform: [{ scale: interpolate(pulseC.value, [0.5, 1], [1, 1.07]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.glowOrb,
          { top: -70, left: -70, width: 260, height: 260 },
          styleA,
        ]}
      >
        <LinearGradient
          colors={['rgba(124,58,237,0.22)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.glowOrb,
          { bottom: 50, right: -50, width: 200, height: 200 },
          styleB,
        ]}
      >
        <LinearGradient
          colors={['rgba(249,115,22,0.18)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.glowOrb,
          { top: '40%', right: -40, width: 150, height: 150 },
          styleC,
        ]}
      >
        <LinearGradient
          colors={['rgba(6,182,212,0.16)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// ─── Rising particle dots ─────────────────────────────────────────────────────
interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const PARTICLE_COLORS = [
  TOKENS.purple, TOKENS.cyan, TOKENS.pink, TOKENS.orange, TOKENS.purpleLight,
];

const Particle: React.FC<{ cfg: ParticleConfig }> = ({ cfg }) => (
  <Animated.View
    style={[
      styles.particle,
      {
        left: `${cfg.x}%` as any,
        top: `${cfg.y}%` as any,
        width: cfg.size,
        height: cfg.size,
        borderRadius: cfg.size / 2,
        backgroundColor: cfg.color,
        shadowColor: cfg.color,
        shadowOpacity: 0.8,
        shadowRadius: cfg.size * 2,
        elevation: 2,
        opacity: 0.7,
      },
    ]}
  />
);

const Particles: React.FC<{ n?: number }> = ({ n = 12 }) => {
  const particles = useRef<ParticleConfig[]>(
    Array.from({ length: n }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 15 + Math.random() * 70,
      size: Math.random() * 3.5 + 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      delay: Math.random() * 5,
      duration: Math.random() * 7 + 6,
    })),
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((cfg) => (
        <Particle key={cfg.id} cfg={cfg} />
      ))}
    </View>
  );
};

// ─── Orbital rings ────────────────────────────────────────────────────────────
const OrbitalRings: React.FC = () => {
  const pulse = useSharedValue(0.5);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);
  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.orbitalRingContainer} pointerEvents="none">
      <Animated.View style={[styles.ring1, ringStyle]} />
      <View style={styles.ring2} />
    </View>
  );
};

// ─── Conic-gradient ring (SVG arcs) ──────────────────────────────────────────
const CX = 130;
const CY = 130;
const R = 127;

function polarToXY(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const s = polarToXY(startDeg);
  const e = polarToXY(endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
}

const SATELLITE_COLORS = [
  TOKENS.purple, TOKENS.cyan, TOKENS.pink,
  TOKENS.orange, TOKENS.purpleLight, TOKENS.cyan,
];
const SATELLITE_DEGREES = [0, 60, 120, 180, 240, 300];

const AIOrb: React.FC = () => {
  // Float animation
  const floatY = useSharedValue(0);
  // Outer ring rotation
  const outerSpin = useSharedValue(0);
  // Inner ring counter-spin
  const innerSpin = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-16, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    outerSpin.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
    innerSpin.value = withRepeat(
      withTiming(-360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerSpin.value}deg` }],
  }));
  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${innerSpin.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.orbWrapper, floatStyle]}>
      {/* Spinning conic-gradient ring */}
      <Animated.View style={[StyleSheet.absoluteFill, outerRingStyle]}>
        <Svg width={260} height={260}>
          <Path d={arcPath(0, 90)} stroke={TOKENS.purple} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d={arcPath(90, 180)} stroke={TOKENS.cyan} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d={arcPath(180, 270)} stroke={TOKENS.pink} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Path d={arcPath(270, 360)} stroke={TOKENS.orange} strokeWidth={2} fill="none" strokeLinecap="round" />
        </Svg>
      </Animated.View>

      {/* Dark inner fill */}
      <View style={styles.orbInnerFill} />

      {/* Satellite dots */}
      {SATELLITE_DEGREES.map((deg, i) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const cx = 130 + 124 * Math.cos(rad);
        const cy = 130 + 124 * Math.sin(rad);
        return (
          <View
            key={i}
            style={[
              styles.satelliteDot,
              {
                left: cx - 4,
                top: cy - 4,
                backgroundColor: SATELLITE_COLORS[i],
                shadowColor: SATELLITE_COLORS[i],
              },
            ]}
          />
        );
      })}

      {/* Orb core */}
      <View style={styles.orbCore}>
        <LinearGradient
          colors={[
            'rgba(168,85,247,0.52)',
            'rgba(124,58,237,0.22)',
            'rgba(5,5,8,0.92)',
          ]}
          start={{ x: 0.35, y: 0.35 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 69 }]}
        />
        {/* SVG AI icon */}
        <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
          <Circle cx={30} cy={30} r={20} stroke={TOKENS.purpleLight} strokeWidth={1.2} opacity={0.55} />
          <Circle cx={30} cy={30} r={12} fill="rgba(168,85,247,0.18)" stroke={TOKENS.purpleLight} strokeWidth={1} />
          <Circle cx={30} cy={30} r={5} fill={TOKENS.purpleLight} />
          {[0, 90, 180, 270].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <Line
                key={a}
                x1={30 + 19 * Math.cos(rad)} y1={30 + 19 * Math.sin(rad)}
                x2={30 + 27 * Math.cos(rad)} y2={30 + 27 * Math.sin(rad)}
                stroke={TOKENS.purpleLight}
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
          {[45, 135, 225, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <Line
                key={a}
                x1={30 + 15 * Math.cos(rad)} y1={30 + 15 * Math.sin(rad)}
                x2={30 + 22 * Math.cos(rad)} y2={30 + 22 * Math.sin(rad)}
                stroke={TOKENS.cyan}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.6}
              />
            );
          })}
        </Svg>
      </View>
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <LinearGradient
        colors={['#0A0514', TOKENS.bg, '#0A0514']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <GlowOrbs />
      <Particles n={14} />
      <OrbitalRings />
      <AIOrb />

      {/* Bottom panel ─────────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={['rgba(5,5,8,0)', 'rgba(5,5,8,0.72)', 'rgba(5,5,8,0.98)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* AI-Powered badge */}
        <Animated.View style={styles.badge}>
          <BadgeDot />

          <Text style={styles.badgeText}>
            AI-Powered Nutrition
          </Text>
        </Animated.View>

        {/* Hero headline */}
        <Animated.View>
          <Text style={styles.heroTitle}>
            {"Your AI Nutrition\nJourney "}

            <Text style={styles.heroAccent}>
              Starts Here
            </Text>
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View>
          <Text style={styles.subtitle}>
            Personalized nutrition powered by intelligent insights — built for your unique biology.
          </Text>
        </Animated.View>
        {/* CTA buttons */}
        <Animated.View style={styles.ctaGroup}>
          <GradientButton
            label="Get Started →"
            onPress={() => router.push("/onboarding/basic-info")}
            variant="primary"
            radius={15}
          />

          <GradientButton
            label="I Already Have An Account"
            onPress={() => router.push("/(auth)/login")}
            variant="secondary"
            radius={15}
            style={{ marginTop: spacing["2.5"] }}
          />
        </Animated.View>

        {/* Stats row */}
        <Animated.View style={styles.statsRow}>
          {STATS.map(({ value, label }) => (
            <View
              key={label}
              style={styles.statItem}
            >
              <Text style={styles.statValue}>
                {value}
              </Text>

              <Text style={styles.statLabel}>
                {label}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const BadgeDot: React.FC = () => {
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);
  const dotStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    shadowOpacity: glow.value * 0.8,
  }));
  return (
    <Animated.View
      style={[
        styles.badgeDot,
        dotStyle,
      ]}
    />
  );
};

const STATS = [
  { value: '2M+', label: 'Users' },
  { value: '98%', label: 'Accuracy' },
  { value: '#1', label: 'AI Nutrition' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },

  // ── Glow orbs ──────────────────────────
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },

  // ── Particles ─────────────────────────
  particle: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
  },

  // ── Orbital rings ─────────────────────
  orbitalRingContainer: {
    position: 'absolute',
    top: '13%',
    alignSelf: 'center',
    width: 220,
    height: 220,
  },
  ring1: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.17)',
  },
  ring2: {
    position: 'absolute',
    top: 18,
    left: -18,
    width: 165,
    height: 165,
    borderRadius: 82.5,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.10)',
  },

  // ── AI Orb ────────────────────────────
  orbWrapper: {
    position: 'absolute',
    top: '7%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerFill: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 9999,
    backgroundColor: '#070510',
  },
  satelliteDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.9,
    elevation: 4,
  },
  orbCore: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: TOKENS.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.52,
    shadowRadius: 46,
    elevation: 20,
  },

  // ── Bottom panel ──────────────────────
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: componentSpacing.welcomePanelPaddingH,
    paddingTop: componentSpacing.welcomePanelPaddingTop,
    paddingBottom: componentSpacing.welcomePanelPaddingBottom,
  },

  // ── Badge ─────────────────────────────
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    backgroundColor: 'rgba(124,58,237,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.28)',
    borderRadius: 9999,
    paddingVertical: componentSpacing.badgePaddingV,
    paddingHorizontal: componentSpacing.badgePaddingH,
    marginBottom: spacing['6'],
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.purpleLight,
    shadowColor: TOKENS.purpleLight,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 2,
  },
  badgeText: {
    ...typography.badge,
    color: TOKENS.purpleLight,
  },

  // ── Headline ──────────────────────────
  heroTitle: {
    ...typography.heroTitle,
    color: colors.text.primary,
    marginBottom: spacing['2.5'],
  },
  heroAccent: {
    // MaskedView would be ideal; fallback to purpleLight for gradient text
    color: TOKENS.purpleLight,
  },

  // ── Subtitle ──────────────────────────
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing['7.5'],
  },

  // ── CTAs ──────────────────────────────
  ctaGroup: {
    gap: spacing['2.5'],
  },

  // ── Stats ─────────────────────────────
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: componentSpacing.welcomeStatsMarginTop,
    paddingTop: componentSpacing.welcomeStatsPaddingTop,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.statValue,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.statLabel,
    color: colors.text.muted,
    marginTop: 2,
  },
});
