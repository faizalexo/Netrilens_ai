// ─────────────────────────────────────────────────────────────────────────────
// Netrilens AI — Design Tokens
// Dark luxury · Glassmorphism · Purple/Blue glow system
// ─────────────────────────────────────────────────────────────────────────────

import { Dimensions } from 'react-native';

export const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Colour Palette ────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: '#08080F',
  bgSecondary: '#0D0D1A',
  bgTertiary: '#111124',

  // Glass surfaces
  glass: 'rgba(255,255,255,0.04)',
  glassMid: 'rgba(255,255,255,0.07)',
  glassHigh: 'rgba(255,255,255,0.10)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderAccent: 'rgba(138,92,246,0.35)',

  // Purple glow system
  purple: '#8A5CF6',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(138,92,246,0.15)',
  purpleGlow: 'rgba(138,92,246,0.25)',
  purpleDeep: 'rgba(138,92,246,0.08)',

  // Blue accent
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDim: 'rgba(59,130,246,0.15)',

  // Semantic
  success: '#34D399',
  successDim: 'rgba(52,211,153,0.15)',
  error: '#F87171',
  errorDim: 'rgba(248,113,113,0.15)',
  warning: '#FBBF24',

  // Typography
  textPrimary: '#F1F0FF',
  textSecondary: 'rgba(241,240,255,0.55)',
  textTertiary: 'rgba(241,240,255,0.30)',
  textAccent: '#C4B5FD',

  // Metric colours (for chart fills)
  metricColors: {
    calories: '#F97316',
    protein: '#8A5CF6',
    carbs: '#3B82F6',
    fat: '#FBBF24',
    water: '#06B6D4',
  },

  // Metric glow colours
  metricGlow: {
    calories: 'rgba(249,115,22,0.25)',
    protein: 'rgba(138,92,246,0.25)',
    carbs: 'rgba(59,130,246,0.25)',
    fat: 'rgba(251,191,36,0.25)',
    water: 'rgba(6,182,212,0.25)',
  },
} as const;

// ── Typography ────────────────────────────────────────────────────────────────

export const Typography = {
  displayXL: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.8 },
  displayL: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.6 },
  displayM: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  headingL: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  headingM: { fontSize: 15, fontWeight: '600' as const, letterSpacing: -0.1 },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.1 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6 },
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screen: 20,
} as const;

// ── Radius ────────────────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
} as const;

// ── Shadows / Glows ───────────────────────────────────────────────────────────

export const Shadows = {
  glassCard: {
    shadowColor: '#8A5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  purpleGlow: {
    shadowColor: '#8A5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// ── Chart ─────────────────────────────────────────────────────────────────────

export const CHART_HEIGHT = 200;
export const CHART_PADDING_H = 16;
export const CHART_PADDING_V = 20;