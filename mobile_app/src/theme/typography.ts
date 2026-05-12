/**
 * typography.ts — Netrilens AI Design System
 *
 * Two typeface families extracted from the reference:
 *   1. Syne       — display / headings (wght 700, 800)
 *   2. Outfit     — body / UI (wght 300, 400, 500, 600, 700)
 *
 * Usage with @expo-google-fonts or react-native-google-fonts:
 *   import { useFonts, Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
 *   import { Outfit_400Regular, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
 *
 * All fontSize values are in sp (scale-independent pixels).
 * lineHeight values are absolute (not multipliers) to match RN convention.
 */

import type { TextStyle } from 'react-native';

// ─────────────────────────────────────────
// 1. FONT FAMILIES
// ─────────────────────────────────────────
export const fontFamily = {
  // Display — Syne
  displayBold:      'Syne_700Bold',
  displayExtraBold: 'Syne_800ExtraBold',

  // Body — Outfit
  thin:      'Outfit_300Light',
  regular:   'Outfit_400Regular',
  medium:    'Outfit_500Medium',
  semiBold:  'Outfit_600SemiBold',
  bold:      'Outfit_700Bold',

  // System fallbacks
  systemDisplay: 'System',
  systemBody:    'System',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

// ─────────────────────────────────────────
// 2. FONT SIZES  (sp)
// ─────────────────────────────────────────
export const fontSize = {
  // Micro labels
  micro:       8,    // "PROCESSING" label inside orb
  nano:        9,    // slider range labels, step dot check marks
  xxs:         10,   // overlines, badges, step label ("STEP 1 OF 5"), category labels
  xs:          11,   // badge text, info chip body, stat sublabel, BMI label
  sm:          12,   // description text in cards, input font, step row text
  base:        13,   // body paragraph, placeholder, activity desc, CTA secondary label
  md:          14,   // activity row title, input font (body)
  lg:          15,   // button label
  xl:          17,   // goal card title, welcome stat value
  '2xl':       22,   // macro chip value
  '3xl':       24,   // screen section heading (Hdr), BMI value
  '4xl':       26,   // processing screen heading
  '5xl':       28,   // completion heading
  '6xl':       30,   // metric card value (height/weight display)
  '7xl':       32,   // welcome hero headline
  '8xl':       56,   // calories hero number
} as const;

export type FontSizeKey = keyof typeof fontSize;

// ─────────────────────────────────────────
// 3. FONT WEIGHTS  (React Native string format)
// ─────────────────────────────────────────
export const fontWeight = {
  light:      '300' as TextStyle['fontWeight'],
  regular:    '400' as TextStyle['fontWeight'],
  medium:     '500' as TextStyle['fontWeight'],
  semiBold:   '600' as TextStyle['fontWeight'],
  bold:       '700' as TextStyle['fontWeight'],
  extraBold:  '800' as TextStyle['fontWeight'],
} as const;

// ─────────────────────────────────────────
// 4. LINE HEIGHTS  (absolute, sp)
// ─────────────────────────────────────────
export const lineHeight = {
  none:   1,      // multiplier — use with tight display text
  tight:  1.15,   // hero headline (welcome h1)
  snug:   1.2,    // screen headings, processing h2, completion h1
  normal: 1.4,    // info chips, BMI label
  relaxed:1.45,   // goal card description
  loose:  1.65,   // body paragraphs, form helper text
  wide:   1.7,    // completion body paragraph
  // Absolute values for display numbers (prevent clipping)
  displaySm: 28,  // metric card display value
  displayMd: 32,  // processing hero
  displayLg: 56,  // calories hero (lineHeight: 1 → use fontSize as-is)
} as const;

// ─────────────────────────────────────────
// 5. LETTER SPACING  (dp)
// ─────────────────────────────────────────
export const letterSpacing = {
  tight:    0.3,   // button labels
  normal:   0.5,   // badge dot label, badge text, overline
  wide:     0.6,   // input field labels
  wider:    1.0,   // step counter ("STEP 1 OF 5")
  widest:   2.0,   // brand sub-label ("NETRILENS AI", "AI-POWERED NUTRITION")
} as const;

// ─────────────────────────────────────────
// 6. TEXT TRANSFORM
// ─────────────────────────────────────────
export const textTransform = {
  upper: 'uppercase' as TextStyle['textTransform'],
  lower: 'lowercase' as TextStyle['textTransform'],
  none:  'none'      as TextStyle['textTransform'],
} as const;

// ─────────────────────────────────────────
// 7. COMPOSED TEXT STYLES  (ready-to-spread)
// ─────────────────────────────────────────
type TypographyStyle = Pick<
  TextStyle,
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'textTransform'
>;

export const typography = {
  // ── Display / Hero ───────────────────────
  heroTitle: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['7xl'],       // 32
    fontWeight:    fontWeight.extraBold,
    lineHeight:    Math.round(fontSize['7xl'] * lineHeight.tight), // ~37
    letterSpacing: 0,
  } satisfies TypographyStyle,

  heroTitleSm: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['5xl'],       // 28
    fontWeight:    fontWeight.extraBold,
    lineHeight:    Math.round(fontSize['5xl'] * lineHeight.snug),  // ~34
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Screen headings (Hdr component) ──────
  sectionHeading: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['3xl'],       // 24
    fontWeight:    fontWeight.extraBold,
    lineHeight:    Math.round(fontSize['3xl'] * lineHeight.snug),  // ~29
    letterSpacing: 0,
  } satisfies TypographyStyle,

  sectionHeadingLg: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['4xl'],       // 26
    fontWeight:    fontWeight.extraBold,
    lineHeight:    Math.round(fontSize['4xl'] * lineHeight.snug),  // ~31
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Metric display numbers ────────────────
  metricDisplay: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['6xl'],       // 30
    fontWeight:    fontWeight.extraBold,
    lineHeight:    lineHeight.displaySm,  // 28 (tight for numbers)
    letterSpacing: 0,
  } satisfies TypographyStyle,

  macroValue: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['2xl'],       // 22
    fontWeight:    fontWeight.extraBold,
    lineHeight:    26,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  bmiValue: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize['3xl'],       // 24
    fontWeight:    fontWeight.bold,
    lineHeight:    28,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  caloriesHero: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['8xl'],       // 56
    fontWeight:    fontWeight.extraBold,
    lineHeight:    fontSize['8xl'],       // 56 — lineHeight: 1
    letterSpacing: 0,
  } satisfies TypographyStyle,

  processingPercent: {
    fontFamily:    fontFamily.displayExtraBold,
    fontSize:      fontSize['3xl'],       // 30 (inside orb)
    fontWeight:    fontWeight.extraBold,
    lineHeight:    36,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Stat value (welcome screen 2M+, 98%) ──
  statValue: {
    fontFamily:    fontFamily.displayBold,
    fontSize:      fontSize.xl,           // 17
    fontWeight:    fontWeight.bold,
    lineHeight:    20,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Goal / activity card title ────────────
  cardTitle: {
    fontFamily:    fontFamily.displayBold,
    fontSize:      fontSize.xl,           // 17
    fontWeight:    fontWeight.bold,
    lineHeight:    22,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Button label ─────────────────────────
  button: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.lg,           // 15
    fontWeight:    fontWeight.semiBold,
    lineHeight:    20,
    letterSpacing: letterSpacing.tight,   // 0.3
  } satisfies TypographyStyle,

  // ── Input ────────────────────────────────
  input: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.md,           // 14
    fontWeight:    fontWeight.regular,
    lineHeight:    20,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  inputLabel: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.medium,
    lineHeight:    14,
    letterSpacing: letterSpacing.wide,    // 0.6
    textTransform: textTransform.upper,
  } satisfies TypographyStyle,

  // ── Body / paragraph ─────────────────────
  body: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.base,         // 13
    fontWeight:    fontWeight.regular,
    lineHeight:    Math.round(fontSize.base * lineHeight.loose), // ~21
    letterSpacing: 0,
  } satisfies TypographyStyle,

  bodyXs: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.sm,           // 12
    fontWeight:    fontWeight.regular,
    lineHeight:    Math.round(fontSize.sm * lineHeight.loose),   // ~20
    letterSpacing: 0,
  } satisfies TypographyStyle,

  activityTitle: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.md,           // 14
    fontWeight:    fontWeight.semiBold,
    lineHeight:    18,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  activityDesc: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.regular,
    lineHeight:    16,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  activityMultiplier: {
    fontFamily:    fontFamily.displayBold,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.semiBold,
    lineHeight:    16,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Overline / label ─────────────────────
  overline: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.medium,
    lineHeight:    14,
    letterSpacing: letterSpacing.wider,   // 1.0
    textTransform: textTransform.upper,
  } satisfies TypographyStyle,

  brandLabel: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.medium,
    lineHeight:    14,
    letterSpacing: letterSpacing.widest,  // 2.0
    textTransform: textTransform.upper,
  } satisfies TypographyStyle,

  // ── Caption / micro ──────────────────────
  caption: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.regular,
    lineHeight:    15,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  captionBold: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.medium,
    lineHeight:    15,
    letterSpacing: letterSpacing.normal,  // 0.5
  } satisfies TypographyStyle,

  micro: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.micro,        // 8
    fontWeight:    fontWeight.regular,
    lineHeight:    10,
    letterSpacing: letterSpacing.normal,  // 0.5 → "PROCESSING" label
  } satisfies TypographyStyle,

  nano: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.nano,         // 9
    fontWeight:    fontWeight.regular,
    lineHeight:    12,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Badge text ────────────────────────────
  badge: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.medium,
    lineHeight:    14,
    letterSpacing: letterSpacing.normal,  // 0.5
  } satisfies TypographyStyle,

  // ── Segment / toggle button ───────────────
  segment: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.base,         // 13
    fontWeight:    fontWeight.semiBold,
    lineHeight:    18,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Unit toggle (cm/ft, kg/lbs) ───────────
  unitToggle: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.sm,           // 12
    fontWeight:    fontWeight.semiBold,
    lineHeight:    16,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Status bar ────────────────────────────
  statusBarTime: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.xs,           // 11
    fontWeight:    fontWeight.semiBold,
    lineHeight:    14,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  statusBarBattery: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.regular,
    lineHeight:    14,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Step counter ─────────────────────────
  stepCounter: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.medium,
    lineHeight:    14,
    letterSpacing: letterSpacing.wider,   // 1.0
    textTransform: textTransform.upper,
  } satisfies TypographyStyle,

  // ── Stat sublabel (welcome) ───────────────
  statLabel: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.xxs,          // 10
    fontWeight:    fontWeight.regular,
    lineHeight:    13,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── Completion stat card ──────────────────
  statCardLabel: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.nano,         // 9
    fontWeight:    fontWeight.regular,
    lineHeight:    12,
    letterSpacing: letterSpacing.normal,
    textTransform: textTransform.upper,
  } satisfies TypographyStyle,

  statCardValue: {
    fontFamily:    fontFamily.semiBold,
    fontSize:      fontSize.sm,           // 12
    fontWeight:    fontWeight.semiBold,
    lineHeight:    16,
    letterSpacing: 0,
  } satisfies TypographyStyle,

  // ── AI message quote ─────────────────────
  aiQuote: {
    fontFamily:    fontFamily.regular,
    fontSize:      fontSize.sm,           // 12
    fontWeight:    fontWeight.regular,
    lineHeight:    Math.round(fontSize.sm * lineHeight.loose),   // ~20
    letterSpacing: 0,
  } satisfies TypographyStyle,
} as const;

export type TypographyKey = keyof typeof typography;
