import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import ProgressCard from "../../components/Mealplanner/ProgressCard";
import MealCard from "../../components/Mealplanner/MealCard";
import WeeklyPlanner from "../../components/Mealplanner/WeeklyPlanner";
import ChecklistCard from "../../components/Mealplanner/ChecklistCard";
import BottomMealSheet from "../../components/Mealplanner/BottomMealSheet";

import { useMealPlanner } from "../../hooks/useMealPlanner";

// ─── Glass card helper ──────────────────────────────────────────────────────
function GlassCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────
function SectionHead({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && <Text style={styles.sectionAction}>{action}</Text>}
    </View>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
function FloatingAddButton({ onPress }: { onPress: () => void }) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1200, easing: Easing.out(Easing.quad) }),
        withTiming(0.6, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        pressScale.value = withSpring(0.92, { damping: 10 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      onPressOut={() => {
        pressScale.value = withSpring(1, { damping: 12 });
      }}
      onPress={onPress}
      style={styles.fabWrapper}
    >
      <Animated.View style={[styles.fabPulse, pulseStyle]} />
      <Animated.View style={[styles.fab, fabStyle]}>
        <Text style={styles.fabPlus}>+</Text>
        <Text style={styles.fabLabel}>Build Meal</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────────────────────
function BottomNav({ activeIndex, onPress }: { activeIndex: number; onPress: (i: number) => void }) {
  const items = [
    { icon: '⌂', label: 'Home' },
    { icon: '📊', label: 'Analytics' },
    { icon: '🍽', label: 'Planner' },
    { icon: '◔', label: 'Profile' },
  ];

  return (
    <View style={styles.bottomNav}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.navInner}>
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            style={styles.navItem}
            onPress={() => {
              Haptics.selectionAsync();
              onPress(i);
            }}
          >
            {activeIndex === i && <View style={styles.navDot} />}
            <Text style={[styles.navIcon, activeIndex === i && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, activeIndex === i && styles.navLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(-20, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const toastStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toast, toastStyle]} pointerEvents="none">
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MealPlannerScreen() {
  const {
    meals,
    weekDays,
    selectedDayIndex,
    setSelectedDayIndex,
    progress,
    checklist,
    expandedMealId,
    selectedChips,
    checklistProgress,
    overallProgress,
    selectedMacros,
    toggleMealExpanded,
    completeMeal,
    deleteMeal,
    toggleChecklist,
    toggleChip,
    clearChips,
  } = useMealPlanner();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeNav, setActiveNav] = React.useState(2);
  const [toast, setToast] = React.useState({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Header wave animation
  const waveRotate = useSharedValue(0);
  useEffect(() => {
    waveRotate.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 300 }),
        withTiming(-8, { duration: 300 }),
        withTiming(14, { duration: 300 }),
        withTiming(0, { duration: 600 }),
        withDelay(1800, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${waveRotate.value}deg` }],
    display: 'inline' as any,
  }));

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2200);
  }, []);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSaveMeal = useCallback(() => {
    closeSheet();
    clearChips();
    setTimeout(() => showToast('✅ Meal saved to today'), 400);
  }, [closeSheet, clearChips, showToast]);

  // Confetti burst when all checklist done
  const prevComplete = useRef(checklistProgress.completed);
  useEffect(() => {
    if (
      checklistProgress.completed === checklistProgress.total &&
      prevComplete.current < checklistProgress.total
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('🎉 All habits complete today!');
    }
    prevComplete.current = checklistProgress.completed;
  }, [checklistProgress]);

  return (
    <View style={styles.root}>
      {/* Background gradients */}
      <LinearGradient
        colors={['rgba(108,124,255,0.10)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.greetRow}>
              <View style={styles.greet}>
                <Text style={styles.greetLine1}>
                  Good Morning, Faizal{' '}
                  <Animated.Text style={waveStyle}>👋</Animated.Text>
                </Text>
                <Text style={styles.greetSub}>Let's hit your targets today</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>F</Text>
              </View>
            </View>
            <View style={styles.planLabel}>
              <View style={styles.planDot} />
              <Text style={styles.planLabelText}>TODAY'S PLAN</Text>
            </View>
          </View>

          {/* ── Today's Progress Card ── */}
          <GlassCard style={styles.progressCardOuter}>
            <ProgressCard progress={progress} overallProgress={overallProgress} />
          </GlassCard>

          {/* ── Today's Meals ── */}
          <SectionHead title="Today's Meals" action="See all" />
          <View style={styles.mealsList}>
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isExpanded={expandedMealId === meal.id}
                onToggle={() => toggleMealExpanded(meal.id)}
                onComplete={() => {
                  completeMeal(meal.id);
                  showToast(`✅ ${meal.name} completed`);
                }}
                onDelete={() => {
                  deleteMeal(meal.id);
                  showToast(`🗑 ${meal.name} removed`);
                }}
              />
            ))}
          </View>

          <Text style={styles.swipeHint}>
            👈 Swipe right to complete · Swipe left to delete
          </Text>

          {/* ── Weekly Planner ── */}
          <SectionHead title="Weekly Planner" />
          <WeeklyPlanner
            weekDays={weekDays}
            selectedDayIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
          />

          {/* ── Daily Checklist ── */}
          <SectionHead title="Daily Checklist" />
          <GlassCard style={styles.mx20}>
            <ChecklistCard
              checklist={checklist}
              progress={checklistProgress}
              onToggle={toggleChecklist}
            />
          </GlassCard>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Floating Add Button ── */}
      <FloatingAddButton onPress={openSheet} />

      {/* ── Bottom Nav ── */}
      <SafeAreaView edges={['bottom']} style={styles.bottomNavSafeArea}>
        <BottomNav activeIndex={activeNav} onPress={setActiveNav} />
      </SafeAreaView>

      {/* ── Toast ── */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── Bottom Meal Sheet ── */}
      <BottomMealSheet
        bottomSheetRef={bottomSheetRef}
        selectedChips={selectedChips}
        selectedMacros={selectedMacros}
        onToggleChip={toggleChip}
        onSave={handleSaveMeal}
        onClose={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ── Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
  },
  greetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greet: {
    flex: 1,
  },
  greetLine1: {
    fontSize: 25,
    fontWeight: '800',
    color: '#F5F6FA',
    letterSpacing: -0.5,
  },
  greetSub: {
    marginTop: 4,
    fontSize: 13.5,
    color: '#6C7088',
    fontWeight: '500',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  planLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
  },
  planDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#5EEAD4',
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  planLabelText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#6C7088',
  },

  // ── Glass card
  glassCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 10,
  },
  progressCardOuter: {
    marginTop: 14,
  },
  mx20: {
    marginHorizontal: 20,
  },

  // ── Section head
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 14,
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#F5F6FA',
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // ── Meals
  mealsList: {
    paddingHorizontal: 20,
  },
  swipeHint: {
    fontSize: 10.5,
    color: '#454A5E',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // ── FAB
  fabWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 108 : 88,
    right: 22,
    zIndex: 40,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  fabPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.5)',
  },
  fabPlus: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  fabLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.1,
  },

  // ── Bottom Nav
  bottomNavSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 45,
  },
  bottomNav: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  navInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    position: 'relative',
  },
  navDot: {
    position: 'absolute',
    top: -3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  navIcon: {
    fontSize: 18,
    color: '#6C7088',
  },
  navIconActive: {
    color: '#8B5CF6',
  },
  navLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#6C7088',
  },
  navLabelActive: {
    color: '#F5F6FA',
  },

  // ── Toast
  toast: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    zIndex: 200,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: 'rgba(20,18,32,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5F6FA',
  },
});
