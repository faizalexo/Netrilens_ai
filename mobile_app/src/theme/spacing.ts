/**
 * spacing.ts — Netrilens AI Design System
 *
 * Tokens for:
 *   • Base spacing scale (margin, padding, gap)
 *   • Border radii
 *   • Layout / component-specific dimensions
 *   • Z-index layers
 *
 * All values are in dp (density-independent pixels),
 * consistent with React Native's default unit.
 */

// ─────────────────────────────────────────
// 1. BASE SPACING SCALE
// ─────────────────────────────────────────
export const spacing = {
  px: 1,
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 7,    // gap between stepper dots / badge padding-x inner
  '2.5': 9,    // macro chip gap, activity row gap
  '3': 10,   // stepper gap, badge vertical padding
  '3.5': 11,   // info card padding, badge horizontal padding
  '4': 12,   // segment toggle inner gap, unit toggle padding
  '4.5': 13,   // input label margin-bottom, metric card header margin
  '5': 14,   // icon font size, input horizontal padding
  '5.5': 16,   // section margin-bottom (form screens)
  '6': 18,   // card padding, goal card padding, welcome badge margin-bottom
  '6.5': 20,   // screen section margin-bottom, calories card padding
  '7': 22,   // screen horizontal padding (primary gutter), button padding-x
  '7.5': 24,   // activity/goal list margin-bottom, feature badge margin-bottom
  '8': 26,   // status bar padding-x, welcome bottom panel padding-x
  '9': 28,   // welcome bottom panel padding-top
  '10': 32,   // processing orb margin-bottom
  '12': 36,   // processing screen bottom padding
  '13': 40,   // welcome bottom panel padding-bottom
  '14': 44,   // completion screen bottom padding
  '16': 52,   // form screen top padding (below status bar)
  '17': 56,   // processing/completion screen top padding
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

// ─────────────────────────────────────────
// 2. COMPONENT-SPECIFIC SPACING
// ─────────────────────────────────────────
export const componentSpacing = {
  // ── Screen ──────────────────────────────
  screenPaddingTop: spacing['16'],   // 52 — form screens
  screenPaddingTopHero: spacing['17'],   // 56 — AI processing / completion
  screenPaddingHorizontal: spacing['7'],    // 22
  screenPaddingBottom: spacing['9'],    // 28

  // ── Status Bar ──────────────────────────
  statusBarPaddingTop: 12,
  statusBarPaddingHorizontal: spacing['8'],    // 26

  // ── Buttons ─────────────────────────────
  buttonPaddingVertical: 15,
  buttonPaddingHorizontal: spacing['7'],    // 22

  // ── Cards ────────────────────────────────
  cardPadding: spacing['6'],    // 18
  cardPaddingSmall: spacing['4.5'], // 13
  cardGap: 12,             // between stacked cards

  // ── Inputs ──────────────────────────────
  inputPaddingVertical: 13,
  inputPaddingHorizontal: 15,
  inputLabelMarginBottom: spacing['2'],   // 7
  inputMarginBottom: 14,

  // ── Stepper ─────────────────────────────
  stepperHeight: 4,
  stepperGap: spacing['1.5'], // 5 → actually 5 in source
  stepperMarginBottom: spacing['6'],   // 18

  // ── Goal / Activity rows ─────────────────
  goalCardPadding: spacing['6'],   // 18
  goalCardGap: 13,
  activityRowPaddingV: 14,
  activityRowPaddingH: 16,
  activityRowGap: spacing['2.5'],// 9

  // ── Macro chips ─────────────────────────
  macroChipPaddingV: 13,
  macroChipPaddingH: spacing['2.5'],// 9
  macroChipGap: spacing['2.5'],// 9

  // ── Welcome bottom panel ─────────────────
  welcomePanelPaddingH: spacing['8'],   // 26
  welcomePanelPaddingTop: spacing['9'],   // 28
  welcomePanelPaddingBottom: 40,
  welcomeStatsMarginTop: spacing['7.5'],// 22
  welcomeStatsPaddingTop: spacing['6'],   // 18

  // ── Feature info chips ───────────────────
  infoChipPadding: 11,
  infoChipGap: 10,

  // ── Home indicator ───────────────────────
  homeIndicatorBottom: 7,
  homeIndicatorWidth: 110,
  homeIndicatorHeight: 4,

  // ── Badge / pill ─────────────────────────
  badgePaddingV: 5,
  badgePaddingH: 13,
  badgeIconSize: 6,
  badgeIconGap: 7,

  // ── Processing step rows ─────────────────
  stepRowPaddingV: 10,
  stepRowPaddingH: 13,
  stepRowGap: 10,
  stepDotSize: 17,
  stepRowsGap: 7,
  sliderHeight: 40,

  // ── Processing orb ──────────────────────
  processingOrbSize: 190,
  processingOrbCoreSize: 114,
  processingOrbRingInset: 18,

  // ── AI / Hero orb ────────────────────────
  heroOrbContainer: 260,
  heroOrbCore: 138,
  heroOrbSatelliteDot: 8,

  // ── Completion ───────────────────────────
  completionIconSize: 92,
  completionIconMarginBottom: 20,
  completionGridGap: 9,
  completionAiAvatarSize: 33,
  completionAiAvatarRadius: 9,

  // ── AI message panel ─────────────────────
  aiPanelPadding: 16,
  aiPanelMarginBottom: 16,
  aiPanelGap: 11,

  // ── Segment toggle (gender) ──────────────
  segmentPadding: 4,
  segmentGap: 7,

  // ── Unit toggle ─────────────────────────
  unitTogglePadding: 3,
  unitToggleButtonPaddingV: 5,
  unitToggleButtonPaddingH: 12,
} as const;

// ─────────────────────────────────────────
// 3. BORDER RADII
// ─────────────────────────────────────────
export const radius = {
  none: 0,
  xs: 2,    // stepper track, progress bar, macro bar segments
  sm: 4,    // macro bar, BMI segments
  md: 7,    // unit toggle buttons
  lg: 9,    // completion AI avatar, unit toggle container
  xl: 10,   // segment buttons (gender), back button
  '2xl': 11,   // activity icon box
  '3xl': 12,   // info chip, feature card
  '4xl': 13,   // input field, card small, completion stat card
  '5xl': 15,   // CTA button, activity row
  '6xl': 18,   // completion AI message card
  '7xl': 20,   // glass card (GCard), goal selection card
  '8xl': 22,   // calories hero card
  '9xl': 44,   // phone shell outer frame
  full: 9999, // pill badge, BMI label, home indicator
  circle: 9999, // all circular elements
} as const;

export type RadiusKey = keyof typeof radius;

// ─────────────────────────────────────────
// 4. COMPONENT DIMENSIONS
// ─────────────────────────────────────────
export const dimensions = {




  completionIconSize: 92,
  completionIconMarginBottom: 20,
  completionGridGap: 9,
  completionAiAvatarSize: 33,
  completionAiAvatarRadius: 9,
  // ── Phone shell ─────────────────────────
  phoneWidth: 360,
  phoneHeight: 780,
  phoneRadius: radius['9xl'],    // 44

  // ── Back button ─────────────────────────
  backButtonSize: 36,
  backButtonRadius: 10,

  // ── Slider ──────────────────────────────
  sliderHeight: 4,
  sliderThumbSize: 18,
  sliderThumbRadius: radius.circle,

  // ── Stepper ─────────────────────────────
  stepperHeight: 4,
  stepperActiveFlexGrow: 2.5,
  stepperInactiveFlexGrow: 1,

  // ── Segment toggle ───────────────────────
  segmentRadius: 13,
  segmentButtonRadius: 10,

  // ── Orbs ────────────────────────────────
  glowOrbPurple: 260,
  glowOrbOrange: 200,
  glowOrbCyan: 150,
  heroOrbContainer: 260,
  heroOrbCore: 138,
  processingOrbOuter: 190,
  processingOrbCore: 114,

  // ── Rings (welcome screen) ───────────────
  welcomeRing1: 220,
  welcomeRing2: 165,

  // ── Check / radio circles ────────────────
  goalRadioSize: 22,
  activityRadioSize: 20,
  goalIconBox: 50,
  activityIconBox: 40,

  // ── Processing checks ────────────────────
  stepDotSize: 17,

  // ── Particle dots ───────────────────────
  particleMinSize: 2,
  particleMaxSize: 5.5,

  // ── Macro bar ───────────────────────────
  macroBarHeight: 7,
  macroBarRadius: 4,
  progressBarHeight: 4,
  progressBarRadius: 2,

  // ── BMI bar ─────────────────────────────
  bmiBarHeight: 4,
  bmiBarGap: 3,

  // ── Completion ───────────────────────────
  completionBurstSize: 360,
} as const;

// ─────────────────────────────────────────
// 5. Z-INDEX LAYERS
// ─────────────────────────────────────────
export const zIndex = {
  base: 0,
  background: 1,    // ambient glow orbs, particles
  content: 10,   // screen content
  statusBar: 200,  // status bar overlay
  homeIndicator: 200,  // home indicator overlay
  modal: 300,
  toast: 400,
} as const;

export type ZIndexKey = keyof typeof zIndex;
