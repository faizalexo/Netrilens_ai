import * as Notifications from "expo-notifications";

export async function scheduleWaterReminders() {

  // Remove old reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  const times = [
    { hour: 10, minute: 0 },
    { hour: 13, minute: 40},
    { hour: 16, minute: 25 },
    { hour: 19, minute: 0 },
  ];

  for (const time of times) {

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 Hydration Check",
        body: "Take a quick water break and stay hydrated.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    });
  }

  console.log("✅ Water reminders scheduled");
}