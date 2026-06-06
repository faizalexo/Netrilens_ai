import AsyncStorage from
"@react-native-async-storage/async-storage";

// ========================================

export const logoutUser =
  async () => {

    try {

      console.log(
        "🚪 LOGGING OUT..."
      );
      await AsyncStorage.clear();

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