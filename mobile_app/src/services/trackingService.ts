export const addMeal = async (data: {
    
  food_id: number;
  grams: number;
  meal_type: string;
}) => {
  const res = await fetch("http://192.168.1.4:8000/api/tracking/add/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data), 
  });

  if (!res.ok) {
    throw new Error("Failed to add meal");
  }

  return res.json();
};

export const getTodayMeals = async () => {
  const res = await fetch("http://192.168.1.4:8000/api/tracking/today/");
  return res.json();
};

export const getSummary = async () => {
  const res = await fetch("http://192.168.1.4:8000/api/tracking/summary/");
  return res.json();
};