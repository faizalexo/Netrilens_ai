// app/(auth)/register.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
    const router = useRouter();
    const [secure, setSecure] = useState(true);

    const scale = useSharedValue(1);

    const animatedButton = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <LinearGradient
            colors={["#040816", "#070B1B", "#040816"]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            <View style={styles.topGlow} />
            <View style={styles.bottomGlow} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.safe}>
                    <Animated.View
                        entering={FadeInUp.duration(700)}
                        style={styles.hero}
                    >
                        <LinearGradient
                            colors={["rgba(32,215,255,0.22)", "rgba(123,97,255,0.16)"]}
                            style={styles.logo}
                        >
                            <Text style={styles.logoText}>N</Text>
                        </LinearGradient>

                        <Text style={styles.heading}>Create Account</Text>

                        <Text style={styles.subheading}>
                            Begin your AI-powered nutrition journey.
                        </Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInDown.delay(150).duration(700)}
                        style={styles.card}
                    >
                        {/* Username */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Choose username"
                                    placeholderTextColor="#667085"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Create password"
                                    placeholderTextColor="#667085"
                                    secureTextEntry={secure}
                                    style={styles.input}
                                />

                                <Pressable onPress={() => setSecure(!secure)}>
                                    <Ionicons
                                        name={secure ? "eye-off-outline" : "eye-outline"}
                                        size={22}
                                        color="#8B93A7"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Confirm password"
                                    placeholderTextColor="#667085"
                                    secureTextEntry={secure}
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        {/* Register Button */}
                        <Animated.View style={animatedButton}>
                            <Pressable
                                onPressIn={() => {
                                    scale.value = withSpring(0.97);
                                }}
                                onPressOut={() => {
                                    scale.value = withSpring(1);
                                }}
                            >
                                <LinearGradient
                                    colors={["#21D4FD", "#7B61FF"]}
                                    style={styles.button}
                                >
                                    <Text style={styles.buttonText}>
                                        Create Account
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>

                        <Pressable
                            style={styles.footer}
                            onPress={() => router.push("/login")}
                        >
                            <Text style={styles.footerText}>
                                Already have an account?{" "}
                                <Text style={styles.footerAccent}>
                                    Login
                                </Text>
                            </Text>
                        </Pressable>
                    </Animated.View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#040816",
    },

    safe: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
    },

    topGlow: {
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: 300,
        backgroundColor: "rgba(32,215,255,0.18)",
        top: -120,
        left: -100,
    },

    bottomGlow: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: 260,
        backgroundColor: "rgba(123,97,255,0.18)",
        bottom: -80,
        right: -80,
    },

    hero: {
        marginBottom: 42,
    },

    logo: {
        width: 78,
        height: 78,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    logoText: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "700",
    },

    heading: {
        color: "#FFFFFF",
        fontSize: 38,
        fontWeight: "700",
        marginBottom: 12,
        letterSpacing: -1,
    },

    subheading: {
        color: "#94A3B8",
        fontSize: 16,
        lineHeight: 26,
        width: "88%",
    },

    card: {
        backgroundColor: "rgba(13,17,30,0.82)",
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        shadowColor: "#21D4FD",
        shadowOpacity: 0.12,
        shadowRadius: 28,
        shadowOffset: {
            width: 0,
            height: 10,
        },
    },

    inputContainer: {
        marginBottom: 22,
    },

    label: {
        color: "#B8C0D4",
        fontSize: 14,
        marginBottom: 10,
        fontWeight: "500",
    },

    inputWrapper: {
        height: 62,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },

    button: {
        height: 62,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        shadowColor: "#21D4FD",
        shadowOpacity: 0.4,
        shadowRadius: 24,
        shadowOffset: {
            width: 0,
            height: 10,
        },
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.3,
    },

    footer: {
        marginTop: 28,
        alignItems: "center",
    },

    footerText: {
        color: "#94A3B8",
        fontSize: 14,
    },

    footerAccent: {
        color: "#21D4FD",
        fontWeight: "600",
    },
});