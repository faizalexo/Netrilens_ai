// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — SkeletonLoader
// Premium shimmer skeleton with animated gradient sweep
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, CHART_HEIGHT } from './theme';

const SCREEN_W = Dimensions.get('window').width;
const SHIMMER_W = SCREEN_W * 1.5;

// ── Base shimmer atom ─────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const SkeletonBox = ({ width = '100%', height = 16, radius = Radius.md, style }: SkeletonProps) => {
  const shimmerAnim = useRef(new Animated.Value(-SHIMMER_W)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: SHIMMER_W,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: Colors.glass,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX: shimmerAnim }],
        }}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.06)',
            'rgba(138,92,246,0.08)',
            'rgba(255,255,255,0.06)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: SHIMMER_W, height: '100%' }}
        />
      </Animated.View>
    </View>
  );
};

// ── Skeleton graph card ───────────────────────────────────────────────────────

export const SkeletonGraph = () => (
  <View style={styles.graphCard}>
    {/* Metric selector pills */}
    <View style={styles.pillRow}>
      {[80, 64, 56, 40, 52].map((w, i) => (
        <SkeletonBox key={i} width={w} height={30} radius={Radius.pill} />
      ))}
    </View>

    {/* Chart area */}
    <View style={styles.chartArea}>
      <SkeletonBox width="100%" height={CHART_HEIGHT} radius={Radius.lg} />
    </View>
  </View>
);

// ── Skeleton summary cards ────────────────────────────────────────────────────

export const SkeletonSummaryCards = () => (
  <View style={styles.cardRow}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.summaryCard}>
        <SkeletonBox width={56} height={10} radius={4} style={{ marginBottom: 10 }} />
        <SkeletonBox width="70%" height={26} radius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox width={48} height={10} radius={4} />
      </View>
    ))}
  </View>
);

// ── Skeleton trend stats ──────────────────────────────────────────────────────

export const SkeletonTrendStats = () => (
  <View style={styles.trendGrid}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.trendCard}>
        <SkeletonBox width={72} height={10} radius={4} style={{ marginBottom: 10 }} />
        <SkeletonBox width={48} height={22} radius={6} style={{ marginBottom: 6 }} />
        <SkeletonBox width={64} height={10} radius={4} />
      </View>
    ))}
  </View>
);

// ── Skeleton insights ─────────────────────────────────────────────────────────

export const SkeletonInsights = () => (
  <View style={styles.insightsCard}>
    <View style={styles.insightsHeader}>
      <SkeletonBox width={24} height={24} radius={12} />
      <SkeletonBox width={96} height={14} radius={4} style={{ marginLeft: 8 }} />
    </View>
    {[1, 2, 3].map((i) => (
      <View key={i} style={styles.insightChip}>
        <SkeletonBox width={24} height={24} radius={12} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox width="90%" height={12} radius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="60%" height={10} radius={4} />
        </View>
      </View>
    ))}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  graphCard: {
    backgroundColor: Colors.glass,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.base,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
    flexWrap: 'wrap',
  },
  chartArea: {
    marginTop: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    minWidth: 100,
  },
  trendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  trendCard: {
    width: '47%',
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  insightsCard: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Colors.glass,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  insightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
});