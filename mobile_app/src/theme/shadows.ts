/**
 * shadows.ts — Netrilens AI Design System
 *
 * React Native shadow strategy:
 *   iOS   — shadowColor / shadowOffset / shadowOpacity / shadowRadius
 *   Android — elevation  (maps to a Material-like drop shadow)
 *
 * This file defines shadow tokens as cross-platform style objects.
 * For glow effects (coloured, multi-layer) see glow.ts.
 *
 * Naming: <target>Shadow  e.g. cardShadow, buttonShadow
 */

import type { ViewStyle } from 'react-native';
import { Platform } from 'react-native';
import { palette } from './colors';

// ─────────────────────────────────────────
// HELPER — cross-platform shadow factory
// ─────────────────────────────────────────
interface ShadowConfig {
  color: string;
  offsetX?: number;
  offsetY: number;
  blur: number;        // iOS → shadowRadius; Android → elevation approximation
  opacity: number;     // iOS only
  elevation?: number;  // Android explicit override
}

function makeShadow({
  color,
  offsetX = 0,
  offsetY,
  blur,
  opacity,
  elevation,
}: ShadowConfig): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: elevation ?? Math.round(blur * 0.4) };
  }
  return {
    shadowColor:   color,
    shadowOffset:  { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius:  blur,
  };
}

// ─────────────────────────────────────────
// 1. PHONE SHELL  (outer device frame glow)
// ─────────────────────────────────────────
/**
 * The multi-layer phone shell shadow from the web reference.
 * React Native supports a single shadowColor per view;
 * layer 1 (most visible) is used natively.
 * Full web equivalent: 3-layer purple glow + deep black drop.
 *
 * Layer 1: 0 0 90px rgba(124,58,237,.32)
 * Layer 2: 0 0 180px rgba(124,58,237,.12)
 * Layer 3: 0 55px 100px rgba(0,0,0,.95)
 */
export const phoneShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    90,
  opacity: 0.32,
  elevation: 28,
});

// ─────────────────────────────────────────
// 2. PRIMARY CTA BUTTON
// ─────────────────────────────────────────
/**
 * Web:  box-shadow: 0 4px 20px rgba(124,58,237,.42), 0 0 38px rgba(124,58,237,.16)
 * Native: primary layer (stronger, 20px blur, 4px offsetY)
 */
export const primaryButtonShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 4,
  blur:    20,
  opacity: 0.42,
  elevation: 10,
});

// ─────────────────────────────────────────
// 3. GLASS CARD (GCard)
// ─────────────────────────────────────────
/**
 * Web: inset 0 1px 0 rgba(255,255,255,.06)  — top-edge inset highlight
 * Native approximation: very subtle top-lit shadow
 */
export const cardShadow: ViewStyle = makeShadow({
  color:   palette.white,
  offsetY: 1,
  blur:    4,
  opacity: 0.06,
  elevation: 2,
});

// ─────────────────────────────────────────
// 4. METRIC CARD (with accent glow)
// ─────────────────────────────────────────
/**
 * Web: 0 0 22px {accentColor}22, inset 0 1px 0 rgba(255,255,255,.08)
 * Native: accent-coloured top shadow; pass `color` at usage site.
 */
export function metricCardShadow(accentHex: string): ViewStyle {
  return makeShadow({
    color:   accentHex,
    offsetY: 0,
    blur:    22,
    opacity: 0.13,    // matches the "22" hex alpha (≈ 0.133)
    elevation: 6,
  });
}

// ─────────────────────────────────────────
// 5. CALORIES HERO CARD
// ─────────────────────────────────────────
/**
 * Web: 0 0 30px rgba(124,58,237,.22)
 */
export const caloriesCardShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    30,
  opacity: 0.22,
  elevation: 8,
});

// ─────────────────────────────────────────
// 6. MACRO CHIPS (Protein / Carbs / Fats)
// ─────────────────────────────────────────
/**
 * Web: 0 0 18px {macroColor}13
 */
export function macroChipShadow(accentHex: string): ViewStyle {
  return makeShadow({
    color:   accentHex,
    offsetY: 0,
    blur:    18,
    opacity: 0.075,   // "13" hex alpha ≈ 0.075
    elevation: 4,
  });
}

// ─────────────────────────────────────────
// 7. GOAL SELECTION CARD (selected state)
// ─────────────────────────────────────────
/**
 * Web: 0 0 24px {goalColor}28, 0 4px 18px rgba(0,0,0,.28)
 */
export function goalCardShadow(accentHex: string): ViewStyle {
  return makeShadow({
    color:   accentHex,
    offsetY: 4,
    blur:    24,
    opacity: 0.157,   // "28" hex alpha ≈ 0.157
    elevation: 10,
  });
}

// ─────────────────────────────────────────
// 8. ACTIVITY ROW (selected state)
// ─────────────────────────────────────────
/**
 * Web: 0 0 20px {levelColor}18
 */
export function activityRowShadow(accentHex: string): ViewStyle {
  return makeShadow({
    color:   accentHex,
    offsetY: 0,
    blur:    20,
    opacity: 0.094,   // "18" hex ≈ 0.094
    elevation: 5,
  });
}

// ─────────────────────────────────────────
// 9. AI ICON / AVATAR (completion)
// ─────────────────────────────────────────
/**
 * Web: 0 4px 12px rgba(124,58,237,.42)
 */
export const aiAvatarShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 4,
  blur:    12,
  opacity: 0.42,
  elevation: 8,
});

// ─────────────────────────────────────────
// 10. COMPLETION SUCCESS ICON
// ─────────────────────────────────────────
/**
 * Web: 0 0 42px rgba(124,58,237,.55), 0 0 80px rgba(124,58,237,.20)
 */
export const completionIconShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    42,
  opacity: 0.55,
  elevation: 18,
});

// ─────────────────────────────────────────
// 11. SLIDER THUMB
// ─────────────────────────────────────────
/**
 * Web: box-shadow: 0 0 8px rgba(124,58,237,.8)
 */
export const sliderThumbShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    8,
  opacity: 0.80,
  elevation: 4,
});

// ─────────────────────────────────────────
// 12. GENDER SEGMENT (selected button)
// ─────────────────────────────────────────
/**
 * Web: box-shadow: 0 2px 12px rgba(124,58,237,.40)
 */
export const segmentSelectedShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 2,
  blur:    12,
  opacity: 0.40,
  elevation: 5,
});

// ─────────────────────────────────────────
// 13. PROCESSING ORB CORE
// ─────────────────────────────────────────
/**
 * Web: 0 0 42px rgba(124,58,237,.45), inset 0 0 26px rgba(124,58,237,.12)
 */
export const processingOrbShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    42,
  opacity: 0.45,
  elevation: 16,
});

// ─────────────────────────────────────────
// 14. WELCOME AI ORB (hero)
// ─────────────────────────────────────────
/**
 * Web: 0 0 46px rgba(124,58,237,.52), inset 0 0 26px rgba(168,85,247,.18)
 */
export const heroOrbShadow: ViewStyle = makeShadow({
  color:   palette.purple500,
  offsetY: 0,
  blur:    46,
  opacity: 0.52,
  elevation: 20,
});

// ─────────────────────────────────────────
// 15. MACRO BAR SEGMENT GLOW
// ─────────────────────────────────────────
/**
 * Web: 0 0 6px {macroColor}60
 */
export function macroBarGlow(accentHex: string): ViewStyle {
  return makeShadow({
    color:   accentHex,
    offsetY: 0,
    blur:    6,
    opacity: 0.376,   // "60" hex ≈ 0.376
    elevation: 2,
  });
}

// ─────────────────────────────────────────
// NAMED EXPORT MAP  (convenience access)
// ─────────────────────────────────────────
export const shadows = {
  phone:              phoneShadow,
  primaryButton:      primaryButtonShadow,
  card:               cardShadow,
  caloriesCard:       caloriesCardShadow,
  aiAvatar:           aiAvatarShadow,
  completionIcon:     completionIconShadow,
  sliderThumb:        sliderThumbShadow,
  segmentSelected:    segmentSelectedShadow,
  processingOrb:      processingOrbShadow,
  heroOrb:            heroOrbShadow,
  // dynamic helpers (call with accent color)
  metricCard:         metricCardShadow,
  macroChip:          macroChipShadow,
  goalCard:           goalCardShadow,
  activityRow:        activityRowShadow,
  macroBarGlow:       macroBarGlow,
} as const;
