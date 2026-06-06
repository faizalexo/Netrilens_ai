import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { Lock, Eye, EyeOff } from "lucide-react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
} from "react-native-svg";

import api from "@/src/services/api";
import { router, useLocalSearchParams } from "expo-router";
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
};

const RADIUS = {
  card: 28,
  input: 14,
  button: 14,
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

// ─── InputField (mirrors login.tsx exactly) ───────────────────────────────────
interface InputFieldProps {
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

const InputField: React.FC<InputFieldProps> = ({
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
  const [focused, setFocused] = useState(false);

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

// ─── Password Strength ────────────────────────────────────────────────────────
interface StrengthRule {
  label: string;
  test: (p: string) => boolean;
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
  { label: "Special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrengthLevel(password: string): number {
  return STRENGTH_RULES.filter((r) => r.test(password)).length;
}

function getStrengthLabel(level: number): string {
  if (level === 0) return "";
  if (level <= 2) return "Weak";
  if (level <= 3) return "Fair";
  if (level === 4) return "Good";
  return "Strong";
}

function getStrengthColor(level: number): string {
  if (level <= 2) return "rgba(239, 68, 68, 0.85)";
  if (level === 3) return "rgba(245, 158, 11, 0.85)";
  if (level === 4) return "rgba(16, 185, 129, 0.7)";
  return "rgba(16, 185, 129, 0.95)";
}

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const level = getStrengthLevel(password);
  const label = getStrengthLabel(level);
  const color = getStrengthColor(level);

  if (!password) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.strengthContainer}
    >
      {/* Bar track */}
      <View style={styles.strengthBarTrack}>
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <MotiView
              key={i}
              style={[
                styles.strengthBarSegment,
                i === 4 && { marginRight: 0 },
              ]}
              animate={{
                backgroundColor: i < level ? color : "rgba(255,255,255,0.08)",
              }}
              transition={{ type: "timing", duration: 200, delay: i * 40 }}
            />
          ))}
      </View>

      {/* Label + rules */}
      <View style={styles.strengthLabelRow}>
        <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
      </View>

      <View style={styles.strengthRules}>
        {STRENGTH_RULES.map((rule, i) => {
          const passed = rule.test(password);
          return (
            <MotiView
              key={i}
              style={styles.ruleRow}
              animate={{ opacity: passed ? 1 : 0.45 }}
              transition={{ type: "timing", duration: 200 }}
            >
              <View
                style={[
                  styles.ruleDot,
                  { backgroundColor: passed ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.2)" },
                ]}
              />
              <Text
                style={[
                  styles.ruleText,
                  { color: passed ? COLORS.textPrimary : COLORS.textMuted },
                ]}
              >
                {rule.label}
              </Text>
            </MotiView>
          );
        })}
      </View>
    </MotiView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const strengthLevel = getStrengthLevel(password);
  const allRulesPassed = strengthLevel === STRENGTH_RULES.length;

  const handleReset = useCallback(async () => {
    if (!password || !confirmPassword) {
      toast.warning("Missing Fields", "Please fill in both password fields.");
      return;
    }

    if (!allRulesPassed) {
      toast.warning("Weak Password", "Please meet all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords Don't Match", "Please ensure both passwords are identical.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/reset-password/", {
        email,
        otp,
        password,
      });

      toast.success("Password Updated", "You can now sign in.");

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 800);
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error("Invalid Request", "The reset link may have expired.");
      } else if (error?.response?.status === 404) {
        toast.error("User Not Found", "No account exists with this email.");
      } else {
        toast.error("Connection Error", "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, email, otp, allRulesPassed]);

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
                    <Text style={styles.title}>Create New Password</Text>
                    <Text style={styles.subtitle}>
                      Create a strong password for your account.
                    </Text>
                  </MotiView>

                  {/* Inputs */}
                  <View style={styles.inputsGroup}>
                    <InputField
                      label="New Password"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••••••"
                      secureTextEntry
                      showToggle
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                      icon={<Lock size={16} color={COLORS.textSecondary} strokeWidth={1.8} />}
                      delay={340}
                    />

                    {/* Strength Indicator */}
                    <PasswordStrength password={password} />

                    <InputField
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••••••"
                      secureTextEntry
                      showToggle
                      showPassword={showConfirm}
                      onToggle={() => setShowConfirm((p) => !p)}
                      icon={<Lock size={16} color={COLORS.textSecondary} strokeWidth={1.8} />}
                      delay={420}
                    />

                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: "timing", duration: 200 }}
                        style={styles.matchRow}
                      >
                        <View
                          style={[
                            styles.matchDot,
                            {
                              backgroundColor:
                                password === confirmPassword
                                  ? "rgba(16,185,129,0.9)"
                                  : "rgba(239,68,68,0.8)",
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.matchText,
                            {
                              color:
                                password === confirmPassword
                                  ? "rgba(16,185,129,0.9)"
                                  : "rgba(239,68,68,0.8)",
                            },
                          ]}
                        >
                          {password === confirmPassword ? "Passwords match" : "Passwords don't match"}
                        </Text>
                      </MotiView>
                    )}
                  </View>

                  {/* Update Button */}
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 440, delay: 560 }}
                  >
                    <MotiView
                      animate={{ scale: buttonPressed ? 0.975 : 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 260 }}
                    >
                      <Pressable
                        style={styles.continueButton}
                        onPressIn={() => setButtonPressed(true)}
                        onPressOut={() => setButtonPressed(false)}
                        onPress={handleReset}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={["#FFFFFF", "#E8E8EC"]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                        <Text style={styles.continueText}>
                          {loading ? "Updating…" : "Update Password"}
                        </Text>
                      </Pressable>
                    </MotiView>
                  </MotiView>

                  {/* Footer */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 400, delay: 620 }}
                    style={styles.footer}
                  >
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace("/(auth)/login")}>
                      <Text style={styles.footerLink}>Back to Login</Text>
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

  // ── Strength ──
  strengthContainer: {
    marginTop: -4,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  strengthBarTrack: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },
  strengthBarSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  strengthLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  strengthRules: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "47%",
  },
  ruleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  ruleText: {
    fontSize: 11,
    letterSpacing: 0.05,
  },

  // ── Match ──
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -4,
    paddingHorizontal: 2,
  },
  matchDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  matchText: {
    fontSize: 11.5,
    fontWeight: "500",
    letterSpacing: 0.05,
  },

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
  },
  footerLink: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
});