// src/services/notifications/notificationService.ts

import * as Notifications from "expo-notifications";

export async function initializeNotifications() {
  const { status } =
    await Notifications.requestPermissionsAsync();

  console.log(
    "NOTIFICATION STATUS:",
    status
  );

  if (status !== "granted") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    "default",
    {
      name: "Default",
      importance:
        Notifications.AndroidImportance.HIGH,
    }
  );
}