import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  "http://192.168.1.4:8000/api";

/*
|--------------------------------------------------------------------------
| AUTH HEADER HELPER
|--------------------------------------------------------------------------
*/

const getAuthHeaders = async () => {
  const token =
    await AsyncStorage.getItem(
      "@auth_access_token"
    );
  console.log(
    "TRACKING TOKEN:",
    token
  );

  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
};

/*
|--------------------------------------------------------------------------
| ADD MEAL
|--------------------------------------------------------------------------
*/

export const addMeal = async (
  data: {
    food_id: number;
    grams: number;
    meal_type: string;
  }
) => {

  const headers =
    await getAuthHeaders();

  const res = await fetch(
    `${BASE_URL}/tracking/add/`,
    {
      method: "POST",

      headers,

      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    const errorText =
      await res.text();

    console.log(
      "ADD MEAL ERROR:",
      errorText
    );

    throw new Error(
      "Failed to add meal"
    );
  }

  return await res.json();
};

/*
|--------------------------------------------------------------------------
| TODAY MEALS
|--------------------------------------------------------------------------
*/

export const getTodayMeals =
  async () => {

    const headers =
      await getAuthHeaders();

    const res = await fetch(
      `${BASE_URL}/tracking/today/`,
      {
        method: "GET",
        headers,
      }
    );

    if (!res.ok) {
      const errorText =
        await res.text();

      console.log(
        "TODAY MEALS ERROR:",
        errorText
      );

      throw new Error(
        "Failed to fetch meals"
      );
    }

    return await res.json();
  };

/*
|--------------------------------------------------------------------------
| DAILY SUMMARY
|--------------------------------------------------------------------------
*/

export const getSummary =
  async () => {

    const headers =
      await getAuthHeaders();

    const res = await fetch(
      `${BASE_URL}/tracking/summary/`,
      {
        method: "GET",
        headers,
      }
    );

    if (!res.ok) {
      const errorText =
        await res.text();

      console.log(
        "SUMMARY ERROR:",
        errorText
      );

      throw new Error(
        "Failed to fetch summary"
      );
    }

    return await res.json();
  };