import AsyncStorage from
"@react-native-async-storage/async-storage";

// ========================================

export const logoutUser =
  async () => {

    try {

      console.log(
        "🚪 LOGGING OUT..."
      );

      await AsyncStorage.multiRemove([
        "@auth_access_token",
        "@auth_refresh_token",
        "@auth_user",
      ]);

      console.log(
        "✅ LOGOUT SUCCESS"
      );

    } catch (error) {

      console.log(
        "LOGOUT ERROR:",
        error
      );
    }
  };