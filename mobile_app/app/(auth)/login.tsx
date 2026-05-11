import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    interpolate,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginResponse {
    access: string;
    refresh: string;
    user: {
        id: number;
        name: string;
        [key: string]: unknown;
    };
}

interface ApiError {
    response?: {
        status: number;
        data?: {
            detail?: string;
            non_field_errors?: string[];
            [key: string]: unknown;
        };
    };
    message?: string;
}

// ─── Validation Schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const { width, height } = Dimensions.get("window");

const COLORS = {
    background: "#0A0A0A",
    surface: "#111111",
    card: "#161616",
    border: "rgba(255,255,255,0.07)",
    inputBg: "rgba(255,255,255,0.05)",
    orangeStart: "#FF6B00",
    orangeMid: "#FF8C00",
    yellowEnd: "#FFD000",
    textPrimary: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.5)",
    textMuted: "rgba(255,255,255,0.3)",
    error: "#FF4D4D",
    glow: "rgba(255, 107, 0, 0.35)",
    glowSoft: "rgba(255, 140, 0, 0.15)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnimatedLogo: React.FC = () => {
    const floatY = useSharedValue(0);
    const glowOpacity = useSharedValue(0.6);
    const scale = useSharedValue(1);

    useEffect(() => {
        floatY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
        scale.value = withRepeat(
            withSequence(
                withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0.97, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: floatY.value },
            { scale: scale.value },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Animated.View style={[styles.logoWrapper, containerStyle]}>
            <Animated.View style={[styles.logoGlow, glowStyle]} />
            <View style={styles.logoCard}>
                <LinearGradient
                    colors={["rgba(255,107,0,0.18)", "rgba(255,200,0,0.08)"]}
                    style={styles.logoCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.logoIconContainer}>
                    <Text style={styles.logoSymbol}>⚡</Text>
                </View>
            </View>
        </Animated.View>
    );
};

interface GradientButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    label,
    onPress,
    loading = false,
    disabled = false,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15 });
    };

    return (
        <Animated.View style={[styles.gradientButtonWrapper, animatedStyle]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.gradientButtonPressable,
                    (disabled || loading) && styles.buttonDisabled,
                ]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <LinearGradient
                    colors={
                        disabled || loading
                            ? ["rgba(255,107,0,0.4)", "rgba(255,208,0,0.4)"]
                            : [COLORS.orangeStart, COLORS.orangeMid, COLORS.yellowEnd]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientFill}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" size="small" />
                    ) : (
                        <Text style={styles.gradientButtonText}>{label}</Text>
                    )}
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
};

interface SocialButtonProps {
    label: string;
    icon: string;
    onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ label, icon, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <Pressable
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.95); }}
                onPressOut={() => { scale.value = withSpring(1); }}
                style={styles.socialButton}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Sign in with ${label}`}
            >
                <Text style={styles.socialIcon}>{icon}</Text>
                <Text style={styles.socialLabel}>{label}</Text>
            </Pressable>
        </Animated.View>
    );
};

interface InputFieldProps {
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    onBlur: () => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: "email-address" | "default";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    rightElement?: React.ReactNode;
    accessibilityLabel?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    rightElement,
    accessibilityLabel,
}) => {
    const borderAnim = useSharedValue(0);

    const borderStyle = useAnimatedStyle(() => ({
        borderColor: interpolate(
            borderAnim.value,
            [0, 1],
            [0, 1]
        ) === 0
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,107,0,0.5)",
        borderWidth: 1,
    }));

    return (
        <View style={styles.inputWrapper}>
            <Animated.View
                style={[
                    styles.inputContainer,
                    borderStyle,
                    error ? styles.inputError : null,
                ]}
            >
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onBlur={() => {
                        onBlur();
                        borderAnim.value = withTiming(0, { duration: 200 });
                    }}
                    onFocus={() => {
                        borderAnim.value = withTiming(1, { duration: 200 });
                    }}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    style={styles.textInput}
                    selectionColor={COLORS.orangeMid}
                    accessible
                    accessibilityLabel={accessibilityLabel ?? placeholder}
                />
                {rightElement && (
                    <View style={styles.inputRight}>{rightElement}</View>
                )}
            </Animated.View>
            {error && (
                <Animated.Text
                    entering={FadeInDown.duration(200)}
                    style={styles.errorText}
                >
                    {error}
                </Animated.Text>
            )}
        </View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = useCallback(async (data: LoginFormData) => {
        setIsLoading(true);

        try {

            // 🔥 Clear previous session
            await AsyncStorage.multiRemove([
                "@auth_access_token",
                "@auth_refresh_token",
                "@auth_user",
            ]);

            // 🔥 Login request
            const response = await api.post<LoginResponse>(
                "/auth/login/",
                {
                    email: data.email,
                    password: data.password,
                }
            );

            const { access, refresh, user } = response.data;

            api.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${access}`;

            await AsyncStorage.multiSet([
                ["@auth_access_token", access],
                ["@auth_refresh_token", refresh],
                ["@auth_user", JSON.stringify(user)],
            ]);

            // 🔥 VERIFY TOKEN SAVED
            const savedToken =
                await AsyncStorage.getItem(
                    "@auth_access_token"
                );

            console.log(
                "SAVED TOKEN:",
                savedToken
            );

            console.log(
                "LOGGED IN USER:",
                user
            );

            // 🔥 small delay
            setTimeout(() => {

                router.replace("/(tabs)");

            }, 300);

        } catch (err: unknown) {

            const error = err as ApiError;

            let message = "Something went wrong. Please try again.";

            if (error?.response) {

                const { status, data: errData } = error.response;

                if (status === 401 || status === 400) {

                    message =
                        (errData?.detail as string) ??
                        (errData?.non_field_errors?.[0] as string) ??
                        "Invalid email or password.";

                } else if (status === 404) {

                    message = "User not found.";

                } else if (status >= 500) {

                    message = "Server error. Please try again later.";
                }

            } else if (error?.message === "Network Error") {

                message = "No internet connection. Check your network and retry.";
            }

            Alert.alert("Login Failed", message);

        } finally {

            setIsLoading(false);
        }

    }, []);

    return (
        <View style={styles.root}>
            <StatusBar style="light" />

            {/* Ambient background glows */}
            <View style={styles.ambientTopLeft} />
            <View style={styles.ambientCenter} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.kav}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Top nav */}
                        <Animated.View
                            entering={FadeInDown.delay(100).duration(500)}
                            style={styles.topNav}
                        >
                            <TouchableOpacity
                                onPress={() => router.push("/register")}
                                accessible
                                accessibilityRole="button"
                                accessibilityLabel="Sign up"
                            >
                                <Text style={styles.navLink}>Sign up</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Logo */}
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(600)}
                            style={styles.logoSection}
                        >
                            <AnimatedLogo />
                        </Animated.View>

                        {/* Form card */}
                        <Animated.View
                            entering={FadeInUp.delay(350).duration(600).springify()}
                            style={styles.formCard}
                        >
                            <LinearGradient
                                colors={["rgba(255,107,0,0.06)", "transparent"]}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                pointerEvents="none"
                            />

                            <Text style={styles.title}>Sign In SpeechLab</Text>

                            {/* Email */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Email address</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <InputField
                                            placeholder="Enter your email"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={errors.email?.message}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            accessibilityLabel="Email address"
                                        />
                                    )}
                                />
                            </View>

                            {/* Password */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Password</Text>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <InputField
                                            placeholder="Enter your password"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={errors.password?.message}
                                            secureTextEntry={!showPassword}
                                            accessibilityLabel="Password"
                                            rightElement={
                                                <TouchableOpacity
                                                    onPress={() => setShowPassword((p) => !p)}
                                                    accessible
                                                    accessibilityRole="button"
                                                    accessibilityLabel={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Text style={styles.eyeIcon}>
                                                        {showPassword ? "🙈" : "👁"}
                                                    </Text>
                                                </TouchableOpacity>
                                            }
                                        />
                                    )}
                                />
                            </View>

                            {/* Forgot password */}
                            <TouchableOpacity
                                style={styles.forgotRow}
                                accessible
                                accessibilityRole="button"
                                accessibilityLabel="Forgot password"
                            >
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login CTA */}
                            <View style={styles.ctaRow}>
                                <GradientButton
                                    label="Login"
                                    onPress={handleSubmit(onSubmit)}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social */}
                            <View style={styles.socialRow}>
                                <SocialButton
                                    label="Apple"
                                    icon="🍎"
                                    onPress={() => { }}
                                />
                                <View style={{ width: 12 }} />
                                <SocialButton
                                    label="Google"
                                    icon="G"
                                    onPress={() => { }}
                                />
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    ambientTopLeft: {
        position: "absolute",
        top: -80,
        left: -80,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: "rgba(255,107,0,0.12)",
        // blur simulated via large spread shadow on Android / actual blur would need @react-native-community/blur
    },
    ambientCenter: {
        position: "absolute",
        top: height * 0.25,
        left: width * 0.5 - 120,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(255,140,0,0.07)",
    },
    safeArea: {
        flex: 1,
    },
    kav: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 12,
        paddingBottom: 4,
    },
    navLink: {
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: "500",
        textDecorationLine: "underline",
        textDecorationColor: "rgba(255,255,255,0.4)",
    },
    logoSection: {
        alignItems: "center",
        marginTop: 16,
        marginBottom: 28,
    },
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: 120,
        height: 120,
    },
    logoGlow: {
        position: "absolute",
        width: 130,
        height: 130,
        borderRadius: 40,
        backgroundColor: COLORS.glow,
        // shadow glow
        shadowColor: COLORS.orangeStart,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 20,
    },
    logoCard: {
        width: 104,
        height: 104,
        borderRadius: 28,
        backgroundColor: "rgba(30,20,10,0.85)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,107,0,0.25)",
        shadowColor: COLORS.orangeStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    logoCardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    logoIconContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoSymbol: {
        fontSize: 44,
    },
    formCard: {
        backgroundColor: "rgba(18,16,14,0.92)",
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 24,
        letterSpacing: 0.3,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    inputWrapper: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        height: 52,
        overflow: "hidden",
    },
    inputError: {
        borderColor: "rgba(255,77,77,0.5)",
    },
    textInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        fontWeight: "400",
        letterSpacing: 0.1,
        padding: 0,
    },
    inputRight: {
        marginLeft: 10,
        padding: 4,
    },
    eyeIcon: {
        fontSize: 17,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 5,
        marginLeft: 4,
        fontWeight: "400",
    },
    forgotRow: {
        alignItems: "flex-end",
        marginBottom: 24,
        marginTop: 4,
    },
    forgotText: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: "500",
    },
    ctaRow: {
        marginBottom: 20,
    },
    gradientButtonWrapper: {
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: COLORS.orangeStart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    gradientButtonPressable: {
        borderRadius: 14,
        overflow: "hidden",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    gradientFill: {
        height: 54,
        alignItems: "center",
        justifyContent: "center",
    },
    gradientButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.4,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginHorizontal: 12,
        fontWeight: "500",
    },
    socialRow: {
        flexDirection: "row",
    },
    socialButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 50,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    socialIcon: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textPrimary,
    },
    socialLabel: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.2,
    },
});