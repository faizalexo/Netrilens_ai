import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FoodChipData } from '../types/meal';

interface Props {
  chip: FoodChipData;
  isSelected: boolean;
  onToggle: () => void;
}

export default function FoodChip({ chip, isSelected, onToggle }: Props) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withSpring(1.08, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 14, stiffness: 300 })
      );
      glowOpacity.value = withSpring(1, { damping: 12 });
    } else {
      scale.value = withSpring(1, { damping: 14 });
      glowOpacity.value = withSpring(0, { damping: 12 });
    }
  }, [isSelected]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    Haptics.selectionAsync();
    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.chip, isSelected && styles.chipSelected, chipStyle]}>
        {/* Glow effect when selected */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Checkmark circle */}
        <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>

        <Text style={styles.emoji}>{chip.emoji}</Text>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>{chip.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    position: 'relative',
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: 'rgba(139,92,246,0.22)',
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  glow: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(139,92,246,0.08)',
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkMark: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#A8ACC0',
  },
  labelSelected: {
    color: '#fff',
  },
});
