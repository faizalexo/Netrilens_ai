export const searchFood = async (query: string) => {
  const res = await fetch(
    `http://192.168.1.3:8000/api/food/search/?q=${query}`
  );

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
};