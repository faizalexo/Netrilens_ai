/**
 * colors.ts — Netrilens AI Design System
 * Extracted from HTML/CSS reference + screen visual audit
 *
 * Naming convention:
 *   primitive → exact hex / rgba values
 *   semantic  → intent-based aliases (background, surface, text, …)
 *   accent    → brand / highlight palette
 */

// ─────────────────────────────────────────
// 1. PRIMITIVE PALETTE
// ─────────────────────────────────────────

export const palette = {
  // ── Purple (primary brand) ──────────────
  purple900: '#3B1A7A',
  purple800: '#4C1D95',
  purple700: '#5B21B6',
  purple600: '#6D28D9',
  purple500: '#7C3AED',   // P  — primary CTA, stepper active, ring borders
  purple400: '#8B5CF6',
  purple300: '#A855F7',   // PL — lighter accent, labels, scan-line, badge text
  purple200: '#C084FC',
  purple100: '#E9D5FF',

  // ── Cyan (secondary accent) ─────────────
  cyan500:   '#06B6D4',   // CY — BMI text, scan glow, progress bars, orb rings
  cyan400:   '#22D3EE',
  cyan300:   '#67E8F9',

  // ── Orange (metric / weight accent) ─────
  orange500: '#F97316',   // OR — weight slider, protein macro, goal card
  orange400: '#FB923C',
  orange300: '#FDBA74',

  // ── Pink / Magenta (fats accent) ─────────
  pink500:   '#EC4899',   // PK — fat macro chip, athlete level, orb conic
  pink400:   '#F472B6',
  pink300:   '#F9A8D4',

  // ── Green (success / moderate level) ────
  green500:  '#22C55E',
  green400:  '#4ADE80',

  // ── Slate (sedentary muted) ─────────────
  slate500:  '#64748B',
  slate400:  '#94A3B8',

  // ── Red (danger / obese BMI) ────────────
  red500:    '#EF4444',
  red400:    '#F87171',

  // ── Neutrals / whites ───────────────────
  white:     '#FFFFFF',
  white90:   'rgba(255,255,255,0.90)',
  white80:   'rgba(255,255,255,0.80)',
  white65:   'rgba(255,255,255,0.65)',
  white50:   'rgba(255,255,255,0.50)',
  white45:   'rgba(255,255,255,0.45)',
  white42:   'rgba(255,255,255,0.42)',
  white40:   'rgba(255,255,255,0.40)',
  white38:   'rgba(255,255,255,0.38)',
  white36:   'rgba(255,255,255,0.36)',
  white32:   'rgba(255,255,255,0.32)',
  white28:   'rgba(255,255,255,0.28)',
  white26:   'rgba(255,255,255,0.26)',
  white12:   'rgba(255,255,255,0.12)',
  white10:   'rgba(255,255,255,0.10)',
  white09:   'rgba(255,255,255,0.09)',
  white08:   'rgba(255,255,255,0.08)',
  white07:   'rgba(255,255,255,0.07)',
  white06:   'rgba(255,255,255,0.06)',
  white05:   'rgba(255,255,255,0.05)',  // GL — glass surface fill
  white04:   'rgba(255,255,255,0.04)',
  white01:   'rgba(255,255,255,0.01)',

  // ── Backgrounds ─────────────────────────
  bg:        '#050508',   // BG — primary screen background (near-black)
  bgDeep:    '#0A0514',   // top/bottom gradient endpoint (deep purple-black)
  bgOrb:     '#070510',   // inner orb background fill
  bgComp:    '#080513',   // completion screen background

  // ── Pure black ──────────────────────────
  black:     '#000000',
} as const;

// ─────────────────────────────────────────
// 2. SEMANTIC TOKENS
// ─────────────────────────────────────────

export const colors = {
  // ── Screen backgrounds ──────────────────
  background: {
    primary:   palette.bg,
    deep:      palette.bgDeep,
    orb:       palette.bgOrb,
    completion:palette.bgComp,
    shell:     palette.black,
  },

  // ── Surface / glass cards ────────────────
  surface: {
    glass:        palette.white05,    // GL — default card fill
    glassBorder:  palette.white12,    // GLB — default card border
    glassFocused: 'rgba(124,58,237,0.10)',
    glassHover:   palette.white09,
    unitToggle:   palette.white06,
    secButton:    'rgba(255,255,255,0.06)',
  },

  // ── Brand / accent ───────────────────────
  brand: {
    primary:      palette.purple500,  // P
    primaryLight: palette.purple300,  // PL
    secondary:    palette.cyan500,    // CY
    orange:       palette.orange500,  // OR
    pink:         palette.pink500,    // PK
    green:        palette.green500,
    slate:        palette.slate500,
  },

  // ── Text hierarchy ───────────────────────
  text: {
    primary:       palette.white,
    secondary:     palette.white50,
    tertiary:      palette.white40,
    muted:         palette.white36,
    superMuted:    palette.white26,
    placeholder:   palette.white28,
    label:         palette.white42,
    labelFocused:  palette.purple300,
    caption:       palette.white38,
    overline:      palette.white36,
    statusBar:     palette.white90,
    statusBarIcon: palette.white80,
  },

  // ── Interactive ──────────────────────────
  interactive: {
    primaryCTA:       palette.purple500,
    primaryCTALight:  palette.purple300,
    primaryCTAMid:    '#9333EA',   // mid-stop in CTA gradient
    inputBorder:      palette.white12,
    inputBorderFocus: palette.purple500,
    inputBg:          palette.white04,
    inputBgFocus:     'rgba(124,58,237,0.10)',
    stepperActive:    palette.purple500,
    stepperDone:      palette.purple500,
    stepperInactive:  'rgba(255,255,255,0.10)',
  },

  // ── Macros ──────────────────────────────
  macro: {
    protein: palette.orange500,   // Protein chip
    carbs:   palette.cyan500,     // Carbs chip
    fats:    palette.pink500,     // Fats chip
  },

  // ── BMI scale ───────────────────────────
  bmi: {
    underweight: palette.cyan500,       // rgba(6,182,212,.65)
    normal:      palette.green500,      // rgba(34,197,94,.65)
    overweight:  palette.orange500,     // rgba(249,115,22,.65)
    obese:       palette.red500,        // rgba(239,68,68,.65)
  },

  // ── Activity levels ─────────────────────
  activity: {
    sedentary: palette.slate500,
    lightly:   palette.cyan500,
    moderate:  palette.green500,
    very:      palette.orange500,
    athlete:   palette.pink500,
  },

  // ── Badge / pill backgrounds ────────────
  badge: {
    primaryBg:     'rgba(124,58,237,0.14)',
    primaryBorder: 'rgba(124,58,237,0.28)',
    primaryText:   palette.purple300,
    cyanBg:        'rgba(6,182,212,0.10)',
    cyanBorder:    'rgba(6,182,212,0.30)',
    cyanText:      palette.cyan500,
  },

  // ── Goal card fills ─────────────────────
  goalCard: {
    loseFatBorder:    palette.orange500,
    maintainBorder:   palette.cyan500,
    buildMuscleBorder:palette.purple500,
    defaultBorder:    palette.white12,
  },

  // ── AI processing states ─────────────────
  processing: {
    stepActiveBg:    'rgba(124,58,237,0.10)',
    stepActiveBorder:'rgba(124,58,237,0.28)',
    stepDotActive:   palette.purple500,
    stepDotBorder:   palette.purple300,
    stepDotInactive: 'rgba(255,255,255,0.05)',
    shimmerBg:       'rgba(255,255,255,0.08)',
  },

  // ── Home indicator ───────────────────────
  homeIndicator: 'rgba(255,255,255,0.32)',

  // ── Divider ─────────────────────────────
  divider: 'rgba(255,255,255,0.06)',

  // ── Transparent ─────────────────────────
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
