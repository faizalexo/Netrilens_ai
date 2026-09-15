import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChecklistItem } from '../types/meal';

interface CheckboxProps {
  item: ChecklistItem;
  onToggle: () => void;
}

function CheckboxItem({ item, onToggle }: CheckboxProps) {
  const scale = useSharedValue(item.completed ? 1 : 0);
  const itemScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(item.completed ? 1 : 0, {
      damping: 15,
      stiffness: 300,
    });
    if (item.completed) {
      itemScale.value = withSequence(
        withSpring(1.04, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    }
  }, [item.completed]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const checkBoxStyle = useAnimatedStyle(() => ({
    backgroundColor: item.completed ? '#4ADE80' : 'transparent',
    borderColor: item.completed ? '#4ADE80' : 'rgba(255,255,255,0.18)',
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: itemScale.value }],
    backgroundColor: item.completed
      ? 'rgba(74,222,128,0.08)'
      : 'rgba(255,255,255,0.035)',
    borderColor: item.completed
      ? 'rgba(74,222,128,0.25)'
      : 'rgba(255,255,255,0.06)',
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.habitItem, containerStyle]}>
        <Animated.View style={[styles.habitCheck, checkBoxStyle]}>
          <Animated.Text style={[styles.checkMark, checkStyle]}>✓</Animated.Text>
        </Animated.View>
        <Text style={styles.habitName}>{item.emoji} {item.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

interface Props {
  checklist: ChecklistItem[];
  progress: { completed: number; total: number };
  onToggle: (id: string) => void;
}

export default function ChecklistCard({ checklist, progress, onToggle }: Props) {
  const barWidth = useSharedValue(0);
  const pct = (progress.completed / progress.total) * 100;

  useEffect(() => {
    barWidth.value = withTiming(pct, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <View style={styles.card}>
      {/* Progress header */}
      <View style={styles.progressTop}>
        <Text style={styles.progressTitle}>Today's habits</Text>
        <Text style={styles.progressFraction}>
          {progress.completed} / {progress.total}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, barStyle]} />
      </View>

      {/* Checklist grid */}
      <View style={styles.habitGrid}>
        {checklist.map((item) => (
          <CheckboxItem
            key={item.id}
            item={item}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A8ACC0',
  },
  progressFraction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5EEAD4',
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    shadowColor: '#5EEAD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    width: '47.5%',
  },
  habitCheck: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  checkMark: {
    fontSize: 12,
    color: '#0A0A0A',
    fontWeight: '800',
  },
  habitName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#A8ACC0',
    flex: 1,
  },
});
