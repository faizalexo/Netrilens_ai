import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { DayPlan, Meal } from '../types/meal';

interface DayChipProps {
  day: DayPlan;
  isActive: boolean;
  onPress: () => void;
}

function DayChip({ day, isActive, onPress }: DayChipProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: isActive ? -2 : 0 }],
  }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.92, {}, () => {
          scale.value = withSpring(1);
        });
        onPress();
      }}
    >
      <Animated.View style={[styles.dayChip, isActive && styles.dayChipActive, animStyle]}>
        <Text style={[styles.dayShort, isActive && styles.dayTextActive]}>{day.shortDay}</Text>
        <Text style={[styles.dayNum, isActive && styles.dayTextActive]}>{day.date}</Text>
        <View style={styles.dotRow}>
          <View style={[styles.dot, isActive && styles.dotActive]} />
          <View style={[styles.dot, isActive && styles.dotActive]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

interface TimelineItemProps {
  meal: Meal;
  drag: () => void;
  isActive: boolean;
}

function TimelineItem({ meal, drag, isActive }: TimelineItemProps) {
  return (
    <ScaleDecorator>
      <View style={[styles.tlItem, isActive && styles.tlItemDragging]}>
        <View style={styles.tlRail}>
          <View style={styles.tlNode} />
          <View style={styles.tlLine} />
        </View>
        <View style={styles.tlContent}>
          <View style={styles.tlText}>
            <Text style={styles.tlTitle}>{meal.icon} {meal.name}</Text>
            <Text style={styles.tlSub} numberOfLines={1}>{meal.items}</Text>
          </View>
          <Pressable
            onLongPress={drag}
            onPress={() => Haptics.selectionAsync()}
            style={styles.tlDragHandle}
            delayLongPress={200}
          >
            <Text style={styles.tlDragIcon}>⠿</Text>
          </Pressable>
        </View>
      </View>
    </ScaleDecorator>
  );
}

interface Props {
  weekDays: DayPlan[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export default function WeeklyPlanner({ weekDays, selectedDayIndex, onSelectDay }: Props) {
  const [meals, setMeals] = React.useState<Meal[]>(weekDays[selectedDayIndex].meals);

  React.useEffect(() => {
    setMeals(weekDays[selectedDayIndex].meals);
  }, [selectedDayIndex]);

  return (
    <View>
      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekScroll}
      >
        {weekDays.map((day, index) => (
          <DayChip
            key={day.day}
            day={day}
            isActive={index === selectedDayIndex}
            onPress={() => onSelectDay(index)}
          />
        ))}
      </ScrollView>

      {/* Draggable timeline */}
      <View style={styles.timelineCard}>
        <DraggableFlatList
          data={meals}
          keyExtractor={(item) => item.id}
          onDragBegin={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          onDragEnd={({ data }) => {
            setMeals(data);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          renderItem={({ item, drag, isActive }) => (
            <TimelineItem meal={item} drag={drag} isActive={isActive} />
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekScroll: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  dayChip: {
    width: 54,
    paddingVertical: 13,
    paddingBottom: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    gap: 6,
  },
  dayChipActive: {
    backgroundColor: '#8B5CF6',
    borderColor: 'transparent',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  dayShort: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C7088',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#A8ACC0',
  },
  dayTextActive: {
    color: '#fff',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  timelineCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingTop: 6,
    overflow: 'hidden',
  },
  tlItem: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  tlItemDragging: {
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: 16,
  },
  tlRail: {
    width: 18,
    alignItems: 'center',
  },
  tlNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  tlLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(139,92,246,0.35)',
    marginTop: 4,
  },
  tlContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  tlText: {
    flex: 1,
  },
  tlTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F5F6FA',
  },
  tlSub: {
    fontSize: 11.5,
    color: '#6C7088',
    marginTop: 2,
  },
  tlDragHandle: {
    padding: 6,
  },
  tlDragIcon: {
    fontSize: 16,
    color: '#454A5E',
  },
});
