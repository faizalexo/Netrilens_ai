import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    Modal,
    Alert,
    Image,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withSpring,
    interpolate,
    Easing,
    useAnimatedScrollHandler,
    FadeIn,
    FadeInDown,
    FadeInUp,
    ZoomIn,
} from 'react-native-reanimated';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api, { logoutUser } from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { initializeNotifications }
    from "@/src/services/notifications/notificationService";


// ─── Theme ────────────────────────────────────────────────────────────────────
const colors = {
    bg: '#060609',
    surface: '#0C0C16',
    card: '#10101E',
    cardHigh: '#141426',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDim: 'rgba(139,92,246,0.18)',
    primaryGlow: 'rgba(139,92,246,0.32)',
    primaryBorder: 'rgba(139,92,246,0.22)',
    accent: '#22D3EE',
    accentGlow: 'rgba(34,211,238,0.28)',
    gold: '#F59E0B',
    goldGlow: 'rgba(245,158,11,0.28)',
    success: '#10B981',
    danger: '#EF4444',
    dangerDim: 'rgba(239,68,68,0.12)',
    text: '#EEEEFF',
    textSub: '#8888AA',
    textMuted: '#44445A',
    border: 'rgba(255,255,255,0.055)',
    borderMid: 'rgba(255,255,255,0.1)',
    white: '#FFFFFF',
};

const { width: W, height: H } = Dimensions.get('window');
const MODAL_H = H * 0.92;

// ─── Types ────────────────────────────────────────────────────────────────────
type Gender = 'male' | 'female';
type Goal =
    | "aggressive_cut"
    | "lose_fat"
    | "maintain"
    | "lean_bulk";
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

interface Profile {
    username: string;
    age: string;
    height: string;
    weight: string;
    gender: Gender;
    goal: Goal;
    activity: Activity;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
    { id: 'consistency', label: 'Consistency', emoji: '🔥', color: '#F97316', glow: 'rgba(249,115,22,0.55)', unlocked: true },
    { id: 'nutrition', label: 'Nutrition\nMaster', emoji: '🥗', color: '#10B981', glow: 'rgba(16,185,129,0.55)', unlocked: true },
    { id: 'hydration', label: 'Hydration\nHero', emoji: '💧', color: '#22D3EE', glow: 'rgba(34,211,238,0.55)', unlocked: true },
    { id: 'protein', label: 'Protein\nKing', emoji: '💪', color: '#8B5CF6', glow: 'rgba(139,92,246,0.55)', unlocked: true },
    { id: 'macro', label: 'Macro\nExpert', emoji: '⚡', color: '#F59E0B', glow: 'rgba(245,158,11,0.45)', unlocked: false },
    { id: 'crusher', label: 'Goal\nCrusher', emoji: '🎯', color: '#EC4899', glow: 'rgba(236,72,153,0.45)', unlocked: false },
];

const GOALS: { key: Goal; label: string; icon: string }[] = [
    {
        key: "aggressive_cut",
        label: "Aggressive Cut",
        icon: "⚡",
    },
    {
        key: "lose_fat",
        label: "Fat Loss",
        icon: "🔥",
    },
    {
        key: "maintain",
        label: "Maintain Weight",
        icon: "⚖️",
    },
    {
        key: "lean_bulk",
        label: "Lean Bulk",
        icon: "🚀",
    },
];

const ACTIVITIES: { key: Activity; label: string }[] = [
    { key: 'sedentary', label: 'Sedentary' },
    { key: 'light', label: 'Light' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'active', label: 'Active' },
    { key: 'athlete', label: 'Athlete' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeNutrition(p: Profile) {
    const w = Number(p.weight) || 75;
    const multiplier =
        p.activity === 'athlete' ? 1.9 :
            p.activity === 'active' ? 1.725 :
                p.activity === 'moderate' ? 1.55 :
                    p.activity === 'light' ? 1.375 : 1.2;
    const bmr = 10 * w + 6.25 * (Number(p.height) || 175) - 5 * (Number(p.age) || 25) + 5;
    const calories = Math.round(bmr * multiplier);
    return {
        calories,
        protein: Math.round(w * 2.0),
        carbs: Math.round((calories * 0.45) / 4),
        fat: Math.round((calories * 0.25) / 9),
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Ambient background blobs
const AmbientBg = () => (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={[s.blob, { top: -80, left: -60, backgroundColor: 'rgba(139,92,246,0.13)', width: 340, height: 340 }]} />
        <View style={[s.blob, { top: 320, right: -90, backgroundColor: 'rgba(34,211,238,0.07)', width: 260, height: 260 }]} />
        <View style={[s.blob, { bottom: 220, left: -70, backgroundColor: 'rgba(236,72,153,0.06)', width: 280, height: 280 }]} />
    </View>
);

// Glass pill divider
const Divider = () => <View style={s.divider} />;

// Achievement crystal
const Crystal = React.memo(({
    item, selected, onPress, index,
}: {
    item: typeof ACHIEVEMENTS[0];
    selected: boolean;
    onPress: () => void;
    index: number;
}) => (
    <MotiView
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: item.unlocked ? 1 : 0.38, translateY: 0 }}
        transition={{ delay: index * 70 + 400, type: 'timing', duration: 480 }}
    >
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <MotiView
                animate={{ scale: selected ? 1.07 : 1 }}
                transition={{ type: 'spring', stiffness: 280 }}
                style={s.crystalWrap}
            >
                {selected && (
                    <MotiView
                        from={{ opacity: 0.3, scale: 0.85 }}
                        animate={{ opacity: 0.9, scale: 1.25 }}
                        transition={{ loop: true, type: 'timing', duration: 1300 }}
                        style={[s.crystalGlowRing, { backgroundColor: item.glow }]}
                    />
                )}
                <LinearGradient
                    colors={selected
                        ? ([item.color + 'BB', item.color + '44'] as any)
                        : (['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)'] as any)
                    }
                    style={[s.crystalBody, selected && { borderColor: item.color + '88' }]}
                >
                    <Text style={s.crystalEmoji}>{item.emoji}</Text>
                </LinearGradient>
                <Text style={[s.crystalLabel, selected && { color: item.color }]}>{item.label}</Text>
            </MotiView>
        </TouchableOpacity>
    </MotiView>
));

// Stat card
const StatCard = ({
    icon, value, valueColor, label, progress, progressColor, delay,
}: {
    icon: string; value: number; valueColor: string; label: string;
    progress: number; progressColor: string; delay: number;
}) => (
    <MotiView
        from={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: 'spring', stiffness: 180 }}
        style={s.statCard}
    >
        <LinearGradient colors={['rgba(20,20,38,0.98)', 'rgba(10,10,22,0.99)']} style={s.statGradient}>
            <Text style={s.statIcon}>{icon}</Text>
            <Text style={[s.statValue, { color: valueColor }]}>{value}</Text>
            <Text style={[s.statLabel, { color: valueColor }]}>{label}</Text>
            <View style={s.statTrack}>
                <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: delay + 280, type: 'timing', duration: 900 }}
                    style={[s.statFill, { backgroundColor: progressColor }]}
                />
            </View>
        </LinearGradient>
    </MotiView>
);

// Nutrition card
const NutCard = ({ value, unit, label, color, delay }: {
    value: number; unit: string; label: string; color: string; delay: number;
}) => (
    <MotiView
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay, type: 'timing', duration: 460 }}
        style={s.nutCard}
    >
        <LinearGradient colors={[color + '1E', color + '08'] as any} style={s.nutCardInner}>
            <Text style={[s.nutValue, { color }]}>
                {value}<Text style={s.nutUnit}>{unit}</Text>
            </Text>
            <Text style={s.nutLabel}>{label}</Text>
            <View style={[s.nutBar, { backgroundColor: color }]} />
        </LinearGradient>
    </MotiView>
);

// Field row inside modal
const Field = ({
    label, value, onChangeText, keyboardType = 'default',
}: {
    label: string; value: string; onChangeText: (t: string) => void; keyboardType?: any;
}) => (
    <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={s.fieldInput}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
        />
        <View style={s.fieldUnderline} />
    </View>
);

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
const EditModal = ({
    visible, draft, setDraft, onSave, onClose,
}: {
    visible: boolean;
    draft: Profile;
    setDraft: React.Dispatch<React.SetStateAction<Profile>>;
    onSave: () => void;
    onClose: () => void;
}) => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1600));
        setSaving(false);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onSave();
        }, 900);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <AnimatePresence>
                {visible && (
                    <>
                        {/* Backdrop */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 300 }}
                            style={s.backdrop}
                        >
                            <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
                        </MotiView>

                        {/* Sheet */}
                        <MotiView
                            from={{ translateY: MODAL_H, opacity: 0, scale: 0.96 }}
                            animate={{ translateY: 0, opacity: 1, scale: 1 }}
                            exit={{ translateY: MODAL_H, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                            style={s.modalSheet}
                        >
                            <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(16,16,30,0.98)', 'rgba(10,10,20,0.99)']}
                                style={StyleSheet.absoluteFillObject}
                            />

                            {/* Handle */}
                            <View style={s.modalHandle} />

                            {/* Header */}
                            <View style={s.modalHeader}>
                                <Text style={s.modalTitle}>Edit Profile</Text>
                                <TouchableOpacity onPress={onClose} style={s.modalClose}>
                                    <Feather name="x" size={18} color={colors.textSub} />
                                </TouchableOpacity>
                            </View>

                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={{ flex: 1 }}
                            >
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
                                >
                                    {/* Identity fields */}
                                    <View style={s.modalSection}>
                                        <Text style={s.modalSectionLabel}>Identity</Text>
                                        <View style={s.glassGroup}>
                                            <Field label="Username" value={draft.username} onChangeText={(t) => setDraft((p) => ({ ...p, username: t }))} />
                                            <Divider />
                                            <View style={s.rowHalf}>
                                                <View style={{ flex: 1 }}>
                                                    <Field label="Age" value={draft.age} onChangeText={(t) => setDraft((p) => ({ ...p, age: t }))} keyboardType="numeric" />
                                                </View>
                                                <View style={{ width: 16 }} />
                                                <View style={{ flex: 1 }}>
                                                    <Field label="Height (cm)" value={draft.height} onChangeText={(t) => setDraft((p) => ({ ...p, height: t }))} keyboardType="numeric" />
                                                </View>
                                            </View>
                                            <Divider />
                                            <Field label="Weight (kg)" value={draft.weight} onChangeText={(t) => setDraft((p) => ({ ...p, weight: t }))} keyboardType="numeric" />
                                        </View>
                                    </View>

                                    {/* Gender */}
                                    <View style={s.modalSection}>
                                        <Text style={s.modalSectionLabel}>Gender</Text>
                                        <View style={s.genderRow}>
                                            {(['male', 'female'] as Gender[]).map((g) => {
                                                const active = draft.gender === g;
                                                return (
                                                    <TouchableOpacity key={g} onPress={() => setDraft((p) => ({ ...p, gender: g }))} activeOpacity={0.8} style={{ flex: 1 }}>
                                                        <MotiView
                                                            animate={{
                                                                borderColor: active ? colors.primary : colors.border,
                                                                backgroundColor: active ? colors.primaryDim : 'rgba(255,255,255,0.025)',
                                                            }}
                                                            transition={{ type: 'timing', duration: 230 }}
                                                            style={[s.genderCard, g === 'female' && { marginLeft: 12 }]}
                                                        >
                                                            <Text style={[s.genderSymbol, active && { color: colors.primaryLight }]}>
                                                                {g === 'male' ? '♂' : '♀'}
                                                            </Text>
                                                            <Text style={[s.genderText, active && { color: colors.primaryLight }]}>
                                                                {g === 'male' ? 'Male' : 'Female'}
                                                            </Text>
                                                            {active && <View style={s.genderDot} />}
                                                        </MotiView>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Goal */}
                                    <View style={s.modalSection}>
                                        <Text style={s.modalSectionLabel}>Primary Goal</Text>
                                        <View style={s.goalGrid}>
                                            {GOALS.map(({ key, label, icon }) => {
                                                const active = draft.goal === key;
                                                return (
                                                    <TouchableOpacity key={key} onPress={() => setDraft((p) => ({ ...p, goal: key }))} activeOpacity={0.8} style={s.goalCell}>
                                                        <MotiView animate={{ scale: active ? 1.03 : 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                                            {active ? (
                                                                <LinearGradient
                                                                    colors={['#A855F7', '#8B5CF6', '#6D28D9']}
                                                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                                                    style={[s.goalPill, s.goalPillActive]}
                                                                >
                                                                    <Text style={s.goalIcon}>{icon}</Text>
                                                                    <Text style={[s.goalText, { color: colors.white, fontWeight: '700' }]}>{label}</Text>
                                                                </LinearGradient>
                                                            ) : (
                                                                <View style={s.goalPill}>
                                                                    <Text style={s.goalIcon}>{icon}</Text>
                                                                    <Text style={s.goalText}>{label}</Text>
                                                                </View>
                                                            )}
                                                        </MotiView>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>


                                    {/* Save button */}
                                    <TouchableOpacity onPress={handleSave} activeOpacity={0.85} disabled={saving || saved} style={{ marginTop: 8 }}>
                                        <MotiView
                                            animate={{ scale: saving ? 0.97 : 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <LinearGradient
                                                colors={saved
                                                    ? (['#10B981', '#059669'] as any)
                                                    : (['#A855F7', '#8B5CF6', '#6D28D9'] as any)
                                                }
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                style={s.saveBtn}
                                            >
                                                {saving ? (
                                                    <MotiView
                                                        from={{ rotate: '0deg' }}
                                                        animate={{ rotate: '360deg' }}
                                                        transition={{ loop: true, type: 'timing', duration: 850 }}
                                                    >
                                                        <Feather name="loader" size={20} color={colors.white} />
                                                    </MotiView>
                                                ) : saved ? (
                                                    <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} style={s.saveBtnContent}>
                                                        <Feather name="check" size={20} color={colors.white} />
                                                        <Text style={s.saveBtnText}>Saved!</Text>
                                                    </MotiView>
                                                ) : (
                                                    <View style={s.saveBtnContent}>
                                                        <Feather name="save" size={18} color={colors.white} />
                                                        <Text style={s.saveBtnText}>Save Changes</Text>
                                                    </View>
                                                )}
                                            </LinearGradient>
                                        </MotiView>
                                    </TouchableOpacity>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </MotiView>
                    </>
                )}
            </AnimatePresence>
        </Modal>
    );
};

// ─── CONTEXT MENU ─────────────────────────────────────────────────────────────
const ContextMenu = ({
    visible, insetTop, onClose, onAbout, onSignOut, onDeleteAccount,
}: {
    visible: boolean;
    insetTop: number;
    onClose: () => void;
    onAbout: () => void;
    onSignOut: () => void;
    onDeleteAccount: () => void;
}) => {
    const menuItems = [
        { icon: '👤', label: 'About', sublabel: 'Version 2.4.1', onPress: onAbout, danger: false },
        { icon: '🚪', label: 'Sign Out', sublabel: 'End your session', onPress: onSignOut, danger: false },
        { icon: '🗑', label: 'Delete Account', sublabel: 'Permanent action', onPress: onDeleteAccount, danger: true },
    ];

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <AnimatePresence>
                {visible && (
                    <>
                        {/* Soft backdrop — tap to dismiss */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 200 }}
                            style={s.ctxBackdrop}
                        >
                            <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
                        </MotiView>

                        {/* Menu panel — springs from top-right */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.78, translateY: -12 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.82, translateY: -8 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                            style={[s.ctxPanel, { top: insetTop + 56 }]}
                        >
                            {/* Glass base */}
                            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(18,18,34,0.96)', 'rgba(12,12,24,0.98)']}
                                style={StyleSheet.absoluteFillObject}
                            />

                            {/* Arrow tip */}
                            <View style={s.ctxArrow} />

                            {/* Header label */}
                            <View style={s.ctxHeader}>
                                <Text style={s.ctxHeaderText}>Settings</Text>
                            </View>

                            {menuItems.map((item, i) => (
                                <React.Fragment key={item.label}>
                                    {i > 0 && <View style={s.ctxDivider} />}
                                    <TouchableOpacity
                                        onPress={item.onPress}
                                        activeOpacity={0.72}
                                        style={s.ctxItem}
                                    >
                                        <MotiView
                                            from={{ opacity: 0, translateX: 8 }}
                                            animate={{ opacity: 1, translateX: 0 }}
                                            transition={{ delay: i * 55 + 60, type: 'timing', duration: 280 }}
                                            style={s.ctxItemInner}
                                        >
                                            <View style={[s.ctxIconBox, item.danger && s.ctxIconBoxDanger]}>
                                                <Text style={s.ctxItemEmoji}>{item.icon}</Text>
                                            </View>
                                            <View style={s.ctxItemText}>
                                                <Text style={[s.ctxLabel, item.danger && { color: colors.danger }]}>
                                                    {item.label}
                                                </Text>
                                                <Text style={s.ctxSublabel}>{item.sublabel}</Text>
                                            </View>
                                            <Feather
                                                name="chevron-right"
                                                size={14}
                                                color={item.danger ? colors.danger : colors.textMuted}
                                                style={{ opacity: 0.7 }}
                                            />
                                        </MotiView>
                                    </TouchableOpacity>
                                </React.Fragment>
                            ))}
                        </MotiView>
                    </>
                )}
            </AnimatePresence>
        </Modal>
    );
};

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({
    visible, onClose, onConfirm,
}: {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) => {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        setDeleting(true);
        await new Promise((r) => setTimeout(r, 1400));
        setDeleting(false);
        onConfirm();
    };

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <AnimatePresence>
                {visible && (
                    <>
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'timing', duration: 260 }}
                            style={s.ctxBackdrop}
                        >
                            <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, scale: 0.88, translateY: 24 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, translateY: 16 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                            style={s.delModal}
                        >
                            <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFillObject} />
                            <LinearGradient
                                colors={['rgba(20,20,36,0.98)', 'rgba(12,12,22,0.99)']}
                                style={StyleSheet.absoluteFillObject}
                            />

                            {/* Icon */}
                            <MotiView
                                from={{ scale: 0, rotate: '-20deg' }}
                                animate={{ scale: 1, rotate: '0deg' }}
                                transition={{ type: 'spring', stiffness: 260, delay: 80 }}
                                style={s.delIconWrap}
                            >
                                <LinearGradient colors={['rgba(239,68,68,0.22)', 'rgba(239,68,68,0.08)']} style={s.delIconCircle}>
                                    <Text style={{ fontSize: 28 }}>🗑</Text>
                                </LinearGradient>
                            </MotiView>

                            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 140, type: 'timing', duration: 300 }}>
                                <Text style={s.delTitle}>Delete Account?</Text>
                                <Text style={s.delBody}>
                                    This will permanently erase all your data, progress, and achievements. This action{' '}
                                    <Text style={{ color: colors.danger, fontWeight: '700' }}>cannot be undone</Text>.
                                </Text>
                            </MotiView>

                            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 220, type: 'timing', duration: 300 }} style={s.delActions}>
                                {/* Cancel */}
                                <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.delCancelBtn}>
                                    <Text style={s.delCancelText}>Cancel</Text>
                                </TouchableOpacity>

                                {/* Confirm delete */}
                                <TouchableOpacity onPress={handleConfirm} activeOpacity={0.82} disabled={deleting} style={{ flex: 1 }}>
                                    <LinearGradient colors={['#EF4444', '#B91C1C']} style={s.delConfirmBtn}>
                                        {deleting ? (
                                            <MotiView
                                                from={{ rotate: '0deg' }}
                                                animate={{ rotate: '360deg' }}
                                                transition={{ loop: true, type: 'timing', duration: 800 }}
                                            >
                                                <Feather name="loader" size={18} color={colors.white} />
                                            </MotiView>
                                        ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                                                <Feather name="trash-2" size={16} color={colors.white} />
                                                <Text style={s.delConfirmText}>Delete Account</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </MotiView>
                        </MotiView>
                    </>
                )}
            </AnimatePresence>
        </Modal>
    );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {

    const [profileImage,
        setProfileImage
    ] = useState<string | null>(
        null
    );



    useEffect(() => { loadProfile(); }, []);
    const loadProfile = async () => {

        const token =
            await AsyncStorage.getItem(
                "@auth_access_token"
            );

        console.log(
            "PROFILE TOKEN:",
            token
        );

        console.log(
            "AUTH HEADER:",
            api.defaults.headers.common[
            "Authorization"
            ]
        );

        try {


            const response =
                await api.get(
                    "/users/profile/"
                );

            setCurrentStreak(
                response.data.streak.current
            );

            setLongestStreak(
                response.data.streak.longest
            );
            const data =
                response.data;


            setProfileImage(
                data.profile_image
            );

            const backendGoal = data.profile.goal;

            let mappedGoal: Goal = "maintain";

            if (backendGoal === "aggressive_cut") {
                mappedGoal = "aggressive_cut";
            }

            if (backendGoal === "lose_fat") {
                mappedGoal = "lose_fat";
            }

            if (backendGoal === "maintain") {
                mappedGoal = "maintain";
            }

            if (backendGoal === "lean_bulk") {
                mappedGoal = "lean_bulk";
            }
            setProfile({
                username:
                    data.user.username,

                age:
                    String(
                        data.profile.age
                    ),

                height:
                    String(
                        data.profile.height
                    ),

                weight:
                    String(
                        data.profile.weight
                    ),

                gender:
                    data.profile.gender
                        .toLowerCase(),

                goal:
                    mappedGoal,

                activity:
                    data.profile.activity_level,
            });




            console.log(
                "PROFILE:",
                response.data
            );

        } catch (error) {

            console.log(
                "PROFILE ERROR:",
                error
            );
        }
    };
    const insets = useSafeAreaInsets();
    //Profile image update
    const openAvatarMenu = () => {

        const pickImage = async () => {

            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {

                Alert.alert(
                    "Permission Required",
                    "Gallery access is required."
                );

                return;
            }
            const uploadProfileImage =
                async (uri: string) => {

                    try {

                        const formData =
                            new FormData();

                        formData.append(
                            "image",
                            {
                                uri,
                                type: "image/jpeg",
                                name: "avatar.jpg",
                            } as any
                        );

                        const response =
                            await api.post(
                                "/users/profile/image/",
                                formData,
                                {
                                    headers: {
                                        "Content-Type":
                                            "multipart/form-data",
                                    },
                                }
                            );

                        console.log(
                            "UPLOAD SUCCESS:",
                            response.data
                        );

                        await loadProfile();

                    } catch (error) {

                        console.log(
                            "UPLOAD ERROR:",
                            error
                        );
                    }
                };
            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes:
                        ImagePicker.MediaTypeOptions.Images,

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.8,
                });

            if (result.canceled)
                return;

            console.log(
                "SELECTED IMAGE:",
                result.assets[0].uri
            );
            await uploadProfileImage(
                result.assets[0].uri
            );
        };
        Alert.alert(
            "Profile Photo",
            "Choose an option",
            [
                {
                    text: "Take Photo",
                    onPress: () => {
                        console.log("CAMERA");
                    },
                },

                {
                    text: "Choose From Gallery",
                    onPress: pickImage,
                },

                {
                    text: "Remove Photo",
                    style: "destructive",
                    onPress: () => {
                        console.log("REMOVE");
                    },
                },

                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );

    };

    const [profile, setProfile] =
        useState<Profile>({
            username: "",
            age: "",
            height: "",
            weight: "",
            gender: "male",
            goal: "maintain",
            activity: "sedentary",
        });

    const [currentStreak, setCurrentStreak] = useState(0);

    const [longestStreak, setLongestStreak] = useState(0);
    const [draft, setDraft] = useState<Profile>(profile);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState('consistency');

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });

    const heroStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 120], [1, 0.65], 'clamp'),
        transform: [{ scale: interpolate(scrollY.value, [0, 120], [1, 0.88], 'clamp') }],
    }));

    const openEdit = useCallback(() => {
        setDraft(profile);
        setModalOpen(true);
    }, [profile]);

    const [saving, setSaving] =
        useState(false);

    const handleSave =
        useCallback(async () => {

            try {

                setSaving(true);

                let backendGoal = "maintain";

                if (draft.goal === "aggressive_cut") {
                    backendGoal = "aggressive_cut";
                }

                if (draft.goal === "lose_fat") {
                    backendGoal = "lose_fat";
                }

                if (draft.goal === "maintain") {
                    backendGoal = "maintain";
                }

                if (draft.goal === "lean_bulk") {
                    backendGoal = "lean_bulk";
                }

                const response =
                    await api.put(
                        "/users/profile/update/",
                        {

                            username:
                                draft.username,

                            age:
                                Number(
                                    draft.age
                                ),

                            gender:
                                draft.gender,

                            height:
                                Number(
                                    draft.height
                                ),

                            weight:
                                Number(
                                    draft.weight
                                ),

                            goal:
                                backendGoal,

                            activity_level:
                                draft.activity,
                        }
                    );

                console.log(
                    "PROFILE UPDATED:",
                    response.data
                );

                setProfile(
                    draft
                );

                setModalOpen(
                    false
                );

                Alert.alert(
                    "Profile Updated",
                    "Changes saved successfully."
                );

                await loadProfile();

            } catch (error) {

                console.log(
                    "UPDATE ERROR:",
                    error
                );

                Alert.alert(
                    "Update Failed",
                    "Please try again."
                );

            } finally {

                setSaving(false);
            }

        }, [draft]);

    const nut = computeNutrition(profile);

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <AmbientBg />

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            >
                {/* ── HERO ─────────────────────────────── */}
                <View style={[s.hero, { paddingTop: insets.top + 16 }]}>
                    {/* Top row */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 500 }}
                        style={s.topRow}
                    >
                        <View style={s.brandRow}>
                            <Text style={s.brandWord}>netrilens</Text>
                            <View style={s.brandAccent} />
                        </View>
                        <TouchableOpacity style={s.settingsBtn} onPress={() => setMenuOpen(true)}>
                            <BlurView intensity={22} tint="dark" style={s.settingsBtnBlur}>
                                <Feather name="settings" size={17} color={colors.textSub} />
                            </BlurView>
                        </TouchableOpacity>
                    </MotiView>


                    {/* Avatar + identity */}

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={openAvatarMenu}
                    >
                        <Animated.View
                            style={[
                                s.avatarBlock,
                                heroStyle
                            ]}
                        >
                            {/* Pulse Ring 1 */}

                            <MotiView
                                from={{
                                    scale: 1,
                                    opacity: 0.55
                                }}
                                animate={{
                                    scale: 1.38,
                                    opacity: 0
                                }}
                                transition={{
                                    loop: true,
                                    type: "timing",
                                    duration: 2100
                                }}
                                style={s.pulse1}
                            />

                            {/* Pulse Ring 2 */}

                            <MotiView
                                from={{
                                    scale: 1,
                                    opacity: 0.4
                                }}
                                animate={{
                                    scale: 1.22,
                                    opacity: 0
                                }}
                                transition={{
                                    loop: true,
                                    type: "timing",
                                    duration: 2100,
                                    delay: 500
                                }}
                                style={s.pulse2}
                            />

                            {/* Avatar */}

                            <LinearGradient
                                colors={[
                                    "rgba(139,92,246,0.6)",
                                    "rgba(109,40,217,0.3)"
                                ]}
                                style={s.avatarRing}
                            >
                                <LinearGradient
                                    colors={['#17172A', '#0D0D1C']}
                                    style={s.avatarInner}
                                >

                                    {profileImage ? (

                                        <Image
                                            source={{
                                                uri: profileImage
                                            }}
                                            style={s.avatarImage}
                                        />

                                    ) : (

                                        <Text
                                            style={s.avatarInitials}
                                        >
                                            {profile.username
                                                .split(" ")
                                                .map((w) => w[0])
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </Text>

                                    )}

                                </LinearGradient>
                            </LinearGradient>

                        </Animated.View>
                    </TouchableOpacity>

                    {/* Name + gender */}
                    <MotiView
                        from={{ opacity: 0, translateY: 14 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200, type: 'timing', duration: 480 }}
                        style={s.nameRow}
                    >
                        <Text style={s.username}>{profile.username}</Text>
                        <Text style={s.genderPill}>{profile.gender === 'male' ? ' ♂' : ' ♀'}</Text>
                    </MotiView>

                    {/* Level + top badge */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 340, type: 'spring', stiffness: 200 }}
                        style={s.badgeRow}
                    >
                        <LinearGradient colors={['rgba(245,158,11,0.22)', 'rgba(245,158,11,0.08)']} style={s.levelBadge}>
                            <Text style={s.levelText}>Level 12 Explorer</Text>
                        </LinearGradient>
                        <LinearGradient colors={[colors.primaryDim, 'rgba(139,92,246,0.08)']} style={s.topBadge}>
                            <Text style={s.topBadgeText}>🏆 Top 2%</Text>
                        </LinearGradient>
                    </MotiView>

                    {/* Edit Profile CTA */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 460, type: 'timing', duration: 460 }}
                        style={{ marginTop: 20 }}
                    >
                        <TouchableOpacity onPress={openEdit} activeOpacity={0.82}>
                            <MotiView
                                from={{ scale: 1 }}
                                animate={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <BlurView intensity={20} tint="dark" style={s.editBtn}>
                                    <LinearGradient
                                        colors={['rgba(139,92,246,0.2)', 'rgba(139,92,246,0.06)']}
                                        style={s.editBtnGradient}
                                    >
                                        <Feather name="edit-2" size={13} color={colors.primaryLight} />
                                        <Text style={s.editBtnText}>Edit Profile</Text>
                                    </LinearGradient>
                                </BlurView>
                            </MotiView>
                        </TouchableOpacity>
                    </MotiView>
                </View>

                {/* ── ACHIEVEMENTS ──────────────────────── */}
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 380, type: 'timing', duration: 600 }} style={s.section}>
                    <Text style={s.sectionTitle}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.crystalRow}>
                        {ACHIEVEMENTS.map((item, i) => (
                            <Crystal
                                key={item.id}
                                item={item}
                                selected={selectedAchievement === item.id}
                                onPress={() => setSelectedAchievement(item.id)}
                                index={i}
                            />
                        ))}
                    </ScrollView>
                </MotiView>

                {/* ── PERFORMANCE ───────────────────────── */}
                <View style={[s.section, { flexDirection: 'row', gap: 14 }]}>
                    <StatCard icon="🔥" value={currentStreak} valueColor={colors.gold} label="DAY STREAK" progress={Math.min(currentStreak, 100)} progressColor={colors.gold} delay={500} />
                    <StatCard icon="🎯" value={92} valueColor={colors.accent} label="NUTRITION SCORE" progress={92} progressColor={colors.accent} delay={620} />
                </View>

                {/* ── AI NUTRITION TARGETS ──────────────── */}
                <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 660, type: 'timing', duration: 520 }} style={s.section}>
                    <View style={s.sectionTitleRow}>
                        <Text style={s.sectionTitle}>AI Nutrition Targets</Text>
                        <View style={s.aiBadge}><Text style={s.aiBadgeText}>✦ AI</Text></View>
                    </View>
                    <View style={s.nutGrid}>
                        <NutCard value={nut.calories} unit="" label="Calories" color="#F97316" delay={700} />
                        <NutCard value={nut.protein} unit="g" label="Protein" color={colors.primary} delay={760} />
                        <NutCard value={nut.carbs} unit="g" label="Carbs" color={colors.accent} delay={820} />
                        <NutCard value={nut.fat} unit="g" label="Fat" color={colors.gold} delay={880} />
                    </View>
                </MotiView>



                {/* Footer */}
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1000, type: 'timing', duration: 600 }} style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, letterSpacing: 0.4 }}>Netrilens AI · v2.4.1</Text>
                </MotiView>
            </Animated.ScrollView>

            {/* ── EDIT MODAL ────────────────────────── */}
            <EditModal
                visible={modalOpen}
                draft={draft}
                setDraft={setDraft}
                onSave={handleSave}
                onClose={() => setModalOpen(false)}
            />

            {/* ── CONTEXT MENU ──────────────────────── */}
            <ContextMenu
                visible={menuOpen}
                insetTop={insets.top}
                onClose={() => setMenuOpen(false)}
                onAbout={() => {
                    setMenuOpen(false);
                    Alert.alert('Netrilens AI', 'Version 2.4.1\nBuilt with ♥ for your health journey.');
                }}
                onSignOut={() => {
                    setMenuOpen(false);
                    Alert.alert('Sign Out', 'You will be returned to the login screen.', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Sign Out', style: 'destructive', onPress: async () => {
                                await logoutUser();

                                router.replace(
                                    '/onboarding/welcome'
                                );
                            }
                        },
                    ]);
                }}
                onDeleteAccount={() => {
                    setMenuOpen(false);
                    setTimeout(() => setDeleteConfirmOpen(true), 220);
                }}
            />

            {/* ── DELETE CONFIRM MODAL ──────────────── */}
            <DeleteConfirmModal
                visible={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={() => {
                    setDeleteConfirmOpen(false);
                }}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },

    // Ambient
    blob: { position: 'absolute', borderRadius: 999 },

    // Hero
    hero: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 32 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 32 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    brandWord: { fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: 0.4 },
    brandAccent: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 2 },
    settingsBtn: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    settingsBtnBlur: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Avatar
    avatarImage: { width: "100%", height: "100%", borderRadius: 999, },
    avatarBlock: { alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    pulse1: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryGlow },
    pulse2: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryGlow },
    avatarRing: { width: 92, height: 92, borderRadius: 46, padding: 2.5, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 22, elevation: 20 },
    avatarInner: { flex: 1, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { fontSize: 30, fontWeight: '700', color: colors.primaryLight, letterSpacing: 1 },

    nameRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
    username: { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: 0.2 },
    genderPill: { fontSize: 16, fontWeight: '600', color: colors.primaryLight },

    badgeRow: { flexDirection: 'row', gap: 10 },
    levelBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(245,158,11,0.28)' },
    levelText: { fontSize: 12, fontWeight: '600', color: colors.gold },
    topBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 30, borderWidth: 1, borderColor: colors.primaryBorder },
    topBadgeText: { fontSize: 12, fontWeight: '600', color: colors.primaryLight },

    // Edit button
    editBtn: { borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: colors.primaryBorder },
    editBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, paddingVertical: 11 },
    editBtnText: { fontSize: 14, fontWeight: '600', color: colors.primaryLight, letterSpacing: 0.2 },

    // Sections
    section: { paddingHorizontal: 20, marginBottom: 26 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textSub, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 14 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    aiBadge: { backgroundColor: colors.primaryDim, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryBorder },
    aiBadgeText: { fontSize: 10, color: colors.primaryLight, fontWeight: '700', letterSpacing: 0.4 },

    // Crystal
    crystalRow: { paddingRight: 20, gap: 14 },
    crystalWrap: { alignItems: 'center', width: 70 },
    crystalGlowRing: { position: 'absolute', width: 58, height: 58, borderRadius: 29, top: 4 },
    crystalBody: { width: 60, height: 68, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    crystalEmoji: { fontSize: 26 },
    crystalLabel: { fontSize: 9, color: colors.textSub, textAlign: 'center', fontWeight: '600', letterSpacing: 0.2, lineHeight: 13 },

    // Stat card
    statCard: { flex: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 8 },
    statGradient: { padding: 16, alignItems: 'center' },
    statIcon: { fontSize: 28, marginBottom: 4 },
    statValue: { fontSize: 44, fontWeight: '800', letterSpacing: -1.5, lineHeight: 50 },
    statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2, marginBottom: 12 },
    statTrack: { width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
    statFill: { height: '100%', borderRadius: 2 },

    // Nutrition card
    nutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    nutCard: { width: (W - 20 * 2 - 12) / 2 },
    nutCardInner: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, overflow: 'hidden' },
    nutValue: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, lineHeight: 36 },
    nutUnit: { fontSize: 16, fontWeight: '600' },
    nutLabel: { fontSize: 11, color: colors.textSub, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 4 },
    nutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, opacity: 0.75 },

    // Danger zone
    dangerCard: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.16)', overflow: 'hidden' },
    dangerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    dangerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    dangerIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.dangerDim, alignItems: 'center', justifyContent: 'center' },
    dangerTitle: { fontSize: 15, color: colors.text, fontWeight: '600' },
    dangerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    dangerDivider: { height: 1, backgroundColor: 'rgba(239,68,68,0.09)', marginHorizontal: 16 },

    // Modal
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
    modalSheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: MODAL_H,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        borderTopWidth: 1,
        borderColor: colors.primaryBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 30,
    },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginTop: 12 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 18 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, letterSpacing: 0.2 },
    modalClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },

    // Modal sections
    modalSection: { marginBottom: 24 },
    modalSectionLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 12 },
    glassGroup: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16 },
    rowHalf: { flexDirection: 'row' },

    // Field
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },
    fieldWrap: { marginBottom: 4 },
    fieldLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
    fieldInput: { fontSize: 16, color: colors.text, fontWeight: '500', paddingVertical: 4 },
    fieldUnderline: { height: 1, backgroundColor: colors.primaryBorder, marginTop: 4 },

    // Gender selector
    genderRow: { flexDirection: 'row' },
    genderCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 82 },
    genderSymbol: { fontSize: 28, color: colors.textSub, fontWeight: '600' },
    genderText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },
    genderDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary },

    // Goal
    goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    goalCell: { width: (W - 24 * 2 - 10) / 2 },
    goalPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' },
    goalPillActive: { borderColor: 'transparent', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
    goalIcon: { fontSize: 18 },
    goalText: { fontSize: 13, color: colors.textSub, fontWeight: '600' },

    // Activity
    actRow: { flexDirection: 'row', gap: 4 },
    actChip: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    actText: { fontSize: 10, color: colors.textMuted, fontWeight: '600', letterSpacing: 0.2 },

    // Save
    saveBtn: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
    saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white, letterSpacing: 0.2 },

    // ─── Context Menu ──────────────────────────────────────────────
    ctxBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.38)',
    },
    ctxPanel: {
        position: 'absolute',
        right: 20,
        width: 240,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.18)',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 30,
        // transform origin approximated via translateX
    },
    ctxArrow: {
        position: 'absolute',
        top: -7,
        right: 17,
        width: 14,
        height: 14,
        borderRadius: 3,
        backgroundColor: 'rgba(18,18,34,0.97)',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(139,92,246,0.18)',
        transform: [{ rotate: '45deg' }],
        zIndex: 2,
    },
    ctxHeader: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    ctxHeaderText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    ctxItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    ctxItemInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ctxIconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.07)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctxIconBoxDanger: {
        backgroundColor: 'rgba(239,68,68,0.14)',
    },
    ctxItemEmoji: {
        fontSize: 16,
    },
    ctxItemText: {
        flex: 1,
    },
    ctxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        letterSpacing: 0.1,
    },
    ctxSublabel: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 1,
        letterSpacing: 0.1,
    },
    ctxDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.045)',
        marginHorizontal: 14,
    },

    // ─── Delete Confirm Modal ──────────────────────────────────────
    delModal: {
        position: 'absolute',
        left: 24,
        right: 24,
        top: '50%',
        marginTop: -160,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.22)',
        padding: 24,
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 30,
    },
    delIconWrap: {
        alignSelf: 'center',
        marginBottom: 18,
    },
    delIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.2)',
    },
    delTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    delBody: {
        fontSize: 14,
        color: colors.textSub,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    delActions: {
        flexDirection: 'row',
        gap: 12,
    },
    delCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    delCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSub,
    },
    delConfirmBtn: {
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
    },
    delConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.white,
    },
});