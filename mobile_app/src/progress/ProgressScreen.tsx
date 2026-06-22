// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — ProgressScreen
// Premium nutrition progress visualization · Dark luxury · Glassmorphism
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
  StatusBar,
  FlatList,
  Pressable,
  AccessibilityInfo,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from "@react-navigation/native";
import { useProgress, useProgressMetrics } from './useProgress';
import { ProgressChart } from './ProgressChart';
import {
  SkeletonGraph,
  SkeletonSummaryCards,
  SkeletonTrendStats,
  SkeletonInsights,
} from './SkeletonLoader';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadows,
  SCREEN_W,
} from './theme';
import type {
  TimeRange,
  MetricKey,
  SummaryCard,
  TrendStat,
  AIInsight,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TIME_RANGES: TimeRange[] = ['7D', '30D', '90D', '1Y'];

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
  { key: 'water', label: 'Water' },
];

const SUMMARY_CARD_WIDTH = 148;
const GRAPH_CARD_PADDING = 16;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Header ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onCalendarPress: () => void;
  headerOpacity: Animated.Value;
}

const Header = ({ onCalendarPress, headerOpacity }: HeaderProps) => (
  <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
    <View>
      <Text style={styles.headerTitle}>Progress</Text>
      <Text style={styles.headerSubtitle}>Track your nutrition journey</Text>
    </View>
    <TouchableOpacity
      style={styles.calendarBtn}
      onPress={onCalendarPress}
      accessibilityLabel="Open date range selector"
      activeOpacity={0.7}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.calendarBtnInner}>
        <Ionicons name="calendar-outline" size={18} color={Colors.textAccent} />
      </View>
    </TouchableOpacity>
  </Animated.View>
);

// ── Time Range Selector ───────────────────────────────────────────────────────

interface RangeSelectorProps {
  selected: TimeRange;
  onChange: (r: TimeRange) => void;
}

const RangeSelector = ({ selected, onChange }: RangeSelectorProps) => {
  const indicatorX = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const [tabOffsets, setTabOffsets] = useState<number[]>([]);

  const selectedIndex = TIME_RANGES.indexOf(selected);

  useEffect(() => {
    if (tabOffsets[selectedIndex] !== undefined) {
      Animated.spring(indicatorX, {
        toValue: tabOffsets[selectedIndex],
        tension: 300,
        friction: 28,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, tabOffsets]);

  return (
    <View style={styles.rangeContainer}>
      <BlurView intensity={16} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.rangeInner}>
        {/* Sliding indicator */}
        {tabWidths[selectedIndex] && (
          <Animated.View
            style={[
              styles.rangeIndicator,
              {
                width: tabWidths[selectedIndex],
                transform: [{ translateX: indicatorX }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(138,92,246,0.5)', 'rgba(99,60,212,0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {TIME_RANGES.map((range, i) => (
          <TouchableOpacity
            key={range}
            onLayout={(e) => {
              const { width, x } = e.nativeEvent.layout;
              setTabWidths((prev) => {
                const next = [...prev];
                next[i] = width;
                return next;
              });
              setTabOffsets((prev) => {
                const next = [...prev];
                next[i] = x;
                return next;
              });
            }}
            onPress={() => onChange(range)}
            style={styles.rangeTab}
            accessibilityRole="tab"
            accessibilityState={{ selected: selected === range }}
          >
            <Text
              style={[
                styles.rangeTabText,
                selected === range && styles.rangeTabTextActive,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ── Summary Card ──────────────────────────────────────────────────────────────

interface SummaryCardItemProps {
  card: SummaryCard;
  index: number;
}

const SummaryCardItem = ({ card, index }: SummaryCardItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPositive = card.change >= 0;
  const hasChange = card.change !== 0;
  const metricColor = card.metricKey !== 'consistency'
    ? Colors.metricColors[card.metricKey as MetricKey]
    : Colors.purple;

  return (
    <Animated.View
      style={[
        styles.summaryCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Glow */}
      <View
        style={[
          styles.summaryCardGlow,
          { backgroundColor: metricColor + '20' },
        ]}
      />
      <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />

      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryCardLabel}>{card.label}</Text>

        <View style={styles.summaryCardValueRow}>
          <Text style={[styles.summaryCardValue, { color: Colors.textPrimary }]}>
            {card.value}
          </Text>
          <Text style={styles.summaryCardUnit}> {card.unit}</Text>
        </View>

        {hasChange && (
          <View style={styles.summaryCardChange}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={isPositive ? Colors.success : Colors.error}
            />
            <Text
              style={[
                styles.summaryCardChangeTxt,
                { color: isPositive ? Colors.success : Colors.error },
              ]}
            >
              {Math.abs(card.change)}% vs prior
            </Text>
          </View>
        )}
      </View>

      {/* Bottom accent line */}
      <LinearGradient
        colors={[metricColor + '80', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.summaryCardAccent}
      />
    </Animated.View>
  );
};

// ── Metric Selector Pills ─────────────────────────────────────────────────────

interface MetricSelectorProps {
  selected: MetricKey;
  onChange: (m: MetricKey) => void;
}

const MetricSelector = ({ selected, onChange }: MetricSelectorProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.metricPillsContainer}
  >
    {METRICS.map((m) => {
      const isActive = m.key === selected;
      const color = Colors.metricColors[m.key];
      return (
        <TouchableOpacity
          key={m.key}
          onPress={() => onChange(m.key)}
          style={[
            styles.metricPill,
            isActive && {
              backgroundColor: color + '25',
              borderColor: color + '80',
              ...Shadows.glassCard,
              shadowColor: color,
            },
          ]}
          accessibilityRole="radio"
          accessibilityState={{ checked: isActive }}
        >
          {isActive && (
            <View
              style={[styles.metricPillDot, { backgroundColor: color }]}
            />
          )}
          <Text
            style={[
              styles.metricPillText,
              isActive && { color, fontWeight: '600' },
            ]}
          >
            {m.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

// ── Trend Stat Card ───────────────────────────────────────────────────────────

interface TrendCardProps {
  stat: TrendStat;
  index: number;
}

const TrendStatCard = ({ stat, index }: TrendCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 300 + index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: 300 + index * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.trendCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={styles.trendCardLabel}>{stat.label}</Text>
      <Text style={styles.trendCardValue}>{stat.value}</Text>
      {stat.sub && <Text style={styles.trendCardSub}>{stat.sub}</Text>}
    </Animated.View>
  );
};

// ── AI Insight Chip ───────────────────────────────────────────────────────────

interface InsightChipProps {
  insight: AIInsight;
  index: number;
}

const InsightChip = ({ insight, index }: InsightChipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 500 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 500 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.insightChip,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.insightChipIcon}>
        <Text style={styles.insightEmoji}>{insight.icon}</Text>
      </View>
      <Text style={styles.insightText}>{insight.text}</Text>
    </Animated.View>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onAddMeal: () => void;
}

const EmptyState = ({ onAddMeal }: EmptyStateProps) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyState,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.emptyIllustration}>
        <LinearGradient
          colors={['rgba(138,92,246,0.15)', 'rgba(59,130,246,0.10)']}
          style={styles.emptyGlow}
        />
        <Text style={styles.emptyEmoji}>📊</Text>
      </View>
      <Text style={styles.emptyTitle}>No progress data yet</Text>
      <Text style={styles.emptySubtitle}>
        Start logging meals to unlock insights and track your nutrition journey
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAddMeal} activeOpacity={0.8}>
        <LinearGradient
          colors={['#8A5CF6', '#6D3FCF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.emptyBtnText}>Add First Meal</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export const ProgressScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('protein');

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Fade-in header on mount
  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data, isLoading, isError, refetch } = useProgress(timeRange);
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Progress Screen Focused");

      refetch();

      return () => { };
    }, [refetch])
  );

  const { chartPoints, summaryCards, trendStats, aiInsights } = useProgressMetrics(
    data,
    timeRange,
    selectedMetric,
  );

  const isEmpty = !isLoading && !isError && (!data || data.length === 0);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  const handleMetricChange = useCallback((metric: MetricKey) => {
    setSelectedMetric(metric);
  }, []);

  const handleCalendarPress = useCallback(() => {
    // Navigate to date range picker modal
    // navigation.navigate('DateRangePicker');
  }, []);

  const handleAddMeal = useCallback(() => {
    // navigation.navigate('AddMeal');
  }, []);

  // ── Chart width ───────────────────────────────────────────────────────────

  const chartWidth = SCREEN_W - Spacing.screen * 2 - GRAPH_CARD_PADDING * 2;

  // ── Render ─────────────────────────────────────────────────────────────────
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("isEmpty:", isEmpty);
  

  return (

    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Background ambient glows */}
      <View style={[styles.ambientGlow, styles.ambientGlow1]} />
      <View style={[styles.ambientGlow, styles.ambientGlow2]} />
      <View style={[styles.ambientGlow, styles.ambientGlow3]} />

      {/* Sticky header blur */}
      <Animated.View
        style={[
          styles.headerBlur,
          { paddingTop: insets.top },
        ]}
      >
        <BlurView intensity={32} tint="dark" style={StyleSheet.absoluteFill} />
        <Header onCalendarPress={handleCalendarPress} headerOpacity={headerOpacity} />
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        {/* ── Time Range ─────────────────────────────────────────────────── */}
        <View style={styles.rangeSelectorWrapper}>
          <RangeSelector selected={timeRange} onChange={handleRangeChange} />
        </View>

        {/* ── Empty State ────────────────────────────────────────────────── */}
        {isEmpty && (
          <EmptyState onAddMeal={handleAddMeal} />
        )}

        {/* ── Loading State ───────────────────────────────────────────────── */}
        {isLoading && (
          <>
            <SkeletonSummaryCards />
            <SkeletonGraph />
            <SkeletonTrendStats />
            <SkeletonInsights />
          </>
        )}

        {/* ── Error State ─────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <View style={styles.errorState}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to load data</Text>
            <Text style={styles.errorSubtitle}>Check your connection and try again</Text>
            <TouchableOpacity style={styles.retryBtn} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Main content ────────────────────────────────────────────────── */}
        {!isLoading && !isError && !isEmpty && (
          <>
            {/* ─ Summary Cards ─────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Overview</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryCardsScroll}
            >
              {summaryCards.map((card, i) => (
                <SummaryCardItem key={card.label} card={card} index={i} />
              ))}
            </ScrollView>

            {/* ─ Graph Card ─────────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trends</Text>
            </View>

            <View style={styles.graphCard}>
              <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />

              {/* Inner glow border */}
              <LinearGradient
                colors={[
                  'rgba(138,92,246,0.20)',
                  'rgba(59,130,246,0.08)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.graphCardGlow}
              />

              {/* Metric selector */}
              <MetricSelector
                selected={selectedMetric}
                onChange={handleMetricChange}
              />

              {/* Chart */}
              <ProgressChart
                data={chartPoints}
                metric={selectedMetric}
                width={chartWidth}
              />

              {/* Current metric label */}
              <View style={styles.graphFooter}>
                <View
                  style={[
                    styles.graphFooterDot,
                    { backgroundColor: Colors.metricColors[selectedMetric] },
                  ]}
                />
                <Text style={styles.graphFooterLabel}>
                  {METRICS.find((m) => m.key === selectedMetric)?.label} over{' '}
                  {timeRange}
                </Text>
              </View>
            </View>

            {/* ─ Trend Analytics ────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Analytics</Text>
            </View>

            <View style={styles.trendGrid}>
              {trendStats.map((stat, i) => (
                <TrendStatCard key={stat.label} stat={stat} index={i} />
              ))}
            </View>

            {/* ─ AI Insights ────────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI Insights</Text>
            </View>

            <View style={styles.insightsCard}>
              <BlurView intensity={14} tint="dark" style={StyleSheet.absoluteFill} />

              {/* Purple + blue ambient top edge */}
              <LinearGradient
                colors={[
                  'rgba(138,92,246,0.18)',
                  'rgba(59,130,246,0.08)',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.insightsGlow}
              />

              <View style={styles.insightsHeader}>
                <Text style={styles.insightsHeaderEmoji}>✨</Text>
                <Text style={styles.insightsHeaderText}>AI Insights</Text>
                <View style={styles.insightsBadge}>
                  <Text style={styles.insightsBadgeText}>
                    {aiInsights.length} new
                  </Text>
                </View>
              </View>

              {aiInsights.map((insight, i) => (
                <InsightChip key={insight.id} insight={insight} index={i} />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Screen ──────────────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Ambient glows ────────────────────────────────────────────────────────────
  ambientGlow: {
    position: 'absolute',
    borderRadius: 400,
    opacity: 0.6,
  },
  ambientGlow1: {
    width: 320,
    height: 320,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(138,92,246,0.12)',
  },
  ambientGlow2: {
    width: 280,
    height: 280,
    top: 300,
    left: -100,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  ambientGlow3: {
    width: 240,
    height: 240,
    bottom: 200,
    right: -60,
    backgroundColor: 'rgba(138,92,246,0.07)',
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.displayM,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calendarBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calendarBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 0,
  },

  // ── Range selector ───────────────────────────────────────────────────────────
  rangeSelectorWrapper: {
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    marginTop: 8,
  },
  rangeContainer: {
    height: 42,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rangeInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  rangeIndicator: {
    position: 'absolute',
    height: 34,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    ...Shadows.purpleGlow,
  },
  rangeTab: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  rangeTabText: {
    ...Typography.captionBold,
    color: Colors.textTertiary,
    letterSpacing: 0.4,
  },
  rangeTabTextActive: {
    color: Colors.textPrimary,
  },

  // ── Section headers ───────────────────────────────────────────────────────────
  sectionHeader: {
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    marginTop: Spacing.base,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // ── Summary cards ────────────────────────────────────────────────────────────
  summaryCardsScroll: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  summaryCard: {
    width: SUMMARY_CARD_WIDTH,
    minHeight: 100,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.glassCard,
  },
  summaryCardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  summaryCardContent: {
    flex: 1,
    padding: Spacing.base,
    zIndex: 1,
  },
  summaryCardLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  summaryCardValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryCardValue: {
    ...Typography.displayM,
    color: Colors.textPrimary,
  },
  summaryCardUnit: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  summaryCardChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 3,
  },
  summaryCardChangeTxt: {
    ...Typography.caption,
    fontWeight: '600',
  },
  summaryCardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },

  // ── Graph card ────────────────────────────────────────────────────────────────
  graphCard: {
    marginHorizontal: Spacing.screen,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    overflow: 'hidden',
    paddingVertical: Spacing.base,
    paddingHorizontal: GRAPH_CARD_PADDING,
    marginBottom: Spacing.sm,
    ...Shadows.purpleGlow,
  },
  graphCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },

  // ── Metric pills ─────────────────────────────────────────────────────────────
  metricPillsContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.base,
    paddingTop: 4,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.glass,
    gap: 6,
  },
  metricPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricPillText: {
    ...Typography.captionBold,
    color: Colors.textTertiary,
  },

  // ── Graph footer ─────────────────────────────────────────────────────────────
  graphFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  graphFooterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  graphFooterLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // ── Trend grid ────────────────────────────────────────────────────────────────
  trendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trendCard: {
    width: (SCREEN_W - Spacing.screen * 2 - Spacing.md) / 2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    ...Shadows.subtle,
  },
  trendCardLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  trendCardValue: {
    ...Typography.headingL,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  trendCardSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // ── AI Insights card ─────────────────────────────────────────────────────────
  insightsCard: {
    marginHorizontal: Spacing.screen,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    overflow: 'hidden',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.purpleGlow,
  },
  insightsGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  insightsHeaderEmoji: {
    fontSize: 18,
  },
  insightsHeaderText: {
    ...Typography.headingM,
    color: Colors.textPrimary,
    flex: 1,
  },
  insightsBadge: {
    backgroundColor: Colors.purpleDeep,
    borderWidth: 1,
    borderColor: Colors.purpleGlow,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  insightsBadgeText: {
    ...Typography.label,
    color: Colors.purpleLight,
  },
  insightChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  insightChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.purpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightEmoji: {
    fontSize: 14,
  },
  insightText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  emptyGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    ...Typography.displayM,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    ...Shadows.purpleGlow,
  },
  emptyBtnText: {
    ...Typography.bodyMedium,
    color: '#fff',
    fontWeight: '600',
  },

  // ── Error state ───────────────────────────────────────────────────────────────
  errorState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: Spacing.base,
  },
  errorTitle: {
    ...Typography.headingL,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.purple,
    backgroundColor: Colors.purpleDim,
  },
  retryBtnText: {
    ...Typography.bodyMedium,
    color: Colors.purpleLight,
    fontWeight: '600',
  },
});