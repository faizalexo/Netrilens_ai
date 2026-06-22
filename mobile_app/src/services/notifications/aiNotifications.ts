import * as Notifications from "expo-notifications";
import { getSummary } from "@/src/services/trackingService";
import { getGoals } from "@/src/services/api";

export async function checkAIGoals() {
  try {

    const summary = await getSummary();
    const goals = await getGoals();

    const calories =
      summary?.totals?.calories ?? 0;

    const protein =
      summary?.totals?.protein ?? 0;

    const calorieGoal =
      goals?.calories ?? 0;

    const proteinGoal =
      goals?.protein ?? 0;

    const caloriePercent =
      calorieGoal > 0
        ? (calories / calorieGoal) * 100
        : 0;

    const proteinPercent =
      proteinGoal > 0
        ? (protein / proteinGoal) * 100
        : 0;

    // Protein Alert
    if (
      proteinPercent < 70
    ) {
      await sendProteinAlert(
        proteinGoal - protein
      );
    }

    // Calorie Alert
    if (
      caloriePercent < 60
    ) {
      await sendCalorieAlert(
        calorieGoal - calories
      );
    }

  } catch (error) {

    console.log(
      "AI GOAL CHECK ERROR:",
      error
    );
  }
}
async function sendProteinAlert(
  remainingProtein: number
) {

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        "💪 Protein Goal Alert",

      body:
        `You're ${Math.round(
          remainingProtein
        )}g away from today's protein target.`,

      sound: true,
    },

    trigger: null,
  });
}
async function sendCalorieAlert(
  remainingCalories: number
) {

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        "🎯 Nutrition Goal",

      body:
        `You're only ${Math.round(
          remainingCalories
        )} kcal away from today's goal.`,

      sound: true,
    },

    trigger: null,
  });
}
export async function scheduleAICheck() {

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        "🧠 AI Nutrition Review",

      body:
        "Checking today's goals...",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes.DAILY,

      hour: 18,

      minute: 0,
    },
  });
}