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
import { MotiView, MotiText } from "moti";
import { Easing } from "react-native-reanimated";
import {
  X,
  AlignJustify,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import Svg, {
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
  G
} from "react-native-svg";

import AsyncStorage from
'@react-native-async-storage/async-storage';

import api from
'@/src/services/api';

import { router } from
'expo-router';

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
  socialBg: "rgba(255, 255, 255, 0.06)",
  socialBorder: "rgba(255, 255, 255, 0.09)",
  divider: "rgba(255, 255, 255, 0.10)",
  checkboxBorder: "rgba(255, 255, 255, 0.25)",
  checkboxChecked: "rgba(255, 255, 255, 0.92)",
  shadow: "rgba(0, 0, 0, 0.85)",
  buttonShadow: "rgba(255, 255, 255, 0.15)",
  accentA: "#21D4FD",
};

const RADIUS = {
  card: 28,
  input: 14,
  button: 14,
  icon: 10,
  social: 14,
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
  <View
    style={StyleSheet.absoluteFill}
    pointerEvents="none"
  >
    <Svg
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      style={StyleSheet.absoluteFill}
    >
      <Defs>

        {/* TOP PURPLE GLOW */}
        <RadialGradient
          id="glow1"
          cx="50%"
          cy="18%"
          r="58%"
        >
          <Stop
            offset="0%"
            stopColor="#7C3AED"
            stopOpacity="0.32"
          />

          <Stop
            offset="100%"
            stopColor="#7C3AED"
            stopOpacity="0"
          />
        </RadialGradient>

        {/* RIGHT PINK GLOW */}
        <RadialGradient
          id="glow2"
          cx="82%"
          cy="52%"
          r="48%"
        >
          <Stop
            offset="0%"
            stopColor="#D946EF"
            stopOpacity="0.18"
          />

          <Stop
            offset="100%"
            stopColor="#D946EF"
            stopOpacity="0"
          />
        </RadialGradient>

        {/* BOTTOM BLUE GLOW */}
        <RadialGradient
          id="glow3"
          cx="18%"
          cy="88%"
          r="52%"
        >
          <Stop
            offset="0%"
            stopColor="#2563EB"
            stopOpacity="0.14"
          />

          <Stop
            offset="100%"
            stopColor="#2563EB"
            stopOpacity="0"
          />
        </RadialGradient>

      </Defs>

      {/* TOP MAIN GLOW */}
      <Ellipse
        cx={SCREEN_WIDTH * 0.5}
        cy={SCREEN_HEIGHT * 0.18}
        rx={SCREEN_WIDTH * 0.75}
        ry={SCREEN_HEIGHT * 0.22}
        fill="url(#glow1)"
      />

      {/* RIGHT SIDE GLOW */}
      <Ellipse
        cx={SCREEN_WIDTH * 0.9}
        cy={SCREEN_HEIGHT * 0.52}
        rx={SCREEN_WIDTH * 0.45}
        ry={SCREEN_HEIGHT * 0.22}
        fill="url(#glow2)"
      />

      {/* BOTTOM LEFT GLOW */}
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

// ─── Icon Button ──────────────────────────────────────────────────────────────




// ─── Input Field ──────────────────────────────────────────────────────────────
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
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputContainerFocused,
        ]}
      >
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
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin =
    useCallback(async () => {

      try {

        if (!email || !password) {
          return;
        }

        setLoading(true);

        const response =
          await api.post(
            '/auth/login/',
            {
              email,
              password,
            }
          );

        const data =
          response.data;

        // Save tokens
        await AsyncStorage.setItem(
          '@auth_access_token',
          data.access
        );

        await AsyncStorage.setItem(
          '@auth_refresh_token',
          data.refresh
        );

        // Save user
        await AsyncStorage.setItem(
          '@auth_user',
          JSON.stringify(
            data.user
          )
        );

        // Go to app gatekeeper
        router.replace('/');

      } catch (error) {

        console.log(
          'LOGIN ERROR:',
          error
        );

      } finally {

        setLoading(false);
      }

    }, [email, password]);

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
    from={{
      opacity: 0,
      translateY: -6
    }}
    animate={{
      opacity: 1,
      translateY: 0
    }}
    transition={{
      type: "timing",
      duration: 480,
      delay: 80
    }}
    style={styles.topBarCenter}
  >
    <Text style={styles.urlText}>
      Netrilens AI
    </Text>
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
                  {/* Card inner glow */}
                  <View style={styles.cardGlowTop} pointerEvents="none" />

                  {/* Heading */}
                  <MotiView
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: 280 }}
                  >
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                      Start Your AI-Powered Fitness Journey
                    </Text>
                  </MotiView>

                  {/* Inputs */}
                  <View style={styles.inputsGroup}>
                    <InputField
                      label="Email address"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter Your Email"
                      keyboardType="email-address"
                      icon={<Mail size={16} color={COLORS.textSecondary} strokeWidth={1.8} />}
                      delay={340}
                    />
                    <InputField
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter Password"
                      secureTextEntry
                      showToggle
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                      icon={<Lock size={16} color={COLORS.textSecondary} strokeWidth={1.8} />}
                      delay={420}
                    />
                  </View>

                  {/* Remember / Forgot */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 420, delay: 500 }}
                    style={styles.rememberRow}
                  >
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => setRememberMe((v) => !v)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                        {rememberMe && (
                          <View style={styles.checkmark} />
                        )}
                      </View>
                      <Text style={styles.rememberText}>Remember me</Text>
                    </TouchableOpacity>

                    
                  </MotiView>

                  {/* Continue Button */}
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
                        onPress={handleLogin}
                      >
                        <LinearGradient
                          colors={["#FFFFFF", "#E8E8EC"]}
                          style={StyleSheet.absoluteFill}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                        <Text style={styles.continueText}>Continue</Text>
                      </Pressable>
                    </MotiView>
                  </MotiView>

                  {/* Divider */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 400, delay: 620 }}
                    style={styles.dividerRow}
                  >
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or Sign up with</Text>
                    <View style={styles.dividerLine} />
                  </MotiView>

                  {/* Social Buttons */}
                  <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 440, delay: 680 }}
                    style={styles.socialRow}
                  >
                    {/* Google */}
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                      <View style={styles.socialInner}>
                        {/* Google G SVG */}
                        <Svg width={20} height={20} viewBox="0 0 48 48">
                          <Circle cx="24" cy="24" r="24" fill="transparent" />
                          <Svg viewBox="0 0 48 48" width={20} height={20}>
                            {/* Simplified Google logo paths via nested SVG */}
                          </Svg>
                        </Svg>
                        <GoogleIcon />
                        <Text style={styles.socialText}>Google</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Apple */}
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.75}>
                      <View style={styles.socialInner}>
                        <AppleIcon />
                        <Text style={styles.socialText}>Apple</Text>
                      </View>
                    </TouchableOpacity>
                  </MotiView>
                  {/* ── Footer — login link ── */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 360, delay: 700 }}
                    style={styles.footer}
                  >
                    <Text style={styles.footerTxt}>Already have an account? </Text>
                    <TouchableOpacity
                      onPress={() => router.push("/login")}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.footerAccent}>Login</Text>
                    </TouchableOpacity>
                  </MotiView>

                  {/* Footer */}
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 320, delay: 740 }}
                    style={styles.legalRow}
                  >
                    <TouchableOpacity activeOpacity={0.65}>
                      <Text style={styles.legalLink}>Terms of Use</Text>
                    </TouchableOpacity>
                    <View style={styles.legalSep} />
                    <TouchableOpacity activeOpacity={0.65}>
                      <Text style={styles.legalLink}>Privacy Policy.</Text>
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

// ─── Google Icon (inline SVG) ─────────────────────────────────────────────────
const GoogleIcon: React.FC = () => (
  <Svg width={17} height={17} viewBox="0 0 18 18">
    <Path
      fill="#4285F4"
      d="M17.64 9.2c0-.638-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
    />
    <Path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
    />
    <Path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <Path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
    />
  </Svg>
);

// ─── Proper Google Logo (React Native SVG paths) ──────────────────────────────
// Using a simplified text-based render
const GoogleIconClean: React.FC = () => (
  <View style={styles.socialIconWrap}>
    <Svg width={18} height={18} viewBox="0 0 24 24">
      {/* Google 'G' simplified with multicolor blocks */}
      <Defs>
        <RadialGradient id="g1" cx="50%" cy="50%" r="70%">
          <Stop offset="0%" stopColor="#4285F4" stopOpacity="1" />
          <Stop offset="100%" stopColor="#4285F4" stopOpacity="0.85" />
        </RadialGradient>
      </Defs>
      {/* Blue (right portion) */}
      <Circle cx="12" cy="12" r="12" fill="none" />
      {/* This renders a simplified "G" shape using rects */}
    </Svg>
    <Text style={styles.googleG}>G</Text>
  </View>
);

// ─── Apple Icon ───────────────────────────────────────────────────────────────
const AppleIcon: React.FC = () => (
  <Svg width={17} height={17} viewBox="0 0 1024 1024">
    <Path
      fill="white"
      fillOpacity={0.9}
      d="M747.4 535.7c-.4-68.2 30.5-119.6 92.9-157.5-34.9-50-87.7-77.5-157.3-82.8-65.9-5.2-138 38.4-164.4 38.4-27.9 0-91.7-36.6-141.9-36.6C273.1 298.8 163 379.8 163 544.6c0 48.7 8.9 99 26.7 150.8 23.8 68.2 109.6 235.3 199.1 232.6 46.8-1.1 79.9-33.2 140.8-33.2 59.1 0 89.7 33.2 141.9 33.2 90.3-1.3 167.9-153.2 190.5-221.6-121.1-57.1-114.6-167.2-114.6-170.7zm-105.1-305c50.7-60.2 46.1-115 44.6-134.7-44.8 2.6-96.6 30.5-126.1 64.8-32.5 36.8-51.6 82.3-47.5 133.6 48.4 3.7 92.6-21.2 129-63.7z"
    />
  </Svg>
);


// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // ── Top Bar ──
  topBar: {
  width: "100%",
  alignItems: "center",
  justifyContent: "center",

  paddingTop: 12,
  paddingBottom: 8,
},

topBarCenter: {
  alignItems: "center",
  justifyContent: "center",
},
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.icon,
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.10)",
  },
  iconButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  urlText: {
    fontSize: 13.5,
    fontWeight: "500",
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },

  // ── Card ──
 cardWrapper: {
  borderRadius: RADIUS.card,

  overflow: "hidden",

  borderWidth: 0.8,
  borderColor: COLORS.cardBorder,

  marginTop: "auto",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 24
  },

  shadowOpacity: 0.55,
  shadowRadius: 48,

  elevation: 24,
},
  cardBlur: {
    borderRadius: RADIUS.card,
  },
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

  backgroundColor:
    "rgba(124, 58, 237, 0.10)",

  borderRadius: 180,

  opacity: 0.9,
},

  // ── Heading ──
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

  // ── Inputs ──
  inputsGroup: {
    gap: 12,
    marginBottom: 18,
  },
  inputWrapper: {
    gap: 6,
  },
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
  inputIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "400",
    color: COLORS.textPrimary,
    letterSpacing: 0.05,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 6,
  },

  // ── Remember / Forgot ──
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.2,
    borderColor: COLORS.checkboxBorder,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "rgba(255,255,255,0.88)",
  },
  checkmark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#0A0A14",
  },
  rememberText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: "400",
    letterSpacing: 0.05,
  },
  forgotText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.05,
  },

  // ── Continue Button ──
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

  // ── Divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: "400",
    letterSpacing: 0.1,
  },

  // ── Social ──
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.social,
    backgroundColor: COLORS.socialBg,
    borderWidth: 0.8,
    borderColor: COLORS.socialBorder,
    overflow: "hidden",
  },
  socialInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
    letterSpacing: 0.05,
  },
  socialIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
    lineHeight: 18,
    marginTop: 0,
    fontStyle: "italic",
  },
 

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
    footerTxt: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  footerAccent: {
    fontSize: 12.5,
    color: COLORS.accentA,
    fontWeight: "600",
    letterSpacing: 0.05,
  },
  footerLink: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    fontWeight: "400",
    letterSpacing: 0.1,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(235,235,245,0.15)",
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  legalLink: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "400",
    letterSpacing: 0.08,
  },
  legalSep: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.textMuted,
    opacity: 0.45,
  },
});