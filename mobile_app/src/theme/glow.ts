/**
 * glow.ts — Netrilens AI Design System
 *
 * Glow in the reference is achieved via CSS box-shadow (coloured, zero-offset).
 * In React Native, glows are replicated through:
 *
 *   1. Shadow props  — iOS shadowColor / shadowRadius (exported as ViewStyle)
 *   2. Outer glow layers — absolutely-positioned blurred Views
 *      (use with react-native-blur or @react-native-masked-view)
 *   3. SVG filters  — <feGaussianBlur> for SVG-rendered components
 *   4. Animated glow pulses — Animated.Value opacity/scale cycles
 *
 * Each token exports:
 *   native  — React Native ViewStyle (iOS shadow, elevation for Android)
 *   config  — raw parameters for custom glow renderers
 */

import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';
import { palette } from './colors';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface GlowConfig {
  /** Glow color (with or without alpha) */
  color: string;
  /** Blur radius in dp */
  radius: number;
  /** Opacity 0–1 (applied if color has no alpha) */
  opacity: number;
  /** Spread in dp (approximated with scale on Android) */
  spread?: number;
}

export interface GlowToken {
  /** Cross-platform native ViewStyle */
  native: ViewStyle;
  /** Raw config for custom SVG / blur renderers */
  config: GlowConfig;
  /** Second layer config (multi-layer glows) */
  config2?: GlowConfig;
}

// ─────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────
function makeGlow(cfg: GlowConfig): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: Math.round(cfg.radius * 0.5) };
  }
  return {
    shadowColor:   cfg.color,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: cfg.opacity,
    shadowRadius:  cfg.radius,
  };
}

// ─────────────────────────────────────────
// 1. AMBIENT ORB GLOWS  (background atmosphere)
// ─────────────────────────────────────────

/** Top-left purple ambient orb — 260×260 */
export const glowOrbPurple: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 80, opacity: 0.22 }),
  config: { color: palette.purple500, radius: 80, opacity: 0.22 },
};

/** Bottom-right orange ambient orb — 200×200 */
export const glowOrbOrange: GlowToken = {
  native: makeGlow({ color: palette.orange500, radius: 60, opacity: 0.18 }),
  config: { color: palette.orange500, radius: 60, opacity: 0.18 },
};

/** Mid-right cyan ambient orb — 150×150 */
export const glowOrbCyan: GlowToken = {
  native: makeGlow({ color: palette.cyan500, radius: 50, opacity: 0.16 }),
  config: { color: palette.cyan500, radius: 50, opacity: 0.16 },
};

// ─────────────────────────────────────────
// 2. AI ORB / HERO ORB GLOW
// ─────────────────────────────────────────

/**
 * Hero AI orb outer glow
 * Web: 0 0 46px rgba(124,58,237,.52), inset 0 0 26px rgba(168,85,247,.18)
 */
export const glowHeroOrb: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 46, opacity: 0.52 }),
  config:  { color: palette.purple500, radius: 46, opacity: 0.52 },
  config2: { color: palette.purple300, radius: 26, opacity: 0.18 }, // inner
};

/**
 * Satellite dot glow on the orbital ring
 * Web: 0 0 8px {dotColor}
 */
export function glowOrbDot(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 8, opacity: 0.90 }),
    config: { color: accentHex, radius: 8, opacity: 0.90 },
  };
}

// ─────────────────────────────────────────
// 3. PRIMARY CTA BUTTON GLOW
// ─────────────────────────────────────────

/**
 * Web: 0 4px 20px rgba(124,58,237,.42), 0 0 38px rgba(124,58,237,.16)
 */
export const glowPrimaryButton: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 20, opacity: 0.42 }),
  config:  { color: palette.purple500, radius: 20, opacity: 0.42 },
  config2: { color: palette.purple500, radius: 38, opacity: 0.16 },
};

// ─────────────────────────────────────────
// 4. BADGE / PILL GLOW  (pulse dot inside badge)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 6px {PL}
 * Used on the pulsing dot inside "AI-Powered Nutrition" badge
 */
export const glowBadgeDot: GlowToken = {
  native: makeGlow({ color: palette.purple300, radius: 6, opacity: 0.90 }),
  config: { color: palette.purple300, radius: 6, opacity: 0.90 },
};

// ─────────────────────────────────────────
// 5. STEPPER ACTIVE SEGMENT GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 10px {P}
 * Active stepper segment
 */
export const glowStepperActive: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 10, opacity: 0.80 }),
  config: { color: palette.purple500, radius: 10, opacity: 0.80 },
};

// ─────────────────────────────────────────
// 6. INPUT FOCUS GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 16px rgba(124,58,237,.26)
 */
export const glowInputFocus: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 16, opacity: 0.26 }),
  config: { color: palette.purple500, radius: 16, opacity: 0.26 },
};

// ─────────────────────────────────────────
// 7. SLIDER THUMB GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 8px rgba(124,58,237,.8)
 */
export const glowSliderThumb: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 8, opacity: 0.80 }),
  config: { color: palette.purple500, radius: 8, opacity: 0.80 },
};

// ─────────────────────────────────────────
// 8. METRIC CARD ACCENT GLOW  (dynamic)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 22px {accentColor}22
 * "22" hex = 0.133 opacity
 */
export function glowMetricCard(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 22, opacity: 0.13 }),
    config: { color: accentHex, radius: 22, opacity: 0.13 },
  };
}

// ─────────────────────────────────────────
// 9. GOAL CARD GLOW  (selected state, dynamic)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 24px {goalColor}28
 * "28" hex = 0.157 opacity
 */
export function glowGoalCard(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 24, opacity: 0.16 }),
    config: { color: accentHex, radius: 24, opacity: 0.16 },
  };
}

// ─────────────────────────────────────────
// 10. ACTIVITY ROW GLOW  (selected state, dynamic)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 20px {levelColor}18
 * "18" hex = 0.094 opacity
 */
export function glowActivityRow(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 20, opacity: 0.09 }),
    config: { color: accentHex, radius: 20, opacity: 0.09 },
  };
}

// ─────────────────────────────────────────
// 11. GENDER SEGMENT SELECTED GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 2px 12px rgba(124,58,237,.40)
 */
export const glowSegmentSelected: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 12, opacity: 0.40 }),
  config: { color: palette.purple500, radius: 12, opacity: 0.40 },
};

// ─────────────────────────────────────────
// 12. PROCESSING ORB CORE GLOW
// ─────────────────────────────────────────

/**
 * Web: 0 0 42px rgba(124,58,237,.45), inset 0 0 26px rgba(124,58,237,.12)
 */
export const glowProcessingOrb: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 42, opacity: 0.45 }),
  config:  { color: palette.purple500, radius: 42, opacity: 0.45 },
  config2: { color: palette.purple500, radius: 26, opacity: 0.12 }, // inner glow
};

// ─────────────────────────────────────────
// 13. PROGRESS BAR GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 8px {P}
 * Progress bar fill leading edge
 */
export const glowProgressBar: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 8, opacity: 0.80 }),
  config: { color: palette.purple500, radius: 8, opacity: 0.80 },
};

// ─────────────────────────────────────────
// 14. MACRO CHIP GLOW  (dynamic)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 18px {macroColor}13
 * "13" hex = 0.075 opacity
 */
export function glowMacroChip(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 18, opacity: 0.075 }),
    config: { color: accentHex, radius: 18, opacity: 0.075 },
  };
}

// ─────────────────────────────────────────
// 15. MACRO BAR SEGMENT GLOW  (dynamic)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 6px {macroColor}60
 * "60" hex = 0.376 opacity
 */
export function glowMacroBarSegment(accentHex: string): GlowToken {
  return {
    native: makeGlow({ color: accentHex, radius: 6, opacity: 0.376 }),
    config: { color: accentHex, radius: 6, opacity: 0.376 },
  };
}

// ─────────────────────────────────────────
// 16. CALORIES CARD GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 30px rgba(124,58,237,.22)
 */
export const glowCaloriesCard: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 30, opacity: 0.22 }),
  config: { color: palette.purple500, radius: 30, opacity: 0.22 },
};

// ─────────────────────────────────────────
// 17. COMPLETION ICON GLOW
// ─────────────────────────────────────────

/**
 * Web: 0 0 42px rgba(124,58,237,.55), 0 0 80px rgba(124,58,237,.20)
 */
export const glowCompletionIcon: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 42, opacity: 0.55 }),
  config:  { color: palette.purple500, radius: 42, opacity: 0.55 },
  config2: { color: palette.purple500, radius: 80, opacity: 0.20 },
};

// ─────────────────────────────────────────
// 18. AI AVATAR ICON GLOW
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 4px 12px rgba(124,58,237,.42)
 */
export const glowAiAvatar: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 12, opacity: 0.42 }),
  config: { color: palette.purple500, radius: 12, opacity: 0.42 },
};

// ─────────────────────────────────────────
// 19. PHONE SHELL OUTER GLOW
// ─────────────────────────────────────────

/**
 * Web: 0 0 90px rgba(124,58,237,.32), 0 0 180px rgba(124,58,237,.12)
 */
export const glowPhoneShell: GlowToken = {
  native: makeGlow({ color: palette.purple500, radius: 90, opacity: 0.32 }),
  config:  { color: palette.purple500, radius: 90, opacity: 0.32 },
  config2: { color: palette.purple500, radius: 180, opacity: 0.12 },
};

// ─────────────────────────────────────────
// 20. SCAN LINE GLOW  (AI processing orb)
// ─────────────────────────────────────────

/**
 * Web: box-shadow: 0 0 10px {CY}
 * The animated cyan scan line that sweeps the orb
 */
export const glowScanLine: GlowToken = {
  native: makeGlow({ color: palette.cyan500, radius: 10, opacity: 0.90 }),
  config: { color: palette.cyan500, radius: 10, opacity: 0.90 },
};

// ─────────────────────────────────────────
// ANIMATION CONFIGS  (for Animated.Value loops)
// ─────────────────────────────────────────
export const glowAnimations = {
  /**
   * glowP keyframe (ambient orbs, welcome ring, badge dot)
   * opacity:  0.5 → 1.0 → 0.5
   * scale:    1.0 → 1.07 → 1.0
   */
  pulse: {
    opacityFrom:  0.5,
    opacityTo:    1.0,
    scaleFrom:    1.0,
    scaleTo:      1.07,
    durationMs:   { slow: 6000, medium: 4000, fast: 2200, badge: 1400 },
  },

  /**
   * stepPulse (processing step row active dot)
   * shadowRadius: 8 → 18 → 8  (purple)
   */
  stepPulse: {
    radiusFrom: 8,
    radiusTo:   18,
    colorFrom:  palette.purple500,
    colorTo:    palette.purple300,
    durationMs: 1000,
  },

  /**
   * floatY (hero orb floating animation)
   * translateY: 0 → -16 → 0
   * rotate:     0° → 3° → 0°
   */
  float: {
    translateYFrom: 0,
    translateYTo:   -16,
    rotateFrom:     '0deg',
    rotateTo:       '3deg',
    durationMs:     5000,
  },
} as const;

// ─────────────────────────────────────────
// NAMED MAP  (convenience)
// ─────────────────────────────────────────
export const glow = {
  // Static
  orbPurple:        glowOrbPurple,
  orbOrange:        glowOrbOrange,
  orbCyan:          glowOrbCyan,
  heroOrb:          glowHeroOrb,
  primaryButton:    glowPrimaryButton,
  badgeDot:         glowBadgeDot,
  stepperActive:    glowStepperActive,
  inputFocus:       glowInputFocus,
  sliderThumb:      glowSliderThumb,
  segmentSelected:  glowSegmentSelected,
  processingOrb:    glowProcessingOrb,
  progressBar:      glowProgressBar,
  caloriesCard:     glowCaloriesCard,
  completionIcon:   glowCompletionIcon,
  aiAvatar:         glowAiAvatar,
  phoneShell:       glowPhoneShell,
  scanLine:         glowScanLine,
  // Dynamic (call with accent color)
  orbDot:           glowOrbDot,
  metricCard:       glowMetricCard,
  goalCard:         glowGoalCard,
  activityRow:      glowActivityRow,
  macroChip:        glowMacroChip,
  macroBarSegment:  glowMacroBarSegment,
} as const;
