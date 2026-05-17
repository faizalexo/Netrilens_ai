/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          NETRILENS AI — Premium Toast System                    ║
 * ║          React Native · iOS & Android                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * OPTIONAL PEER DEPENDENCIES (recommended for full effect):
 *   expo install expo-blur expo-linear-gradient
 *   — or —
 *   npm install @react-native-community/blur react-native-linear-gradient
 *
 * USAGE:
 *   1. Wrap your root with <ToastProvider>
 *   2. Call useToast() anywhere inside
 *
 *   import { ToastProvider, useToast } from './NetrilensToast';
 *
 *   // Root
 *   export default function App() {
 *     return (
 *       <ToastProvider>
 *         <NavigationContainer>...</NavigationContainer>
 *       </ToastProvider>
 *     );
 *   }
 *
 *   // Any screen / component
 *   function WorkoutScreen() {
 *     const { toast } = useToast();
 *     return (
 *       <Button
 *         title="Sync"
 *         onPress={() =>
 *           toast.success('Workout Synced', 'Session analyzed by Netrilens AI.', {
 *             action: { label: 'View Insights', onPress: () => nav.navigate('Insights') },
 *           })
 *         }
 *       />
 *     );
 *   }
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';

// ─── Optional: expo-blur ─────────────────────────────────────────────────────
// Set to true if you have expo-blur or @react-native-community/blur installed
type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";
const USE_BLUR = true; // flip to true after: expo install expo-blur
let BlurView: any = null;
if (USE_BLUR) {
  try { BlurView = require('expo-blur').BlurView; } catch (_) {
    try { BlurView = require('@react-native-community/blur').BlurView; } catch (_) { }
  }
}

// ─── Optional: expo-linear-gradient ─────────────────────────────────────────
// Set to true if you have expo-linear-gradient installed
const USE_GRADIENT = false; // flip to true after: expo install expo-linear-gradient
let LinearGradient: any = null;
if (USE_GRADIENT) {
  try { LinearGradient = require('expo-linear-gradient').LinearGradient; } catch (_) {
    try { LinearGradient = require('react-native-linear-gradient').default; } catch (_) { }
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const TOAST_W = Math.min(SCREEN_W - 32, 390);
const MAX_STACK = 2;
const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;
const TOP_INSET = Platform.OS === 'ios' ? 54 : STATUS_H + 12;

// ─── Color tokens per toast type ─────────────────────────────────────────────
const TOKEN = {
  success: {
    iconColor: '#34d399',
    iconBg: 'rgba(16,185,129,0.13)',
    glowColor: 'rgba(16,185,129,0.28)',
    borderColor: 'rgba(16,185,129,0.22)',
    shadowColor: '#10b981',
    barStart: 'rgba(16,185,129,0.35)',
    barEnd: 'rgba(52,211,153,0.9)',
    ambientColor: 'rgba(16,185,129,0.18)',
  },
  error: {
    iconColor: '#fb7185',
    iconBg: 'rgba(248,113,113,0.12)',
    glowColor: 'rgba(248,113,113,0.28)',
    borderColor: 'rgba(248,113,113,0.22)',
    shadowColor: '#f43f5e',
    barStart: 'rgba(248,113,113,0.35)',
    barEnd: 'rgba(251,113,133,0.9)',
    ambientColor: 'rgba(248,113,113,0.16)',
  },
  warning: {
    iconColor: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.11)',
    glowColor: 'rgba(251,191,36,0.26)',
    borderColor: 'rgba(251,191,36,0.2)',
    shadowColor: '#f59e0b',
    barStart: 'rgba(251,191,36,0.35)',
    barEnd: 'rgba(252,211,77,0.9)',
    ambientColor: 'rgba(251,191,36,0.14)',
  },
  info: {
    iconColor: '#a78bfa',
    iconBg: 'rgba(129,140,248,0.12)',
    glowColor: 'rgba(129,140,248,0.3)',
    borderColor: 'rgba(129,140,248,0.22)',
    shadowColor: '#8b5cf6',
    barStart: 'rgba(129,140,248,0.35)',
    barEnd: 'rgba(167,139,250,0.95)',
    ambientColor: 'rgba(129,140,248,0.18)',
  },
};

// ─── SVG-like icons via Unicode/paths replaced with pure View icons ──────────
// We use a minimal pure-RN approach for icons — no icon font dependency.
// Swap these with your icon library (e.g. @expo/vector-icons) if preferred.

function IconSuccess({ color, size = 17 }: { color: string; size?: number }) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      {/* Checkmark drawn as two rotated rectangles */}
      <View style={{
        width: s * 0.38, height: s * 0.12,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        left: s * 0.02,
        top: s * 0.54,
        transform: [{ rotate: '45deg' }],
      }} />
      <View style={{
        width: s * 0.65, height: s * 0.12,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        right: s * 0.02,
        top: s * 0.35,
        transform: [{ rotate: '-50deg' }],
      }} />
    </View>
  );
}

function IconError({ color, size = 17 }: {
  color: string;
  size?: number;
}) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: s * 0.12, height: s * 0.7,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        transform: [{ rotate: '45deg' }],
      }} />
      <View style={{
        width: s * 0.12, height: s * 0.7,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        transform: [{ rotate: '-45deg' }],
      }} />
    </View>
  );
}

function IconWarning({ color, size = 17 }: {
  color: string;
  size?: number;
}) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: s * 0.12, height: s * 0.42,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        top: s * 0.18,
      }} />
      <View style={{
        width: s * 0.12, height: s * 0.12,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        bottom: s * 0.14,
      }} />
    </View>
  );
}

function IconInfo({ color, size = 17 }: {
  color: string;
  size?: number;
}) {
  const s = size;
  return (
    <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: s * 0.12, height: s * 0.12,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        top: s * 0.18,
      }} />
      <View style={{
        width: s * 0.12, height: s * 0.42,
        backgroundColor: color,
        borderRadius: 2,
        position: 'absolute',
        bottom: s * 0.14,
      }} />
    </View>
  );
}

const ICON_MAP = {
  success: IconSuccess,
  error: IconError,
  warning: IconWarning,
  info: IconInfo,
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ duration, token }: { duration: number; token: any }) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, []);

  const widthInterp = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (USE_GRADIENT && LinearGradient) {
    return (
      <View style={styles.progressTrack}>
        <Animated.View style={{ width: widthInterp, height: '100%', overflow: 'hidden', borderRadius: 2 }}>
          <LinearGradient
            colors={[token.barStart, token.barEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          { width: widthInterp, backgroundColor: token.iconColor },
        ]}
      />
    </View>
  );
}

// ─── Single Toast ─────────────────────────────────────────────────────────────
function NetrilensToast({

  id,

  type,

  title,

  description,

  action,

  duration,

  onDismiss,

}: {

  id: number;

  type:
  | "success"
  | "error"
  | "warning"
  | "info";

  title: number | string;

  description: number | string;

  action: any;

  duration: number;

  onDismiss: (
    id: number
  ) => void;

}) {

  const token =
    TOKEN[type]
    ?? TOKEN.info;

  const Icon =
    ICON_MAP[type]
    ?? ICON_MAP.info;

  // Entry/exit animation values
  const translateY = useRef(new Animated.Value(-36)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Swipe
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeOpac = useRef(new Animated.Value(1)).current;

  // Icon pulse ring
  const pulse = useRef(new Animated.Value(1)).current;

  // Leaving state ref (not state, to avoid re-render race)
  const leaving = useRef(false);

  // ── Entry animation ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 22, stiffness: 240, mass: 0.9, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 22, stiffness: 240, mass: 0.9, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Icon pulse ──
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Auto-dismiss ──
  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    if (leaving.current) return;
    leaving.current = true;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 260, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.94, duration: 260, useNativeDriver: true }),
    ]).start(() => onDismiss(id));
  }

  // ── Swipe gesture ──
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
        swipeOpac.setValue(Math.max(0, 1 - Math.abs(g.dx) / 160));
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > 80) {
          const dir = g.dx > 0 ? 400 : -400;
          Animated.parallel([
            Animated.timing(translateX, { toValue: dir, duration: 220, useNativeDriver: true }),
            Animated.timing(swipeOpac, { toValue: 0, duration: 220, useNativeDriver: true }),
          ]).start(() => onDismiss(id));
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.timing(swipeOpac, { toValue: 1, duration: 160, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const GlassContainer = USE_BLUR && BlurView ? BlurView : View;
  const glassProps = USE_BLUR && BlurView
    ? { intensity: 60, tint: 'dark', style: [styles.glass, { borderColor: token.borderColor }] }
    : { style: [styles.glassFallback, { borderColor: token.borderColor }] };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          opacity: Animated.multiply(opacity, swipeOpac),
          transform: [{ translateY }, { translateX }, { scale }],
          shadowColor: token.shadowColor,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Ambient top glow */}
      <View
        style={[styles.ambient, { backgroundColor: token.ambientColor }]}
        pointerEvents="none"
      />

      <GlassContainer {...glassProps}>
        <View style={styles.inner}>

          {/* Icon area */}
          <View style={styles.iconWrap}>
            {/* Pulse ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  backgroundColor: token.iconBg,
                  transform: [{ scale: pulse }],
                  opacity: 0.5,
                },
              ]}
              pointerEvents="none"
            />
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: token.iconBg }]}>
              <Icon color={token.iconColor} size={17} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{description}</Text>

            {action && (
              <TouchableOpacity
                onPress={() => { action.onPress?.(); dismiss(); }}
                style={styles.actionBtn}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, { color: token.iconColor }]}>
                  {action.label}{'  →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Close */}
          <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={10} activeOpacity={0.7}>
            <View style={styles.closeCross}>
              <View style={[styles.closeLine, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.closeLine, { transform: [{ rotate: '-45deg' }] }]} />
            </View>
          </TouchableOpacity>

        </View>
      </GlassContainer>

      {/* Progress bar */}
      <ProgressBar duration={duration} token={token} />
    </Animated.View>
  );
}

// ─── Toast Stack ──────────────────────────────────────────────────────────────
function ToastStack({ toasts, onDismiss }: { toasts: any[]; onDismiss: (id: number) => void }) {
  return (
    <View style={styles.viewport} pointerEvents="box-none">
      {toasts.map((t) => (
        <NetrilensToast key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

// ─── Context ──────────────────────────────────────────────────────────────────

type ToastItem = {

  id: number;

  type: ToastType;

  title: string;

  description: string;

  duration: number;

  action: any;
};

type ToastContextType = {

  toast: {

    success: (
      title: string,
      desc: string,
      opts?: any
    ) => number;

    error: (
      title: string,
      desc: string,
      opts?: any
    ) => number;

    warning: (
      title: string,
      desc: string,
      opts?: any
    ) => number;

    info: (
      title: string,
      desc: string,
      opts?: any
    ) => number;

    dismiss: (
      id: number
    ) => void;
  };
};
const ToastContext =
  createContext<ToastContextType | null>(
    null
  );

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] =
    useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback(

    (id: number) => {

      setToasts((prev) =>
        prev.filter(
          (t) => t.id !== id
        )
      );
    },

    []
  );

  const add = useCallback(

    (

      type:
        | "success"
        | "error"
        | "warning"
        | "info",

      title: string,

      description: string,

      options: any = {}

    ) => {

      const id =
        ++counter.current;

      setToasts((prev) => [

        {
          id,

          type,

          title,

          description,

          duration:
            options.duration
            ?? 5000,

          action:
            options.action
            ?? null,
        },

        ...prev,

      ].slice(0, MAX_STACK));

      return id;

    },

    []
  );

  const toast = useMemo(() => ({
    success: (title: string, desc: string, opts: any) => add('success', title, desc, opts),
    error: (title: string, desc: string, opts: any) => add('error', title, desc, opts),
    warning: (title: string, desc: string, opts: any) => add('warning', title, desc, opts),
    info: (title: string, desc: string, opts: any) => add('info', title, desc, opts),
    dismiss,
  }), [add, dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    top: TOP_INSET,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'box-none',
  },

  toastWrapper: {
    width: TOAST_W,
    marginBottom: 10,
    borderRadius: 22,
    overflow: 'hidden',
    // iOS shadow
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    // Android elevation handled below per card
  },

  // Fallback glass (no BlurView)
  glassFallback: {
    backgroundColor: 'rgba(11,11,22,0.95)',
    borderWidth: 0.75,
    borderRadius: 22,
    // Android elevation
    elevation: 12,
  },

  // BlurView glass (when USE_BLUR=true)
  glass: {
    borderWidth: 0.75,
    borderRadius: 22,
    overflow: 'hidden',
  },

  ambient: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    width: 180,
    height: 60,
    borderRadius: 90,
    // blur achieved via shadow on iOS
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    opacity: 0.7,
  },

  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 18,
    gap: 12,
  },

  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  pulseRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 13.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.96)',
    letterSpacing: -0.2,
    lineHeight: 18,
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },

  desc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.48)',
    lineHeight: 17,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },

  actionBtn: {
    marginTop: 9,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.13)',
  },

  actionText: {
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },

  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
    flexShrink: 0,
  },

  closeCross: {
    width: 11, height: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  closeLine: {
    position: 'absolute',
    width: 10,
    height: 1.4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
  },

  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
    opacity: 0.8,
  },
});

// ─── Demo Screen (optional) ───────────────────────────────────────────────────
// Drop this into any navigator route for a live preview.
export function NetrilensToastDemo() {
  const { toast } = useToast();

  const DEMOS: Record<
    ToastType,

    [
      string,
      string,
      any?
    ]

  > = {

    success: [

      "Workout Synced",

      "Your AI recovery analysis is ready.",

      {
        action: {
          label: "View",

          onPress: () => { },
        },
      },
    ],

    error: [

      "Sync Failed",

      "Unable to connect to AI servers.",

      {
        action: {
          label: "Retry",

          onPress: () => { },
        },
      },
    ],

    warning: [

      "Low Protein Intake",

      "You're below today's nutrition target.",

      {
        action: {
          label: "Review",

          onPress: () => { },
        },
      },
    ],

    info: [

      "AI Insight Ready",

      "New recommendations are available.",

      {
        action: {
          label: "Open",

          onPress: () => { },
        },
      },
    ],
  };

  return (
    <View style={demoStyles.screen}>
      <Text style={demoStyles.brand}>NETRILENS AI</Text>
      <Text style={demoStyles.sub}>Notification System · v2.4</Text>

      <View style={demoStyles.grid}>

        {Object.entries(DEMOS).map(
          ([type, args]) => (

            <TouchableOpacity
              key={type}

              style={demoStyles.btn}

              activeOpacity={0.75}

              onPress={() => {

                if (type === "success") {

                  toast.success(
                    args[0],
                    args[1],
                    args[2]
                  );

                } else if (
                  type === "error"
                ) {

                  toast.error(
                    args[0],
                    args[1],
                    args[2]
                  );

                } else if (
                  type === "warning"
                ) {

                  toast.warning(
                    args[0],
                    args[1],
                    args[2]
                  );

                } else {

                  toast.info(
                    args[0],
                    args[1],
                    args[2]
                  );
                }
              }}
            >

              <Text style={demoStyles.btnText}>

                {type.charAt(0)
                  .toUpperCase()
                  + type.slice(1)}

              </Text>

            </TouchableOpacity>
          )
        )}

        <TouchableOpacity

          style={[
            demoStyles.btn,
            demoStyles.btnAll,
          ]}

          activeOpacity={0.75}

          onPress={() => {

            Object.entries(DEMOS)
              .forEach(
                ([type, args], i) => {

                  setTimeout(() => {

                    if (
                      type === "success"
                    ) {

                      toast.success(
                        args[0],
                        args[1],
                        args[2]
                      );

                    } else if (
                      type === "error"
                    ) {

                      toast.error(
                        args[0],
                        args[1],
                        args[2]
                      );

                    } else if (
                      type === "warning"
                    ) {

                      toast.warning(
                        args[0],
                        args[1],
                        args[2]
                      );

                    } else {

                      toast.info(
                        args[0],
                        args[1],
                        args[2]
                      );
                    }

                  }, i * 200);
                }
              );
          }}
        >

          <Text
            style={[
              demoStyles.btnText,

              {
                color:
                  "rgba(167,139,250,0.9)",
              },
            ]}
          >

            Show All

          </Text>

        </TouchableOpacity>

      </View>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#05050c',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
  },
  brand: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.16 * 13,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  sub: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.12 * 10.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  btnAll: {
    borderColor: 'rgba(99,102,241,0.3)',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  btnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
});