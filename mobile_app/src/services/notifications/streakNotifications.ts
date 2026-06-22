// src/services/notifications/streakNotifications.ts

import * as Notifications from "expo-notifications";

export async function scheduleStreakNotifications() {
  await cancelStreakNotifications();

  // 7 PM reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Protect Your Streak",
      body: "You haven't logged any meals today.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });

  // 10 PM final reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Last Chance",
      body: "Your streak will end tonight if you don't log a meal.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 22,
      minute: 0,
    },
  });
}

export async function cancelStreakNotifications() {
  const notifications =
    await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of notifications) {
    await Notifications.cancelScheduledNotificationAsync(
      notification.identifier
    );
  }
}