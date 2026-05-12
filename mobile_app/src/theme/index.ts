/**
 * src/theme/index.ts — Netrilens AI Design System
 * Central barrel export for all theme tokens.
 *
 * Usage:
 *   import { colors, typography, spacing } from '@/theme';
 *   import { glow, blur, shadows }         from '@/theme';
 *   import { backgroundGradients, brandGradients } from '@/theme';
 */

// ── Colors ────────────────────────────────────────────────────────────────
export {
  palette,
  colors,
  type ColorKey,
} from './colors';

// ── Gradients ─────────────────────────────────────────────────────────────
export {
  GradientDir,
  backgroundGradients,
  brandGradients,
  cardGradients,
  macroGradients,
  radialGradients,
  conicGradients,
  buildSliderTrack,
} from './gradients';

// ── Shadows ───────────────────────────────────────────────────────────────
export {
  shadows,
  phoneShadow,
  primaryButtonShadow,
  cardShadow,
  caloriesCardShadow,
  aiAvatarShadow,
  completionIconShadow,
  sliderThumbShadow,
  segmentSelectedShadow,
  processingOrbShadow,
  heroOrbShadow,
  metricCardShadow,
  macroChipShadow,
  goalCardShadow,
  activityRowShadow,
  macroBarGlow,
} from './shadows';

// ── Spacing ───────────────────────────────────────────────────────────────
export {
  spacing,
  componentSpacing,
  radius,
  dimensions,
  zIndex,
  type SpacingKey,
  type SpacingValue,
  type RadiusKey,
  type ZIndexKey,
} from './spacing';

// ── Typography ────────────────────────────────────────────────────────────
export {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textTransform,
  typography,
  type FontFamilyKey,
  type FontSizeKey,
  type TypographyKey,
} from './typography';

// ── Glow ──────────────────────────────────────────────────────────────────
export {
  glow,
  glowAnimations,
  glowOrbPurple,
  glowOrbOrange,
  glowOrbCyan,
  glowHeroOrb,
  glowPrimaryButton,
  glowBadgeDot,
  glowStepperActive,
  glowInputFocus,
  glowSliderThumb,
  glowSegmentSelected,
  glowProcessingOrb,
  glowProgressBar,
  glowCaloriesCard,
  glowCompletionIcon,
  glowAiAvatar,
  glowPhoneShell,
  glowScanLine,
  glowOrbDot,
  glowMetricCard,
  glowGoalCard,
  glowActivityRow,
  glowMacroChip,
  glowMacroBarSegment,
  type GlowConfig,
  type GlowToken,
} from './glow';

// ── Blur ──────────────────────────────────────────────────────────────────
export {
  blur,
  blurScale,
  blurGlassCard,
  blurModal,
  blurBottomPanel,
  blurAmbientOrbPurple,
  blurAmbientOrbOrange,
  blurAmbientOrbCyan,
  blurAiOrbInner,
  blurCompletionBurst,
  blurScanLine,
  blurStatusBar,
  blurShimmer,
  type BlurToken,
  type BlurTint,
  type BlurScaleKey,
  type BlurKey,
} from './blur';
