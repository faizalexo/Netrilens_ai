import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Clipboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Easing } from "react-native-reanimated";
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

const OTP_LENGTH = 6;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    const t = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      // Handle paste (multi-char input)
      if (text.length > 1) {
        const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (digits.length > 0) {
          const newOtp = [...otp];
          for (let i = 0; i < OTP_LENGTH; i++) {
            newOtp[i] = digits[i] ?? "";
          }
          setOtp(newOtp);
          const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
          inputRefs.current[nextIndex]?.focus();
        }
        return;
      }

      const digit = text.replace(/\D/g, "");
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    },
    [otp]
  );

  const handleVerify = useCallback(async () => {
    const otpString = otp.join("");

    if (otpString.length < OTP_LENGTH) {
      toast.warning("Incomplete Code", "Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/verify-reset-otp/", {
        email,
        otp: otpString,
      });

      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, otp: otpString },
      });
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error("Invalid Code", "The OTP you entered is incorrect.");
      } else if (error?.response?.status === 410) {
        toast.error("Code Expired", "Please request a new verification code.");
      } else {
        toast.error("Connection Error", "Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [otp, email]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);

      await api.post("/users/forgot-password/", { email });

      toast.success("Code Resent", "Please check your email.");
      setCountdown(60);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error("Connection Error", "Please try again.");
    } finally {
      setResendLoading(false);
    }
  }, [canResend, email]);

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

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
                    <Text style={styles.title}>Verify Identity</Text>
                    <Text style={styles.subtitle}>
                      Enter the 6-digit code sent to your email.
                    </Text>
                    {maskedEmail ? (
                      <Text style={styles.emailBadge}>{maskedEmail}</Text>
                    ) : null}
                  </MotiView>

                  {/* OTP Boxes */}
                  <MotiView
                    from={{ opacity: 0, translateY: 16 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 520, delay: 360, easing: Easing.out(Easing.cubic) }}
                    style={styles.otpRow}
                  >
                    {Array(OTP_LENGTH)
                      .fill(null)
                      .map((_, index) => (
                        <MotiView
                          key={index}
                          from={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            type: "spring",
                            damping: 18,
                            stiffness: 160,
                            delay: 380 + index * 45,
                          }}
                        >
                          <View
                            style={[
                              styles.otpBox,
                              otp[index] ? styles.otpBoxFilled : null,
                            ]}
                          >
                            <TextInput
                              ref={(ref) => {
                                inputRefs.current[index] = ref;
                              }}
                              style={styles.otpInput}
                              value={otp[index]}
                              onChangeText={(text) => handleOtpChange(text, index)}
                              onKeyPress={(e) => handleKeyPress(e, index)}
                              keyboardType="number-pad"
                              maxLength={OTP_LENGTH}
                              selectTextOnFocus
                              selectionColor={COLORS.white}
                              caretHidden={true}
                              textContentType="oneTimeCode"
                            />
                          </View>
                        </MotiView>
                      ))}
                  </MotiView>

                  {/* Countdown / Resend */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 400, delay: 660 }}
                    style={styles.resendRow}
                  >
                    {canResend ? (
                      <TouchableOpacity
                        onPress={handleResend}
                        activeOpacity={0.7}
                        disabled={resendLoading}
                      >
                        <Text style={styles.resendActive}>
                          {resendLoading ? "Sending…" : "Resend Code"}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.countdownText}>
                        Resend code in{" "}
                        <Text style={styles.countdownHighlight}>
                          {countdown}s
                        </Text>
                      </Text>
                    )}
                  </MotiView>

                  {/* Verify Button */}
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 440, delay: 720 }}
                  >
                    <MotiView
                      animate={{ scale: buttonPressed ? 0.975 : 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 260 }}
                    >
                      <Pressable
                        style={styles.continueButton}
                        onPressIn={() => setButtonPressed(true)}
                        onPressOut={() => setButtonPressed(false)}
                        onPress={handleVerify}
                        disabled={loading}
                      >
                        <LinearGradient
                          colors={["#FFFFFF", "#E8E8EC"]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                        <Text style={styles.continueText}>
                          {loading ? "Verifying…" : "Verify Code"}
                        </Text>
                      </Pressable>
                    </MotiView>
                  </MotiView>

                  {/* Back */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 400, delay: 780 }}
                    style={styles.footer}
                  >
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
                      <Text style={styles.footerLink}>← Back</Text>
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
    marginBottom: 8,
  },
  emailBadge: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: 0.1,
    marginBottom: 28,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    alignSelf: "center",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },

  // ── OTP ──
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    width: (SCREEN_WIDTH - 48 - 40) / OTP_LENGTH,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.inputBg,
    borderWidth: 0.8,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    borderColor: COLORS.inputBorderFocused,
    backgroundColor: "rgba(255,255,255,0.075)",
  },
  otpInput: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    width: "100%",
    height: "100%",
    paddingVertical: 0,
  },

  // ── Resend ──
  resendRow: {
    alignItems: "center",
    marginBottom: 22,
  },
  countdownText: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 0.05,
  },
  countdownHighlight: {
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  resendActive: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: "600",
    letterSpacing: 0.05,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(255,255,255,0.3)",
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