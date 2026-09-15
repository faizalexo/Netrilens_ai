import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Meal } from '../types/meal';

const SWIPE_COMPLETE_THRESHOLD = 80;
const SWIPE_DELETE_THRESHOLD = -80;

interface Props {
  meal: Meal;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export default function MealCard({ meal, isExpanded, onToggle, onComplete, onDelete }: Props) {
  const translateX = useSharedValue(0);
  const bodyHeight = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  // Update body expand/collapse
  React.useEffect(() => {
    bodyHeight.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    });
    chevronRotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 20,
      stiffness: 250,
    });
  }, [isExpanded]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const triggerComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const triggerDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.6;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_COMPLETE_THRESHOLD) {
        runOnJS(triggerHaptic)();
        runOnJS(triggerComplete)();
        translateX.value = withSpring(0);
      } else if (e.translationX < SWIPE_DELETE_THRESHOLD) {
        runOnJS(triggerHaptic)();
        runOnJS(triggerDelete)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const bodyAnimStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(bodyHeight.value, [0, 1], [0, 220], Extrapolation.CLAMP),
    opacity: bodyHeight.value,
  }));

  const chevronAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const swipeHintOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, 30, 60],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    ),
  }));

  const completeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 60], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, 60], [0.8, 1], Extrapolation.CLAMP) }],
  }));

  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-60, 0], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-60, 0], [1, 0.8], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={styles.outerContainer}>
      {/* Swipe action backgrounds */}
      <Animated.View style={[styles.swipeBgComplete, completeIndicatorStyle]}>
        <Text style={styles.swipeBgText}>✅ Complete</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeBgDelete, deleteIndicatorStyle]}>
        <Text style={styles.swipeBgText}>🗑 Delete</Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimStyle]}>
          {/* Header row */}
          <Pressable onPress={onToggle} style={styles.mealHead}>
            <View style={styles.mealIcon}>
              <Text style={styles.mealIconText}>{meal.icon}</Text>
            </View>
            <View style={styles.mealInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={[
                  styles.badge,
                  meal.status === 'completed' ? styles.badgeDone : styles.badgePending,
                ]}>
                  <Text style={[
                    styles.badgeText,
                    meal.status === 'completed' ? styles.badgeDoneText : styles.badgePendingText,
                  ]}>
                    {meal.status === 'completed' ? 'Completed' : 'Pending'}
                  </Text>
                </View>
              </View>
              <Text style={styles.mealItems} numberOfLines={1}>{meal.items}</Text>
              <View style={styles.macroPills}>
                <Text style={styles.macroPill}>
                  🔥 <Text style={styles.macroPillValue}>{meal.macros.calories}</Text> kcal
                </Text>
                <Text style={styles.macroPill}>
                  💪 <Text style={styles.macroPillValue}>{meal.macros.protein}g</Text> Protein
                </Text>
              </View>
            </View>
            <Animated.View style={[styles.chevron, isExpanded && styles.chevronExpanded, chevronAnimStyle]}>
              <Text style={styles.chevronText}>⌄</Text>
            </Animated.View>
          </Pressable>

          {/* Expandable body */}
          <Animated.View style={[styles.mealBody, bodyAnimStyle]}>
            <View style={styles.mealBodyInner}>
              <View style={styles.nutriGrid}>
                <NutriCell value={`${meal.macros.calories}`} label="Kcal" />
                <NutriCell value={`${meal.macros.protein}g`} label="Protein" />
                <NutriCell value={`${meal.macros.carbs}g`} label="Carbs" />
                <NutriCell value={`${meal.macros.fat}g`} label="Fat" />
              </View>
              <View style={styles.actionRow}>
                <Pressable style={styles.miniBtn} onPress={() => {}}>
                  <Text style={styles.miniBtnText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.miniBtn} onPress={() => {}}>
                  <Text style={styles.miniBtnText}>Replace</Text>
                </Pressable>
                <Pressable style={[styles.miniBtn, styles.miniBtnPrimary]} onPress={() => {}}>
                  <Text style={[styles.miniBtnText, styles.miniBtnPrimaryText]}>Duplicate</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function NutriCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.nutriCell}>
      <Text style={styles.nutriValue}>{value}</Text>
      <Text style={styles.nutriLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 12,
  },
  swipeBgComplete: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  swipeBgDelete: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  swipeBgText: {
    color: '#F5F6FA',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
  },
  mealHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  mealIconText: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  mealName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F6FA',
    letterSpacing: -0.1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDone: {
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  badgePending: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeDoneText: { color: '#4ADE80' },
  badgePendingText: { color: '#6C7088' },
  mealItems: {
    fontSize: 12.5,
    color: '#A8ACC0',
    marginTop: 3,
    lineHeight: 18,
  },
  macroPills: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 7,
  },
  macroPill: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8ACC0',
  },
  macroPillValue: {
    color: '#F5F6FA',
    fontWeight: '700',
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chevronExpanded: {
    backgroundColor: 'rgba(139,92,246,0.18)',
  },
  chevronText: {
    fontSize: 16,
    color: '#A8ACC0',
    lineHeight: 20,
  },
  mealBody: {
    overflow: 'hidden',
  },
  mealBodyInner: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  nutriGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  nutriCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  nutriValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5F6FA',
  },
  nutriLabel: {
    fontSize: 8.5,
    color: '#6C7088',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  miniBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#A8ACC0',
  },
  miniBtnPrimary: {
    backgroundColor: '#8B5CF6',
    borderColor: 'transparent',
  },
  miniBtnPrimaryText: {
    color: '#fff',
  },
});
