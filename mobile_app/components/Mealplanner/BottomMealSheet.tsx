import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import FoodChip from './FoodChip';
import { FOOD_CHIPS } from '../../hooks/useMealPlanner';
import { MacroNutrients } from "../../types/meal";

interface LiveNutriProps {
  macros: MacroNutrients;
}

function LiveNutriCounter({ macros }: LiveNutriProps) {
  const prevMacros = useRef(macros);
  const scaleKcal = useSharedValue(1);
  const scaleP = useSharedValue(1);
  const scaleC = useSharedValue(1);
  const scaleF = useSharedValue(1);

  useEffect(() => {
    const bump = (sv: typeof scaleKcal) => {
      sv.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12 })
      );
    };
    if (macros.calories !== prevMacros.current.calories) bump(scaleKcal);
    if (macros.protein !== prevMacros.current.protein) bump(scaleP);
    if (macros.carbs !== prevMacros.current.carbs) bump(scaleC);
    if (macros.fat !== prevMacros.current.fat) bump(scaleF);
    prevMacros.current = macros;
  }, [macros]);

  const kcalStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleKcal.value }] }));
  const pStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleP.value }] }));
  const cStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleC.value }] }));
  const fStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleF.value }] }));

  return (
    <View style={styles.liveNutri}>
      <View style={styles.liveTitle}>
        <View style={styles.pulseDot} />
        <Text style={styles.liveTitleText}>Live Nutrition</Text>
      </View>
      <View style={styles.liveGrid}>
        <View style={styles.liveCell}>
          <Animated.Text style={[styles.liveVal, { color: '#FFB36B' }, kcalStyle]}>
            {Math.round(macros.calories)}
          </Animated.Text>
          <Text style={styles.liveLabel}>Kcal</Text>
        </View>
        <View style={styles.liveCell}>
          <Animated.Text style={[styles.liveVal, { color: '#8B5CF6' }, pStyle]}>
            {Math.round(macros.protein)}g
          </Animated.Text>
          <Text style={styles.liveLabel}>Protein</Text>
        </View>
        <View style={styles.liveCell}>
          <Animated.Text style={[styles.liveVal, { color: '#5EEAD4' }, cStyle]}>
            {Math.round(macros.carbs)}g
          </Animated.Text>
          <Text style={styles.liveLabel}>Carbs</Text>
        </View>
        <View style={styles.liveCell}>
          <Animated.Text style={[styles.liveVal, { color: '#FF6B9D' }, fStyle]}>
            {Math.round(macros.fat)}g
          </Animated.Text>
          <Text style={styles.liveLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );
}

const CATEGORIES = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'fruits', label: 'Fruits' },
] as const;

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  selectedChips: Set<string>;
  selectedMacros: MacroNutrients;
  onToggleChip: (id: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function BottomMealSheet({
  bottomSheetRef,
  selectedChips,
  selectedMacros,
  onToggleChip,
  onSave,
  onClose,
}: Props) {
  const snapPoints = useMemo(() => ['50%', '84%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  const hasSelection = selectedChips.size > 0;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      {/* Header */}
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Build Your Meal</Text>
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.sheetBody}>
        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.chipGroup}>
            <Text style={styles.chipGroupTitle}>{cat.label}</Text>
            <View style={styles.chipRow}>
              {FOOD_CHIPS.filter((c) => c.category === cat.key).map((chip) => (
                <FoodChip
                  key={chip.id}
                  chip={chip}
                  isSelected={selectedChips.has(chip.id)}
                  onToggle={() => onToggleChip(chip.id)}
                />
              ))}
            </View>
          </View>
        ))}

        <LiveNutriCounter macros={selectedMacros} />

        <View style={{ height: 100 }} />
      </BottomSheetScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.saveBtn, !hasSelection && styles.saveBtnDisabled]}
          onPress={() => {
            if (!hasSelection) return;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSave();
          }}
        >
          <Text style={styles.saveBtnText}>
            {hasSelection ? `Save Meal (${selectedChips.size} items)` : 'Select items to save'}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#12101E',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: 36,
    height: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F5F6FA',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#A8ACC0',
  },
  sheetBody: {
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  chipGroup: {
    marginBottom: 18,
  },
  chipGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#6C7088',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  liveNutri: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(139,92,246,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    marginBottom: 16,
  },
  liveTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5EEAD4',
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  liveTitleText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#5EEAD4',
  },
  liveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  liveCell: {
    alignItems: 'center',
  },
  liveVal: {
    fontSize: 17,
    fontWeight: '800',
  },
  liveLabel: {
    fontSize: 9,
    color: '#6C7088',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 22,
    paddingBottom: 34,
    paddingTop: 14,
    backgroundColor: '#12101E',
  },
  saveBtn: {
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  saveBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
