import { useState, useCallback } from 'react';
import {
  Meal,
  DailyProgress,
  ChecklistItem,
  FoodChipData,
  DayPlan,
} from '../types/meal';

const INITIAL_MEALS: Meal[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    icon: '🍳',
    items: '100g High Protein Oats · 150ml Milk',
    status: 'completed',
    macros: { calories: 520, protein: 25, carbs: 58, fat: 14 },
  },
  {
    id: 'lunch',
    name: 'Lunch',
    icon: '🍛',
    items: '3 Eggs · 2 Roti · Vegetables',
    status: 'pending',
    macros: { calories: 480, protein: 28, carbs: 46, fat: 18 },
  },
  {
    id: 'preworkout',
    name: 'Pre Workout',
    icon: '🏋️',
    items: 'Banana or Black Coffee',
    status: 'pending',
    macros: { calories: 110, protein: 2, carbs: 27, fat: 0 },
  },
  {
    id: 'dinner',
    name: 'Dinner',
    icon: '🌙',
    items: 'Chicken / Paneer / Soy · Rice · Mixed Veg',
    status: 'pending',
    macros: { calories: 390, protein: 41, carbs: 32, fat: 9 },
  },
];

const WEEK_DAYS: DayPlan[] = [
  { day: 'Monday', shortDay: 'Mon', date: 23, meals: INITIAL_MEALS },
  { day: 'Tuesday', shortDay: 'Tue', date: 24, meals: INITIAL_MEALS },
  { day: 'Wednesday', shortDay: 'Wed', date: 25, meals: INITIAL_MEALS },
  { day: 'Thursday', shortDay: 'Thu', date: 26, meals: INITIAL_MEALS },
  { day: 'Friday', shortDay: 'Fri', date: 27, meals: INITIAL_MEALS },
  { day: 'Saturday', shortDay: 'Sat', date: 28, meals: INITIAL_MEALS },
  { day: 'Sunday', shortDay: 'Sun', date: 29, meals: INITIAL_MEALS },
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'calories', label: 'Calories', emoji: '🔥', completed: true },
  { id: 'protein', label: 'Protein', emoji: '💪', completed: true },
  { id: 'water', label: 'Water', emoji: '💧', completed: true },
  { id: 'workout', label: 'Workout', emoji: '🏋️', completed: false },
  { id: 'steps', label: 'Steps', emoji: '👣', completed: false },
  { id: 'sleep', label: 'Sleep', emoji: '😴', completed: false },
];

const INITIAL_PROGRESS: DailyProgress = {
  calories: { current: 1500, target: 1500 },
  protein: { current: 96, target: 96 },
  water: { current: 2.4, target: 3 },
};

export const FOOD_CHIPS: FoodChipData[] = [
  // Protein
  { id: 'chicken', label: 'Chicken', emoji: '🍗', category: 'protein', macros: { calories: 220, protein: 38, carbs: 0, fat: 6 } },
  { id: 'paneer', label: 'Paneer', emoji: '🧀', category: 'protein', macros: { calories: 265, protein: 18, carbs: 4, fat: 20 } },
  { id: 'egg', label: 'Egg', emoji: '🥚', category: 'protein', macros: { calories: 155, protein: 13, carbs: 1, fat: 11 } },
  { id: 'fish', label: 'Fish', emoji: '🐟', category: 'protein', macros: { calories: 206, protein: 22, carbs: 0, fat: 12 } },
  { id: 'soy', label: 'Soy Chunks', emoji: '🫘', category: 'protein', macros: { calories: 172, protein: 18, carbs: 9, fat: 9 } },
  // Carbs
  { id: 'rice', label: 'Rice', emoji: '🍚', category: 'carbs', macros: { calories: 205, protein: 4, carbs: 45, fat: 0 } },
  { id: 'roti', label: 'Roti', emoji: '🫓', category: 'carbs', macros: { calories: 120, protein: 3, carbs: 22, fat: 2 } },
  { id: 'oats', label: 'Oats', emoji: '🥣', category: 'carbs', macros: { calories: 166, protein: 6, carbs: 28, fat: 4 } },
  { id: 'sweetpotato', label: 'Sweet Potato', emoji: '🍠', category: 'carbs', macros: { calories: 112, protein: 2, carbs: 26, fat: 0 } },
  // Vegetables
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦', category: 'vegetables', macros: { calories: 35, protein: 3, carbs: 7, fat: 0 } },
  { id: 'spinach', label: 'Spinach', emoji: '🥬', category: 'vegetables', macros: { calories: 23, protein: 3, carbs: 4, fat: 0 } },
  { id: 'beans', label: 'Beans', emoji: '🫛', category: 'vegetables', macros: { calories: 31, protein: 2, carbs: 7, fat: 0 } },
  { id: 'capsicum', label: 'Capsicum', emoji: '🫑', category: 'vegetables', macros: { calories: 20, protein: 1, carbs: 5, fat: 0 } },
  // Fruits
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'fruits', macros: { calories: 105, protein: 1, carbs: 27, fat: 0 } },
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'fruits', macros: { calories: 95, protein: 0, carbs: 25, fat: 0 } },
  { id: 'orange', label: 'Orange', emoji: '🍊', category: 'fruits', macros: { calories: 62, protein: 1, carbs: 15, fat: 0 } },
  { id: 'watermelon', label: 'Watermelon', emoji: '🍉', category: 'fruits', macros: { calories: 46, protein: 1, carbs: 11, fat: 0 } },
];

export function useMealPlanner() {
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [weekDays] = useState<DayPlan[]>(WEEK_DAYS);
  const [selectedDayIndex, setSelectedDayIndex] = useState(2);
  const [progress] = useState<DailyProgress>(INITIAL_PROGRESS);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());

  const toggleMealExpanded = useCallback((id: string) => {
    setExpandedMealId((prev) => (prev === id ? null : id));
  }, []);

  const completeMeal = useCallback((id: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'completed' } : m))
    );
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggleChecklist = useCallback((id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const toggleChip = useCallback((id: string) => {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearChips = useCallback(() => {
    setSelectedChips(new Set());
  }, []);

  const checklistProgress = {
    completed: checklist.filter((i) => i.completed).length,
    total: checklist.length,
  };

  const overallProgress =
    Math.round(
      ((progress.calories.current / progress.calories.target) * 0.5 +
        (progress.protein.current / progress.protein.target) * 0.3 +
        (progress.water.current / progress.water.target) * 0.2) *
        100
    );

  const selectedMacros = Array.from(selectedChips).reduce(
    (acc, id) => {
      const chip = FOOD_CHIPS.find((c) => c.id === id);
      if (chip) {
        acc.calories += chip.macros.calories;
        acc.protein += chip.macros.protein;
        acc.carbs += chip.macros.carbs;
        acc.fat += chip.macros.fat;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
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
  };
}
