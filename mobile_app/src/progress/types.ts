// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — ProgressScreen Types
// ─────────────────────────────────────────────────────────────────────────────

export type TimeRange = '7D' | '30D' | '90D' | '1Y';

export type MetricKey = 'calories' | 'protein' | 'carbs' | 'fat' | 'water';

export interface DailyEntry {
  date: string;          // ISO 8601: "2026-06-01"
  calories: number;      // kcal
  protein: number;       // grams
  carbs: number;         // grams
  fat: number;           // grams
  water: number;         // ml
}

export interface ProgressResponse {
  last_7_days?: DailyEntry[];
  last_30_days?: DailyEntry[];
  last_90_days?: DailyEntry[];
  last_year?: DailyEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Computed / derived

export interface SummaryCard {
  label: string;
  value: string;
  unit: string;
  change: number;       // percent vs prior period, positive = up
  metricKey: MetricKey | 'consistency';
}

export interface TrendStat {
  label: string;
  value: string;
  sub?: string;
}

export interface AIInsight {
  id: string;
  text: string;
  icon: string;
}

export interface ChartDataPoint {
  date: string;         // display label e.g. "Jun 1"
  value: number;
  rawDate: string;      // ISO string for tooltip
}

// ─────────────────────────────────────────────────────────────────────────────
// API hook return

export interface UseProgressReturn {
  data: DailyEntry[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}