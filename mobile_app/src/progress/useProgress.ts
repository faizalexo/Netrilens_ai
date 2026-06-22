// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — useProgress Hook
// React Query-powered data fetching with error handling
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  TimeRange,
  MetricKey,
  DailyEntry,
  ProgressResponse,
  SummaryCard,
  TrendStat,
  AIInsight,
  ChartDataPoint,
} from './types';
import api from '../services/api';

// ── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.3:8000';
console.log(
  "API_BASE:",
  API_BASE
);

const RANGE_TO_PARAM: Record<TimeRange, string> = {
  '7D': 'last_7_days',
  '30D': 'last_30_days',
  '90D': 'last_90_days',
  '1Y': 'last_year',
};

const RANGE_TO_DAYS: Record<TimeRange, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function fetchProgress(
  range: TimeRange
): Promise<DailyEntry[]> {

  try {

    const response =
      await api.get(
        "/tracking/progress/",
        {
          params: {
            range:
              range.toLowerCase(),
          },
        }
      );

    console.log(
      "PROGRESS DATA:",
      response.data
    );

    const json =
      response.data;

    const key =
      RANGE_TO_PARAM[
      range
      ] as keyof ProgressResponse;

    return (
      json[key] ?? []
    ) as DailyEntry[];

  } catch (error) {

    console.log(
      "PROGRESS API ERROR:",
      error
    );

    throw error;
  }
}

// ── Primary hook ──────────────────────────────────────────────────────────────

export function useProgress(range: TimeRange) {
  const query: UseQueryResult<DailyEntry[], Error> = useQuery({
    queryKey: ['progress', range],
    queryFn: () => fetchProgress(range),
    staleTime: 5 * 60 * 1000,   // 5 min
    gcTime: 30 * 60 * 1000,     // 30 min
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return query;
}

// ── Derived calculations (memoizable) ────────────────────────────────────────

export function useProgressMetrics(
  data: DailyEntry[] | undefined,
  range: TimeRange,
  metric: MetricKey,
) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartPoints: [] as ChartDataPoint[],
        summaryCards: [] as SummaryCard[],
        trendStats: [] as TrendStat[],
        aiInsights: [] as AIInsight[],
      };
    }

    // ── Chart points ──────────────────────────────────────────────────────────
    const chartPoints: ChartDataPoint[] = data.map((entry) => ({
      date: formatDisplayDate(entry.date, range),
      rawDate: entry.date,
      value:
        metric === 'water'
          ? entry.water / 1000  // convert ml → L for display
          : entry[metric],
    }));

    // ── Half-split for period comparison ─────────────────────────────────────
    const half = Math.floor(data.length / 2);
    const current = data.slice(half);
    const previous = data.slice(0, half);

    const avgOf = (arr: DailyEntry[], key: MetricKey): number => {
      if (arr.length === 0) return 0;
      return arr.reduce((s, d) => s + d[key], 0) / arr.length;
    };

    const pctChange = (curr: number, prev: number): number => {
      if (prev === 0) return 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const avgCalCurr = avgOf(current, 'calories');
    const avgCalPrev = avgOf(previous, 'calories');
    const avgProtCurr = avgOf(current, 'protein');
    const avgProtPrev = avgOf(previous, 'protein');
    const avgWaterCurr = avgOf(current, 'water');
    const avgWaterPrev = avgOf(previous, 'water');

    // Consistency = % of days where calories within 10% of goal (assume 2000 kcal goal)
    const CALORIE_GOAL = 2000;
    const consistentDays = data.filter(
      (d) => Math.abs(d.calories - CALORIE_GOAL) / CALORIE_GOAL <= 0.1,
    ).length;
    const consistency = Math.round((consistentDays / data.length) * 100);

    const summaryCards: SummaryCard[] = [
      {
        label: 'Calories',
        value: Math.round(avgCalCurr).toLocaleString(),
        unit: 'kcal',
        change: pctChange(avgCalCurr, avgCalPrev),
        metricKey: 'calories',
      },
      {
        label: 'Protein',
        value: Math.round(avgProtCurr).toString(),
        unit: 'g',
        change: pctChange(avgProtCurr, avgProtPrev),
        metricKey: 'protein',
      },
      {
        label: 'Water',
        value: (avgWaterCurr / 1000).toFixed(1),
        unit: 'L',
        change: pctChange(avgWaterCurr, avgWaterPrev),
        metricKey: 'water',
      },
      {
        label: 'Consistency',
        value: consistency.toString(),
        unit: '%',
        change: 0,
        metricKey: 'consistency',
      },
    ];

    // ── Trend stats ───────────────────────────────────────────────────────────
    const allValues = data.map((d) =>
      metric === 'water' ? d.water / 1000 : d[metric],
    );
    const maxVal = Math.max(...allValues);
    const maxDay = data[allValues.indexOf(maxVal)];
    const avgVal = allValues.reduce((s, v) => s + v, 0) / allValues.length;

    // Streak = consecutive days above average
    let bestStreak = 0;
    let currentStreak = 0;
    const avg = avgVal;
    for (const v of allValues) {
      if (v >= avg) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const metricUnit = metric === 'calories' ? 'kcal' : metric === 'water' ? 'L' : 'g';

    const trendStats: TrendStat[] = [
      {
        label: 'Highest Day',
        value: dayOfWeek(maxDay.date),
        sub: `${formatValue(maxVal, metric)} ${metricUnit}`,
      },
      {
        label: 'Average Intake',
        value: `${formatValue(avgVal, metric)}`,
        sub: metricUnit,
      },
      {
        label: 'Goal Completion',
        value: `${consistency}%`,
        sub: 'of days on track',
      },
      {
        label: 'Best Streak',
        value: `${bestStreak}`,
        sub: 'days above avg',
      },
    ];

    // ── AI Insights ───────────────────────────────────────────────────────────
    const insights: AIInsight[] = generateInsights(data, metric, summaryCards);

    return {
      chartPoints,
      summaryCards,
      trendStats,
      aiInsights: insights,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, range, metric]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDisplayDate(iso: string, range: TimeRange): string {
  const date = new Date(iso);
  if (range === '7D') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  if (range === '30D' || range === '90D') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function dayOfWeek(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
}

function formatValue(val: number, metric: MetricKey): string {
  if (metric === 'water') return val.toFixed(1);
  if (metric === 'calories') return Math.round(val).toLocaleString();
  return Math.round(val).toString();
}

function generateInsights(
  data: DailyEntry[],
  metric: MetricKey,
  cards: SummaryCard[],
): AIInsight[] {
  const insights: AIInsight[] = [];

  const protCard = cards.find((c) => c.metricKey === 'protein');
  if (protCard && protCard.change > 0) {
    insights.push({
      id: 'protein-up',
      text: `Your protein intake increased by ${protCard.change}% compared to the previous period.`,
      icon: '💪',
    });
  }

  const calCard = cards.find((c) => c.metricKey === 'calories');
  if (calCard && Math.abs(calCard.change) < 5) {
    insights.push({
      id: 'cal-consistent',
      text: 'Your calorie consistency has improved significantly — great discipline!',
      icon: '🔥',
    });
  }

  // Weekday vs weekend protein
  const weekdayProtein = data
    .filter((d) => [1, 2, 3, 4, 5].includes(new Date(d.date).getDay()))
    .reduce((s, d, _, a) => s + d.protein / a.length, 0);
  const weekendProtein = data
    .filter((d) => [0, 6].includes(new Date(d.date).getDay()))
    .reduce((s, d, _, a) => s + d.protein / a.length, 0);

  if (weekdayProtein > weekendProtein * 1.1) {
    insights.push({
      id: 'weekday-protein',
      text: 'You are most successful reaching your protein goals on weekdays.',
      icon: '📅',
    });
  }

  const waterCard = cards.find((c) => c.metricKey === 'water');
  if (waterCard && waterCard.change < 0) {
    insights.push({
      id: 'water-weekend',
      text: 'Water intake tends to dip during weekends — try setting hydration reminders.',
      icon: '💧',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'keep-going',
      text: 'Keep logging consistently to unlock personalised AI insights.',
      icon: '✨',
    });
  }

  return insights;
}