import * as Notifications from "expo-notifications";

export async function scheduleMealReminders() {
  // Breakfast
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍳 Breakfast Time",
      body: "Start your day by logging breakfast.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  // Lunch
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍽 Lunch Time",
      body: "Track your lunch and stay on target.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 13,
      minute: 20,
    },
  });

  // Dinner
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌙 Dinner Reminder",
      body: "Complete today's nutrition log.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}