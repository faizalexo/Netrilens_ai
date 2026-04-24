import API from "./api";

export const calculateNutrition = async (foodId, grams) => {
  const parsedGrams = Number(grams);

  if (!foodId) {
    throw new Error("Please select a food item.");
  }

  if (!Number.isFinite(parsedGrams) || parsedGrams < 0) {
    throw new Error("Please enter valid grams.");
  }

  const res = await API.post("nutrition/calculate/", {
    food_id: foodId,
    grams: parsedGrams,
  });

  return res.data;
};
