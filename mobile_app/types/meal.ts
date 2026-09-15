export type MealStatus = 'completed' | 'pending';

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  icon: string;
  items: string;
  status: MealStatus;
  macros: MacroNutrients;
}

export interface DayPlan {
  day: string;
  shortDay: string;
  date: number;
  meals: Meal[];
}

export interface FoodChipData {
  id: string;
  label: string;
  emoji: string;
  macros: MacroNutrients;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits';
}

export interface ChecklistItem {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

export interface DailyProgress {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  water: { current: number; target: number };
}
