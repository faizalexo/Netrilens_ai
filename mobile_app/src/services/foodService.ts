export const searchFood = async (query: string) => {
  const res = await fetch(
    `http://10.169.211.70:8000/api/food/search/?q=${query}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
};