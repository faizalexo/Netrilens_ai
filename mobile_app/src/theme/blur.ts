/**
 * blur.ts — Netrilens AI Design System
 *
 * The reference design uses blur in two contexts:
 *
 *   1. BACKDROP BLUR — frosted-glass cards / modals
 *      (CSS: backdrop-filter: blur(Xpx))
 *      → React Native: @react-native-community/blur <BlurView>
 *        or expo-blur <BlurView>
 *
 *   2. BOX BLUR / GLOW BLUR — ambient colour orbs behind UI
 *      (CSS: filter: blur() on absolutely-positioned divs)
 *      → React Native: react-native-blur MaskedView + BlurView,
 *        or approximate with large shadowRadius on a coloured View
 *
 * Each token exposes:
 *   intensity   — 0–100 scale (expo-blur / @react-native-community/blur)
 *   blurRadius  — raw dp value for react-native <Image> blurRadius prop
 *   tintColor   — optional overlay tint (light | dark | default | extraLight)
 *   config      — raw parameters for custom implementations
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LIBRARY USAGE REFERENCE
 *
 * expo-blur:
 *   import { BlurView } from 'expo-blur';
 *   <BlurView intensity={token.intensity} tint={token.tintColor} style={...}>
 *
 * @react-native-community/blur:
 *   import { BlurView } from '@react-native-community/blur';
 *   <BlurView blurType="dark" blurAmount={token.blurRadius} style={...}>
 *
 * react-native Image blurRadius (light blur only, iOS & Android):
 *   <Image blurRadius={token.blurRadius} source={...} />
 * ─────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export type BlurTint =
  | 'light'
  | 'dark'
  | 'default'
  | 'extraLight'
  | 'prominent'
  | 'systemUltraThinMaterial'
  | 'systemThinMaterial'
  | 'systemMaterial'
  | 'systemThickMaterial'
  | 'systemChromeMaterial';

export interface BlurToken {
  /** expo-blur / community-blur 0–100 intensity scale */
  intensity: number;
  /** Raw blur radius in dp (for Image.blurRadius or custom) */
  blurRadius: number;
  /** Tint colour for expo-blur <BlurView tint={...}> */
  tintColor: BlurTint;
  /** Hex overlay on top of blur (for manual tinting) */
  overlayColor?: string;
  /** Overlay opacity (0–1) */
  overlayOpacity?: number;
}

// ─────────────────────────────────────────
// 1. GLASS CARD BACKDROP BLUR
// ─────────────────────────────────────────
/**
 * Used by GCard (glass surface cards).
 * The CSS reference uses semi-transparent fills (rgba(255,255,255,.05))
 * instead of a full backdrop-filter, but in React Native we augment
 * with a subtle dark blur for depth on iOS.
 *
 * Strength: minimal — just enough to lift the card from background.
 */
export const blurGlassCard: BlurToken = {
  intensity:      10,
  blurRadius:     4,
  tintColor:      'dark',
  overlayColor:   'rgba(255,255,255,0.05)',  // matches GL
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 2. FROSTED MODAL / BOTTOM SHEET
// ─────────────────────────────────────────
/**
 * For any modal overlay or bottom drawer panel.
 * Matches the "welcome bottom panel" dark gradient overlay approach.
 */
export const blurModal: BlurToken = {
  intensity:      60,
  blurRadius:     20,
  tintColor:      'systemThickMaterial',
  overlayColor:   'rgba(5,5,8,0.72)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 3. BOTTOM PANEL OVERLAY  (welcome screen)
// ─────────────────────────────────────────
/**
 * The welcome screen bottom panel uses a gradient fade from transparent
 * to near-opaque black. This token captures the blur component.
 * Gradient is handled in gradients.ts (backgroundGradients.bottomPanelOverlay).
 */
export const blurBottomPanel: BlurToken = {
  intensity:      40,
  blurRadius:     12,
  tintColor:      'dark',
  overlayColor:   'rgba(5,5,8,0.60)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 4. AMBIENT ORB BLUR  (background atmosphere)
// ─────────────────────────────────────────
/**
 * The coloured ambient orbs (purple/orange/cyan) behind the UI
 * are large radial gradient divs. In React Native these are
 * absolutely-positioned Views with heavy shadow / glow.
 *
 * For SVG-based blur: use <feGaussianBlur stdDeviation={blurRadius}>.
 */
export const blurAmbientOrbPurple: BlurToken = {
  intensity:      80,
  blurRadius:     60,
  tintColor:      'dark',
  overlayColor:   'rgba(124,58,237,0.22)',
  overlayOpacity: 1,
};

export const blurAmbientOrbOrange: BlurToken = {
  intensity:      70,
  blurRadius:     50,
  tintColor:      'dark',
  overlayColor:   'rgba(249,115,22,0.18)',
  overlayOpacity: 1,
};

export const blurAmbientOrbCyan: BlurToken = {
  intensity:      65,
  blurRadius:     45,
  tintColor:      'dark',
  overlayColor:   'rgba(6,182,212,0.16)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 5. AI ORB INNER GLOW BLUR
// ─────────────────────────────────────────
/**
 * The hero AI orb inner sphere has a radial gradient with
 * a soft feathered edge. Approximate with:
 * - a BlurView tinted with the purple alpha
 * - or SVG radialGradient + feGaussianBlur
 */
export const blurAiOrbInner: BlurToken = {
  intensity:      50,
  blurRadius:     26,
  tintColor:      'dark',
  overlayColor:   'rgba(168,85,247,0.18)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 6. COMPLETION BURST BLUR
// ─────────────────────────────────────────
/**
 * The large radial purple burst behind the completion ✨ icon.
 * 360×360 circle, very soft.
 */
export const blurCompletionBurst: BlurToken = {
  intensity:      85,
  blurRadius:     80,
  tintColor:      'dark',
  overlayColor:   'rgba(124,58,237,0.22)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 7. SCAN LINE BLUR  (processing orb)
// ─────────────────────────────────────────
/**
 * The cyan scan line sweeping the orb uses:
 * box-shadow: 0 0 10px {CY}
 * In RN, approximate with a View using cyan glow (see glow.ts glowScanLine).
 * For extra softness, a small BlurView wrapper.
 */
export const blurScanLine: BlurToken = {
  intensity:      30,
  blurRadius:     10,
  tintColor:      'light',
  overlayColor:   'rgba(6,182,212,0.90)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 8. STATUS BAR SAFE-AREA BLUR
// ─────────────────────────────────────────
/**
 * Optional blur under the status bar for depth separation.
 */
export const blurStatusBar: BlurToken = {
  intensity:      20,
  blurRadius:     8,
  tintColor:      'dark',
  overlayColor:   'rgba(5,5,8,0.30)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// 9. SHIMMER BLUR  (loading strip animation)
// ─────────────────────────────────────────
/**
 * The shimS animation shimmer strip uses a moving linear gradient.
 * No blur is applied in the reference, but a subtle blur aids
 * the "glow" feel on the shimmer edges.
 */
export const blurShimmer: BlurToken = {
  intensity:      15,
  blurRadius:     4,
  tintColor:      'light',
  overlayColor:   'rgba(124,58,237,0.40)',
  overlayOpacity: 1,
};

// ─────────────────────────────────────────
// BLUR SCALE  (raw values for custom use)
// ─────────────────────────────────────────
export const blurScale = {
  none:   0,
  xs:     4,    // card inset subtle
  sm:     8,    // shimmer edges, scan line
  md:     12,   // bottom panel
  lg:     20,   // modal / drawer
  xl:     26,   // inner orb glow
  '2xl':  45,   // ambient cyan orb
  '3xl':  50,   // ambient orange orb
  '4xl':  60,   // ambient purple orb
  '5xl':  80,   // completion burst
} as const;

export type BlurScaleKey = keyof typeof blurScale;

// ─────────────────────────────────────────
// NAMED MAP  (convenience)
// ─────────────────────────────────────────
export const blur = {
  glassCard:        blurGlassCard,
  modal:            blurModal,
  bottomPanel:      blurBottomPanel,
  ambientOrbPurple: blurAmbientOrbPurple,
  ambientOrbOrange: blurAmbientOrbOrange,
  ambientOrbCyan:   blurAmbientOrbCyan,
  aiOrbInner:       blurAiOrbInner,
  completionBurst:  blurCompletionBurst,
  scanLine:         blurScanLine,
  statusBar:        blurStatusBar,
  shimmer:          blurShimmer,
  scale:            blurScale,
} as const;

export type BlurKey = keyof Omit<typeof blur, 'scale'>;
