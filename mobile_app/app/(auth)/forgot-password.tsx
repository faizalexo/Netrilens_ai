import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { Mail } from "lucide-react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
} from "react-native-svg";

import api from "@/src/services/api";
import { router } from "expo-router";
import { useToast } from "@/components/ui/NetrilensToast";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#080810",
  bgGlass: "rgba(18, 18, 30, 0.72)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  inputBg: "rgba(255, 255, 255, 0.055)",
  inputBorder: "rgba(255, 255, 255, 0.10)",
  inputBorderFocused: "rgba(255, 255, 255, 0.28)",
  white: "#FFFFFF",
  textPrimary: "#F2F2F7",
  textSecondary: "rgba(235, 235, 245, 0.45)",
  textMuted: "rgba(235, 235, 245, 0.30)",
  placeholder: "rgba(235, 235, 245, 0.32)",
  accent: "#FFFFFF",
  glow1: "rgba(99, 74, 255, 0.18)",
  glow2: "rgba(28, 100, 242, 0.12)",
  divider: "rgba(255, 255, 255, 0.10)",
};

const RADIUS = {
  card: 28,
  input: 14,
  button: 14,
  icon: 10,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

// ─── Ambient Glow Background ──────────────────────────────────────────────────
const AmbientGlow: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="glow1" cx="50%" cy="18%" r="58%">
          <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.32" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glow2" cx="82%" cy="52%" r="48%">
          <Stop offset="0%" stopColor="#D946EF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#D946EF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glow3" cx="18%" cy="88%" r="52%">
          <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
          <Stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse
        cx={SCREEN_WIDTH * 0.5}
        cy={SCREEN_HEIGHT * 0.18}
        rx={SCREEN_WIDTH * 0.75}
        ry={SCREEN_HEIGHT * 0.22}
        fill="url(#glow1)"
      />
      <Ellipse
        cx={SCREEN_WIDTH * 0.9}
        cy={SCREEN_HEIGHT * 0.52}
        rx={SCREEN_WIDTH * 0.45}
        ry={SCREEN_HEIGHT * 0.22}
        fill="url(#glow2)"
      />
      <Ellipse
        cx={SCREEN_WIDTH * 0.15}
        cy={SCREEN_HEIGHT * 0.92}
        rx={SCREEN_WIDTH * 0.5}
        ry={SCREEN_HEIGHT * 0.18}
        fill="url(#glow3)"
      />
    </Svg>
  </View>
);

// ─── Local InputField (mirrors login.tsx exactly) ─────────────────────────────
import { useState as useStateLocal } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputFieldLocalProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  keyboardType?: "default" | "email-address";
  delay?: number;
}

const InputFieldLocal: React.FC<InputFieldLocalProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  showToggle,
  onToggle,
  showPassword,
  keyboardType = "default",
  delay = 0,
}) => {
  const [focused, setFocused] = useStateLocal(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 520, delay, easing: Easing.out(Easing.cubic) }}
      style={styles.inputWrapper}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={COLORS.white}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={onToggle}
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={COLORS.textSecondary} />
            ) : (
              <Eye size={18} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </MotiView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = useCallback(async () => {
    if (!email) {
      toast.warning("Missing Field", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/forgot-password/", { email });

      toast.success("Verification Sent", "Please check your email.");

      router.push({
        pathname: "/(auth)/verify-otp",
        params: { email },
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("User Not Found", "No account exists with this email.");
      } else if (error?.response?.status === 400) {
        toast.error("Invalid Email", "Please enter a valid email address.");
      } else {
        toast.error("Connection Error", "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#0A0A14", "#080810", "#06060F"]}
        style={StyleSheet.absoluteFill}
      />
      <AmbientGlow />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Top Bar ── */}
            <View style={styles.topBar}>
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 480, delay: 80 }}
                style={styles.topBarCenter}
              >
                <Text style={styles.urlText}>Netrilens AI</Text>
              </MotiView>
            </View>

            {/* ── Auth Card ── */}
            <MotiView
              from={{ opacity: 0, translateY: 40, scale: 0.96 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{
                type: "spring",
                damping: 22,
                stiffness: 140,
                delay: 120,
              }}
              style={styles.cardWrapper}
            >
              <BlurView intensity={32} tint="dark" style={styles.cardBlur}>
                <View style={styles.card}>
                  <View style={styles.cardGlowTop} pointerEvents="none" />

                  {/* Heading */}
                  <MotiView
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: 280 }}
                  >
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>
                      Enter your registered email address and we'll send a secure verification code.
                    </Text>
                  </MotiView>

                  {/* Input */}
                  <View style={styles.inputsGroup}>
                    <InputFieldLocal
                      label="Email Address"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      icon={<Mail size={16} color={COLORS.textSecondary} strokeWidth={1.8} />}
                      delay={340}
                    />
                  </View>

                  {/* Send Button */}
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 440, delay: 420 }}
                  >
                    <MotiView
                      animate={{ scale: buttonPressed ? 0.975 : 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 260 }}
                    >
                      <Pressable
                        style={styles.continueButton}
                        onPressIn={() => setButtonPressed(true)}
                        onPressOut={() => setButtonPressed(false)}
                        onPress={handleSendCode}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={["#FFFFFF", "#E8E8EC"]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                        <Text style={styles.continueText}>
                          {loading ? "Sending…" : "Send Verification Code"}
                        </Text>
                      </Pressable>
                    </MotiView>
                  </MotiView>

                  {/* Back to Login */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 400, delay: 500 }}
                    style={styles.footer}
                  >
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
                      <Text style={styles.footerLink}>← Back to Login</Text>
                    </TouchableOpacity>
                  </MotiView>
                </View>
              </BlurView>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },

  topBar: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  topBarCenter: { alignItems: "center", justifyContent: "center" },
  urlText: {
    fontSize: 13.5,
    fontWeight: "500",
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },

  cardWrapper: {
    borderRadius: RADIUS.card,
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: COLORS.cardBorder,
    marginTop: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 48,
    elevation: 24,
  },
  cardBlur: { borderRadius: RADIUS.card },
  card: {
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.bgGlass,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    overflow: "hidden",
  },
  cardGlowTop: {
    position: "absolute",
    top: -53,
    left: -30,
    right: -30,
    height: 140,
    backgroundColor: "rgba(124, 58, 237, 0.10)",
    borderRadius: 180,
    opacity: 0.9,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: "400",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.05,
    marginBottom: 28,
  },

  inputsGroup: { gap: 12, marginBottom: 22 },
  inputWrapper: { gap: 6 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.input,
    borderWidth: 0.8,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: 50,
  },
  inputContainerFocused: {
    borderColor: COLORS.inputBorderFocused,
    backgroundColor: "rgba(255,255,255,0.075)",
  },
  inputIcon: { marginRight: 10, opacity: 0.85 },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "400",
    color: COLORS.textPrimary,
    letterSpacing: 0.05,
    paddingVertical: 0,
  },
  eyeButton: { padding: 4, marginLeft: 6 },

  continueButton: {
    height: 54,
    borderRadius: RADIUS.button,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "rgba(255,255,255,0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0A14",
    letterSpacing: 0.1,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  footerLink: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
});