import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";


Notifications.setNotificationHandler({

  handleNotification: async () => ({

    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export async function setupNotifications() {
  console.log("Setting up notifications...");
  const { status } =
    await Notifications.requestPermissionsAsync();
   console.log("Notification permission status:", status);
  if (status !== "granted") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    "default",
    {
      name: "default",
      importance:
        Notifications.AndroidImportance.HIGH,
    }
  );
}

export async function testNotification() {

  console.log("Testing notification...");

  try {

    await Notifications.scheduleNotificationAsync({

      content: {

        title: "🔥 Netrilens AI",

        body: "AAGYA AAGYA! TUMSE MILNE MAI AAGYA! 🥳",

        sound: true,
      },

      trigger: null,
    });

    console.log(
      "Notification Scheduled"
    );

  } catch (error) {

    console.log(
      "NOTIFICATION ERROR:",
      error
    );
  }
}


export async function scheduleStreakReminder() {

  await Notifications.scheduleNotificationAsync({

    content: {

      title:
        "🔥 Streak Protection",

      body:
        "Complete your nutrition goals before midnight.",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    } as any,
  });
}
export async function checkNutritionNotifications(
  calories: number,
  protein: number,
  goalCalories: number,
  goalProtein: number
) {

  const caloriePercent =
    calories / goalCalories;

  const proteinPercent =
    protein / goalProtein;

  // STREAK RISK

  if (
    caloriePercent < 0.7 ||
    proteinPercent < 0.7
  ) {

    await Notifications.scheduleNotificationAsync({

      content: {

        title:
          "🔥 Streak Protection",

        body:
          "Complete your nutrition goals before midnight.",
      },

      trigger: {
        seconds: 10,
      } as any,
    });
  }

  // GOAL COMPLETE

  if (
    caloriePercent >= 0.7 &&
    proteinPercent >= 0.7
  ) {

    await Notifications.scheduleNotificationAsync({

      content: {

        title:
          "🎉 Goal Achieved",

        body:
          "Today's streak requirements completed.",
      },

      trigger: {
        seconds: 5,
      } as any,
    });
  }
}

export async function sendStreakReminder() {

  const alreadySent =
    await AsyncStorage.getItem(
      "@today_streak_notification"
    );

  const today =
    new Date()
      .toDateString();

  if (
    alreadySent === today
  ) {
    return;
  }

  await Notifications.scheduleNotificationAsync({

    content: {

      title:
        "🔥 Streak Protection",

      body:
        "Complete your calories and protein goals before midnight.",
    },

    trigger: null,
  });

  await AsyncStorage.setItem(
    "@today_streak_notification",
    today
  );
}