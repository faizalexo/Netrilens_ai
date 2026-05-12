/**
 * gradients.ts — Netrilens AI Design System
 *
 * React Native uses `expo-linear-gradient` / `react-native-linear-gradient`
 * for LinearGradient and custom SVG/canvas for radial/conic gradients.
 *
 * Each entry exposes:
 *   colors   — color stops array (compatible with LinearGradient prop)
 *   start    — { x, y }  (0,0 = top-left, 1,1 = bottom-right)
 *   end      — { x, y }
 *   locations— (optional) normalized stop positions [0..1]
 *
 * Radial & conic gradients are expressed as descriptive config objects
 * for use with react-native-svg <RadialGradient> / custom shaders.
 */

import { palette } from './colors';

// ─────────────────────────────────────────
// DIRECTION HELPERS  (LinearGradient start/end)
// ─────────────────────────────────────────
export const GradientDir = {
  toBottom:       { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  toTop:          { start: { x: 0, y: 1 }, end: { x: 0, y: 0 } },
  toRight:        { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  toLeft:         { start: { x: 1, y: 0 }, end: { x: 0, y: 0 } },
  // 135° diagonal (most common in this design system)
  diagonal135:    { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  // 45° (top-right → bottom-left)
  diagonal45:     { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
} as const;

// ─────────────────────────────────────────
// 1. SCREEN / BACKGROUND GRADIENTS
// ─────────────────────────────────────────
export const backgroundGradients = {

  /** Welcome screen: #0A0514 → #050508 → #0A0514 (top→bottom→top) */
  welcome: {
    colors: ['#0A0514', '#050508', '#0A0514'],
    locations: [0, 0.6, 1.0],
    ...GradientDir.toBottom,
  },

  /** Standard form screens: #0A0514 → #050508 */
  screenDefault: {
    colors: ['#0A0514', '#050508'],
    ...GradientDir.toBottom,
  },

  /** Completion screen: #080513 → #050508 */
  screenCompletion: {
    colors: ['#080513', '#050508'],
    ...GradientDir.toBottom,
  },

  /** Welcome bottom panel fade-in overlay */
  bottomPanelOverlay: {
    colors: ['rgba(5,5,8,0.00)', 'rgba(5,5,8,0.72)', 'rgba(5,5,8,0.98)'],
    locations: [0, 0.45, 1.0],
    ...GradientDir.toBottom,
  },
} as const;

// ─────────────────────────────────────────
// 2. BRAND / CTA GRADIENTS
// ─────────────────────────────────────────
export const brandGradients = {

  /** Primary CTA button: purple → deep-violet → purple-light (135°) */
  primaryButton: {
    colors: [palette.purple500, '#9333EA', palette.purple300],
    locations: [0, 0.5, 1.0],
    ...GradientDir.diagonal135,
  },

  /** Stepper progress bar fill: purple → purple-light (90°) */
  stepperProgress: {
    colors: [palette.purple500, palette.purple300],
    ...GradientDir.toRight,
  },

  /** Heading text gradient: white → white-60 (135°) */
  headingText: {
    colors: ['#FFFFFF', 'rgba(255,255,255,0.60)'],
    ...GradientDir.diagonal135,
  },

  /** Hero display number gradient: white → purple-light (135°) */
  heroNumber: {
    colors: ['#FFFFFF', palette.purple300],
    ...GradientDir.diagonal135,
  },

  /** Accent text gradient (hero headline "Starts Here."): purple-light → cyan */
  accentText: {
    colors: [palette.purple300, palette.cyan500],
    ...GradientDir.diagonal135,
  },

  /** AI icon gradient: purple → purple-light (135°) */
  aiIcon: {
    colors: [palette.purple500, palette.purple300],
    ...GradientDir.diagonal135,
  },

  /** Processing progress bar: purple → cyan (90°) */
  progressBar: {
    colors: [palette.purple500, palette.cyan500],
    ...GradientDir.toRight,
  },

  /** Shimmer animation strip: purple → cyan (90°, moves on x-axis) */
  shimmer: {
    colors: [palette.purple500, palette.cyan500],
    ...GradientDir.toRight,
  },
} as const;

// ─────────────────────────────────────────
// 3. CARD / SURFACE GRADIENTS
// ─────────────────────────────────────────
export const cardGradients = {

  /** Calories hero card: purple-20 → cyan-10 (135°) */
  caloriesCard: {
    colors: ['rgba(124,58,237,0.20)', 'rgba(6,182,212,0.10)'],
    ...GradientDir.diagonal135,
  },

  /** AI message card: purple-11 → cyan-07 (135°) */
  aiMessageCard: {
    colors: ['rgba(124,58,237,0.11)', 'rgba(6,182,212,0.07)'],
    ...GradientDir.diagonal135,
  },

  /** Goal card — Lose Fat: orange-12 → pink-08 (135°) */
  goalLoseFat: {
    colors: ['rgba(249,115,22,0.12)', 'rgba(236,72,153,0.08)'],
    ...GradientDir.diagonal135,
  },

  /** Goal card — Maintain: cyan-12 → purple-08 (135°) */
  goalMaintain: {
    colors: ['rgba(6,182,212,0.12)', 'rgba(124,58,237,0.08)'],
    ...GradientDir.diagonal135,
  },

  /** Goal card — Build Muscle: purple-14 → purple-light-08 (135°) */
  goalBuildMuscle: {
    colors: ['rgba(124,58,237,0.14)', 'rgba(168,85,247,0.08)'],
    ...GradientDir.diagonal135,
  },

  /** Card top-edge shimmer border highlight (horizontal, 90°) */
  cardTopShimmer: {
    colors: ['transparent', palette.orange500, 'transparent'],
    ...GradientDir.toRight,
  },

  /** Card inset top-light (used as box-shadow substitute) */
  cardInsetTop: 'rgba(255,255,255,0.08)',
} as const;

// ─────────────────────────────────────────
// 4. MACRO CHIP FILLS  (tinted glass per macro)
// ─────────────────────────────────────────
export const macroGradients = {
  protein: {
    colors: ['rgba(249,115,22,0.12)', 'rgba(249,115,22,0.06)'],
    ...GradientDir.toBottom,
  },
  carbs: {
    colors: ['rgba(6,182,212,0.12)', 'rgba(6,182,212,0.06)'],
    ...GradientDir.toBottom,
  },
  fats: {
    colors: ['rgba(236,72,153,0.12)', 'rgba(236,72,153,0.06)'],
    ...GradientDir.toBottom,
  },
} as const;

// ─────────────────────────────────────────
// 5. RADIAL GRADIENTS  (SVG / canvas config)
// ─────────────────────────────────────────
export const radialGradients = {

  /** Purple ambient glow orb (top-left) — 260×260 circle */
  glowOrbPurple: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(124,58,237,0.22)' },
      { offset: '70%', color: 'transparent' },
    ],
  },

  /** Orange ambient glow orb (bottom-right) — 200×200 circle */
  glowOrbOrange: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(249,115,22,0.18)' },
      { offset: '70%', color: 'transparent' },
    ],
  },

  /** Cyan ambient glow orb (mid-right) — 150×150 circle */
  glowOrbCyan: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(6,182,212,0.16)' },
      { offset: '70%', color: 'transparent' },
    ],
  },

  /** Inner AI orb sphere shading */
  aiOrbInner: {
    cx: '35%', cy: '35%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(168,85,247,0.52)' },
      { offset: '50%', color: 'rgba(124,58,237,0.22)' },
      { offset: '100%',color: 'rgba(5,5,8,0.92)'      },
    ],
  },

  /** Processing orb centre sphere */
  processingOrbCore: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(124,58,237,0.42)' },
      { offset: '100%',color: 'rgba(5,5,8,0.92)'      },
    ],
  },

  /** Completion success icon background */
  completionIcon: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(124,58,237,0.40)' },
      { offset: '100%',color: 'rgba(168,85,247,0.10)' },
    ],
  },

  /** Completion background burst */
  completionBurst: {
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: '0%',  color: 'rgba(124,58,237,0.22)' },
      { offset: '68%', color: 'transparent'            },
    ],
  },
} as const;

// ─────────────────────────────────────────
// 6. CONIC GRADIENTS  (AI orb ring — SVG sweep)
// ─────────────────────────────────────────
export const conicGradients = {

  /** Outer rotating ring of the AI orb */
  aiOrbRing: {
    stops: [
      { angle: '0deg',   color: palette.purple500 },
      { angle: '90deg',  color: palette.cyan500   },
      { angle: '180deg', color: palette.pink500   },
      { angle: '270deg', color: palette.orange500  },
      { angle: '360deg', color: palette.purple500 },
    ],
  },
} as const;

// ─────────────────────────────────────────
// 7. SLIDER TRACK GRADIENTS  (programmatic)
// ─────────────────────────────────────────
/**
 * Build a filled-vs-empty slider track gradient config.
 * `pct` = filled percentage (0–100)
 */
export const buildSliderTrack = (
  accentColor: string,
  pct: number,
): { colors: string[]; locations: [number, number, number, number] } => ({
  colors: [accentColor, accentColor, 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.10)'],
  locations: [0, pct / 100, pct / 100, 1.0],
});
