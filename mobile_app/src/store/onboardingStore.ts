import { create } from 'zustand';

type Gender =
  | 'Male'
  | 'Female'
  | 'Other';

type Goal =
  | 'lose_fat'
  | 'maintain'
  | 'gain_muscle';

export type ActivityId =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'athlete';

interface OnboardingState {
  // User basics
  name: string;
  age: number;
  gender: Gender;

  // Metrics
  height: number;
  weight: number;

  // Goals
  goal: Goal;
  activityLevel: ActivityId;

  // Nutrition
  calories: number;
  protein: number;
  carbs: number;
  fats: number;

  // AI Insights
  insights: string[];

  // Completion
  onboardingCompleted: boolean;

  // Actions
  setName: (name: string) => void;

  setAge: (age: number) => void;

  setGender: (
    gender: Gender
  ) => void;

  setHeight: (
    height: number
  ) => void;

  setWeight: (
    weight: number
  ) => void;

  setGoal: (
    goal: Goal
  ) => void;

  setActivityLevel: (
    level: ActivityId
  ) => void;

  setNutrition: (
    calories: number,
    protein: number,
    carbs: number,
    fats: number
  ) => void;

  setInsights: (
    insights: string[]
  ) => void;

  setOnboardingCompleted: (
    value: boolean
  ) => void;

  reset: () => void;
}

export const useOnboardingStore =
  create<OnboardingState>((set) => ({
    // Defaults
    name: '',
    age: 0,
    gender: 'Male',

    height: 170,
    weight: 70,

    goal: 'maintain',
    activityLevel: 'moderate',

    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,

    insights: [],

    onboardingCompleted: false,

    // Actions
    setName: (name) =>
      set({ name }),

    setAge: (age) =>
      set({ age }),

    setGender: (gender) =>
      set({ gender }),

    setHeight: (height) =>
      set({ height }),

    setWeight: (weight) =>
      set({ weight }),

    setGoal: (goal) =>
      set({ goal }),

    setActivityLevel: (
      activityLevel
    ) =>
      set({ activityLevel }),

    setNutrition: (
      calories,
      protein,
      carbs,
      fats
    ) =>
      set({
        calories,
        protein,
        carbs,
        fats,
      }),

    setInsights: (
      insights
    ) =>
      set({ insights }),

    setOnboardingCompleted: (
      onboardingCompleted
    ) =>
      set({
        onboardingCompleted,
      }),

    reset: () =>
      set({
        name: '',
        age: 0,
        gender: 'Male',

        height: 170,
        weight: 70,

        goal: 'maintain',
        activityLevel: 'moderate',

        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,

        insights: [],

        onboardingCompleted: false,
      }),
  }));